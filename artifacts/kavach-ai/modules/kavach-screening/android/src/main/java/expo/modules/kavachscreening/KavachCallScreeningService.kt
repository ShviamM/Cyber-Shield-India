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
 * Warns about incoming calls. Netraksh NEVER auto-blocks a call based on its own
 * scam reputation — it only surfaces the full-screen caller screen and leaves the
 * Answer/Block decision to the user. The single exception is a number the user
 * has EXPLICITLY added to their personal blocklist: that is a deliberate user
 * action, so we honor it by rejecting the call. Reputation alone never rejects.
 *
 * On every incoming call, when "Display over other apps" is granted we draw the
 * native [KavachCallOverlay] directly — it appears instantly over the dialer /
 * lock screen without cold-starting React Native, and does its own reputation
 * lookup. When the overlay permission is missing we fall back to a
 * full-screen-intent notification that opens the in-app React caller screen
 * (`app/call-alert.tsx`) via the `kavach-ai://call-alert?number=<n>` deep link.
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
    KavachScreeningModule.notifyCallScreened(number, false)
  }

  /**
   * Surface the incoming-call alert. When we can draw over other apps, the
   * native overlay is the primary path — it renders instantly without launching
   * React Native. When that permission is missing we fall back to a
   * full-screen-intent notification that opens the in-app caller screen.
   */
  private fun launchCallScreen(ctx: Context, number: String) {
    // The native overlay is the primary path, but if it can't draw (permission
    // missing) or fails to attach at runtime (OEM restrictions, bad window
    // state), fall back to the full-screen-intent notification so the user is
    // never left with a silently-screened call and no visible alert.
    if (KavachCallOverlay.canDraw(ctx) && KavachCallOverlay.show(ctx, number)) {
      return
    }
    postFullScreenAlert(ctx, number, buildDeepLinkIntent(ctx, number))
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
