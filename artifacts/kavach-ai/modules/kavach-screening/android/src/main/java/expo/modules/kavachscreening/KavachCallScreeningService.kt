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
    val ctx = applicationContext
    val enabled = ScreeningStore.isCallEnabled(ctx)

    // Only react to incoming calls (callDirection is API 29+).
    val isIncoming = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
      callDetails.callDirection == Call.Details.DIRECTION_INCOMING
    val number = callDetails.handle?.schemeSpecificPart

    // A number the user explicitly blocked is silently rejected here — the only
    // case where we touch the call. Everything else is allowed through untouched.
    if (enabled && isIncoming && number != null && ScreeningStore.isBlocked(ctx, number)) {
      respondToCall(
        callDetails,
        CallResponse.Builder()
          .setDisallowCall(true)
          .setRejectCall(true)
          .setSkipNotification(true)
          .build()
      )
      KavachScreeningModule.notifyCallScreened(number, true)
      return
    }

    // Allow the call through untouched — an empty response neither blocks the
    // call, skips the call log, nor silences the ringer.
    respondToCall(callDetails, CallResponse.Builder().build())

    if (!enabled || !isIncoming || number == null) return

    launchCallScreen(ctx, number)
    // A quiet, persistent "report this call" notification posted now survives
    // the call, giving a Play-compliant post-call reporting moment. (Android
    // exposes no compliant call-ended hook without restricted call-state
    // permissions, so we post at screen-time and let it linger in the shade.)
    postCallReportPrompt(ctx, number)
    KavachScreeningModule.notifyCallScreened(number, false)
  }

  companion object {
    const val CHANNEL_ID = "kavach_screening_alerts"
    const val REPORT_CHANNEL_ID = "kavach_call_report"

    /**
     * Launch Netraksh's full-screen caller screen for [number]. Tries a direct
     * activity start (allowed from the background while we hold the overlay
     * permission) and always posts a full-screen-intent notification as a robust
     * fallback (locked screen / throttled background starts).
     *
     * Exposed on the companion so [KavachScreeningModule]'s "Send test alert"
     * self-test can fire the exact same experience a real call produces.
     */
    fun launchCallScreen(ctx: Context, number: String) {
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
     * screen. On a locked/dozing device Android launches it full-screen;
     * otherwise it shows as a heads-up the user can tap.
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
        // Show full content on the lock screen so the caller card fronts reliably.
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
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

    /**
     * Post a quiet, dismissible "report this call" notification. It is posted at
     * screen-time but is deliberately low-importance (no sound/heads-up) so it
     * doesn't intrude during the call — it simply waits in the shade so the user
     * can report the caller right after hanging up. Tapping it opens the one-tap
     * post-call report (`app/report-call.tsx`) with the number prefilled.
     *
     * This is the Play-compliant substitute for a true post-call popup: Android
     * has no call-ended callback we can use without restricted call-state
     * permissions (READ_PHONE_STATE etc.), which Netraksh deliberately avoids.
     */
    private fun postCallReportPrompt(ctx: Context, number: String) {
      ensureChannels(ctx)

      val encoded = URLEncoder.encode(number, "UTF-8")
      val deepLink = Intent(
        Intent.ACTION_VIEW,
        Uri.parse("kavach-ai://report-call?number=$encoded"),
      ).apply {
        setPackage(ctx.packageName)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      val flags = PendingIntent.FLAG_UPDATE_CURRENT or
        (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
      // A distinct request code from the full-screen alert so the two
      // notifications for the same number don't overwrite each other's intents.
      val pending = PendingIntent.getActivity(ctx, number.hashCode() xor 0x5247, deepLink, flags)

      val notification = NotificationCompat.Builder(ctx, REPORT_CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_menu_report_image)
        .setContentTitle("Was this call a scam?")
        .setContentText("Tap to report $number and help protect others.")
        .setPriority(NotificationCompat.PRIORITY_LOW)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setAutoCancel(true)
        .setContentIntent(pending)
        .build()
      try {
        // A separate notification id namespace from the full-screen alert.
        NotificationManagerCompat.from(ctx).notify(number.hashCode() xor 0x5247, notification)
      } catch (_: SecurityException) {
        // POST_NOTIFICATIONS not granted yet — nothing more we can do here.
      }
    }

    private fun ensureChannel(ctx: Context) = ensureChannels(ctx)

    private fun ensureChannels(ctx: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
      val mgr = ctx.getSystemService(NotificationManager::class.java) ?: return
      if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
        val channel = NotificationChannel(
          CHANNEL_ID,
          "Scam call alerts",
          NotificationManager.IMPORTANCE_HIGH
        ).apply {
          description = "Shows Netraksh's caller screen when someone calls you."
          lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        }
        mgr.createNotificationChannel(channel)
      }
      if (mgr.getNotificationChannel(REPORT_CHANNEL_ID) == null) {
        val reportChannel = NotificationChannel(
          REPORT_CHANNEL_ID,
          "Report a call",
          NotificationManager.IMPORTANCE_LOW
        ).apply {
          description = "Lets you report a caller as scam/spam after the call ends."
          lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        }
        mgr.createNotificationChannel(reportChannel)
      }
    }
  }

  private fun launchCallScreen(ctx: Context, number: String) =
    Companion.launchCallScreen(ctx, number)
}
