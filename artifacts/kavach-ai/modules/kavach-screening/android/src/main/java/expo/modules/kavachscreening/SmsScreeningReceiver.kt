package expo.modules.kavachscreening

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Telephony
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import org.json.JSONObject

/**
 * Checks every incoming SMS for scam signs, the way Truecaller's SMS
 * protection does, and posts a warning notification when one looks like fraud.
 *
 * Privacy: the message text is analysed on the phone ([SmsScamDetector]) and is
 * never uploaded. Only a link found in a suspicious-looking message is sent to
 * the Netraksh API (`/api/sms/link-check`), so it can be checked against the
 * phishing-domain feed and community reports.
 *
 * Runs only when the user switched SMS protection on and granted RECEIVE_SMS.
 */
class SmsScreeningReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
    val ctx = context.applicationContext
    if (!ScreeningStore.isSmsEnabled(ctx)) return

    val parts = try {
      Telephony.Sms.Intents.getMessagesFromIntent(intent)
    } catch (e: Exception) {
      Log.w(TAG, "Couldn't read SMS", e)
      return
    } ?: return

    // A long SMS arrives in parts; join them per sender.
    val bySender = linkedMapOf<String, StringBuilder>()
    for (m in parts) {
      val sender = m?.originatingAddress ?: continue
      bySender.getOrPut(sender) { StringBuilder() }.append(m.messageBody ?: "")
    }
    if (bySender.isEmpty()) return

    val pending = goAsync()
    Thread {
      try {
        for ((sender, body) in bySender) screen(ctx, sender, body.toString())
      } catch (e: Exception) {
        Log.w(TAG, "SMS screening failed", e)
      } finally {
        pending.finish()
      }
    }.start()
  }

  private fun screen(ctx: Context, sender: String, body: String) {
    var verdict = SmsScamDetector.analyze(
      sender,
      body,
      ScreeningStore.getBlocklist(ctx),
      ScreeningStore.getKeywords(ctx),
    )

    // A link in a message that already looks off is checked with the server
    // (phishing feed + community reports). Only the link is sent, never the text.
    var linkFlagged = false
    val link = verdict.links.firstOrNull()
    if (link != null && verdict.level != SmsScamDetector.Level.HIGH &&
      (verdict.level == SmsScamDetector.Level.MEDIUM ||
        SmsScamDetector.senderType(sender) != SmsScamDetector.SenderType.BUSINESS)
    ) {
      when (checkLinkWithServer(ctx, link)) {
        "high" -> { linkFlagged = true; verdict = verdict.copy(level = SmsScamDetector.Level.HIGH) }
        "medium" -> if (verdict.level == SmsScamDetector.Level.NONE) {
          linkFlagged = true
          verdict = verdict.copy(level = SmsScamDetector.Level.MEDIUM)
        }
      }
    }

    if (verdict.level == SmsScamDetector.Level.NONE) return
    postWarning(ctx, sender, body, verdict, linkFlagged)
    KavachScreeningModule.notifySmsScreened(sender, verdict.level.name.lowercase())
  }

  /** Returns the server's risk level for [link], or null if it couldn't be checked. */
  private fun checkLinkWithServer(ctx: Context, link: String): String? {
    val base = ScreeningStore.getApiBaseUrl(ctx)
    val token = ScreeningStore.getAuthToken(ctx)
    if (base.isEmpty() || token.isEmpty()) return null
    var conn: HttpURLConnection? = null
    return try {
      conn = (URL("$base/api/sms/link-check").openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 4_000
        readTimeout = 5_000
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
        setRequestProperty("Authorization", "Bearer $token")
      }
      conn.outputStream.use { it.write(JSONObject().put("url", link).toString().toByteArray(Charsets.UTF_8)) }
      if (conn.responseCode !in 200..299) return null
      val json = JSONObject(conn.inputStream.bufferedReader().use { it.readText() })
      json.optString("riskLevel", "").ifEmpty { null }
    } catch (e: Exception) {
      Log.w(TAG, "Link check failed", e)
      null
    } finally {
      conn?.disconnect()
    }
  }

  private fun postWarning(
    ctx: Context,
    sender: String,
    body: String,
    verdict: SmsScamDetector.Verdict,
    linkFlagged: Boolean,
  ) {
    ensureChannel(ctx)
    val hindi = ScreeningStore.getLanguage(ctx).startsWith("hi")
    val high = verdict.level == SmsScamDetector.Level.HIGH
    val title = when {
      hindi && high -> "ठगी वाला SMS: $sender"
      hindi -> "संदिग्ध SMS: $sender"
      high -> "Scam SMS from $sender"
      else -> "Suspicious SMS from $sender"
    }
    val reason = reasonText(verdict, linkFlagged, hindi)
    val advice = if (hindi) "लिंक न खोलें, OTP या पैसे न भेजें। जाँचने के लिए टैप करें।"
    else "Don't open links or share OTP or money. Tap to check."

    // Tapping opens the Verify tab with the message pre-filled.
    val q = URLEncoder.encode(body.take(1500), "UTF-8")
    val deepLink = Intent(Intent.ACTION_VIEW, Uri.parse("kavach-ai://verify?kind=message&q=$q")).apply {
      setPackage(ctx.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    val id = (sender + body).hashCode()
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
    val pending = PendingIntent.getActivity(ctx, id, deepLink, flags)

    val notification = NotificationCompat.Builder(ctx, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setContentTitle(title)
      .setContentText(reason)
      .setStyle(NotificationCompat.BigTextStyle().bigText("$reason\n$advice"))
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_MESSAGE)
      .setAutoCancel(true)
      .setContentIntent(pending)
      .build()
    try {
      NotificationManagerCompat.from(ctx).notify(id, notification)
    } catch (_: SecurityException) {
      // Notifications not allowed.
    }
  }

  private fun reasonText(v: SmsScamDetector.Verdict, linkFlagged: Boolean, hindi: Boolean): String {
    val r = v.reasons
    return when {
      linkFlagged -> if (hindi) "इस मैसेज का लिंक ठगी/फ़िशिंग के रूप में दर्ज है।" else "The link in this message is a known phishing or scam site."
      SmsScamDetector.Reason.SENDER_REPORTED in r -> if (hindi) "यह नंबर ठगी के लिए रिपोर्ट किया गया है।" else "This sender has been reported for fraud."
      SmsScamDetector.Reason.APK_LINK in r -> if (hindi) "मैसेज में ऐप (APK) इंस्टॉल करने का लिंक है।" else "It asks you to install an app (APK) from a link."
      SmsScamDetector.Reason.ASKS_FOR_OTP in r -> if (hindi) "यह आपसे OTP माँग रहा है।" else "It asks you to share an OTP."
      SmsScamDetector.Reason.PERSONAL_NUMBER_WITH_LINK in r -> if (hindi) "निजी नंबर से आया लिंक, जैसा ठग भेजते हैं।" else "A link from a personal number, a common scam pattern."
      SmsScamDetector.Reason.UPI_COLLECT in r -> if (hindi) "पैसे \"पाने\" के लिए UPI PIN माँगा जा रहा है।" else "It asks for your UPI PIN to \"receive\" money."
      else -> if (hindi) "इसमें ठगी जैसे शब्द हैं (KYC, ब्लॉक, इनाम)।" else "It uses common scam wording (KYC, blocked, prize)."
    }
  }

  private fun ensureChannel(ctx: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val nm = ctx.getSystemService(NotificationManager::class.java) ?: return
    if (nm.getNotificationChannel(CHANNEL_ID) != null) return
    nm.createNotificationChannel(
      NotificationChannel(CHANNEL_ID, "Scam SMS warnings", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "Warns when an incoming text message looks like a scam"
      },
    )
  }

  companion object {
    private const val TAG = "KavachSms"
    const val CHANNEL_ID = "kavach_sms_alerts"
  }
}
