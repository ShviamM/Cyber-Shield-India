package expo.modules.kavachscreening

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.net.URLEncoder

/**
 * Warns about incoming calls. By design this NEVER blocks, rejects, or silences
 * a call — it surfaces Netraksh's full-screen caller screen, keeping the user in
 * control (they still tap Answer/Block themselves).
 *
 * On every incoming call it launches the in-app React screen
 * (`app/call-alert.tsx`, the same screen shown by the home-screen DEMO) via the
 * `kavach-ai://call-alert?number=<n>` deep link. When "Display over other apps"
 * is granted we start the activity directly so it appears immediately; we also
 * post a full-screen-intent notification so the screen still launches on a
 * locked device and as a tap fallback when the activity start is throttled.
 *
 * The React screen does the live reputation lookup itself (report count, risk
 * level, top scam category) for the real caller number.
 */
class KavachCallScreeningService : CallScreeningService() {
  override fun onScreenCall(callDetails: Call.Details) {
    // Allow every call through untouched — an empty response neither blocks the
    // call, skips the call log, nor silences the ringer.
    respondToCall(callDetails, CallResponse.Builder().build())

    val ctx = applicationContext
    if (!ScreeningStore.isCallEnabled(ctx)) return

    // Only react to incoming calls (callDirection is API 29+).
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
      callDetails.callDirection != Call.Details.DIRECTION_INCOMING
    ) {
      return
    }

    val number = callDetails.handle?.schemeSpecificPart ?: return
    val blocked = ScreeningStore.isBlocked(ctx, number)

    launchCallScreen(ctx, number)
    KavachScreeningModule.notifyCallScreened(number, blocked)
  }

  /**
   * Launch Netraksh's full-screen caller screen for an incoming call. Tries a
   * direct activity start (allowed from the background while we hold the overlay
   * permission) and always posts a full-screen-intent notification as a robust
   * fallback (locked screen / throttled background starts).
   */
  private fun launchCallScreen(ctx: Context, number: String) {
    val intent = buildDeepLinkIntent(ctx, number)

    if (KavachCallOverlay.canDraw(ctx)) {
      try {
        ctx.startActivity(intent)
      } catch (_: Throwable) {
        // Background start refused — the full-screen-intent notification covers us.
      }
    }

    postFullScreenAlert(ctx, number, intent)
  }

  private fun buildDeepLinkIntent(ctx: Context, number: String): Intent {
    val encoded = URLEncoder.encode(number, "UTF-8")
    return Intent(
      Intent.ACTION_VIEW,
      Uri.parse("kavach-ai://call-alert?number=$encoded"),
    ).apply {
      setPackage(ctx.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
  }

  /**
   * A high-priority call notification whose full-screen intent opens the caller
   * screen. On a locked/dozing device Android launches it full-screen; otherwise
   * it shows as a heads-up the user can tap.
   */
  private fun postFullScreenAlert(ctx: Context, number: String, deepLink: Intent) {
    ensureChannel(ctx)

    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
    val pending = PendingIntent.getActivity(ctx, number.hashCode(), deepLink, flags)

    val notification = NotificationCompat.Builder(ctx, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setContentTitle("Incoming call — Netraksh")
      .setContentText("Tap to see scam-protection details for $number.")
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setAutoCancel(true)
      .setFullScreenIntent(pending, true)
      .setContentIntent(pending)
      .build()
    try {
      NotificationManagerCompat.from(ctx).notify(number.hashCode(), notification)
    } catch (_: SecurityException) {
      // POST_NOTIFICATIONS not granted yet — nothing more we can do here.
    }
  }

  private fun ensureChannel(ctx: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val mgr = ctx.getSystemService(NotificationManager::class.java) ?: return
    if (mgr.getNotificationChannel(CHANNEL_ID) != null) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Scam call alerts",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Shows Netraksh's caller screen when someone calls you."
    }
    mgr.createNotificationChannel(channel)
  }

  companion object {
    private const val CHANNEL_ID = "kavach_screening_alerts"
  }
}
