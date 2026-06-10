package expo.modules.kavachscreening

import android.Manifest
import android.app.Activity
import android.app.NotificationManager
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Native bridge for on-device call screening (Android 10+). Calls are screened
 * by [KavachCallScreeningService] once the user grants the system
 * call-screening role; this module manages the toggle state, the synced
 * blocklist/keywords, and the role request. SMS is handled in-app via the
 * share sheet (no READ_SMS), so `smsScreening` is state-only here.
 */
class KavachScreeningModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private var pendingRolePromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("KavachScreening")

    Events("onCallScreened", "onSmsScreened")

    OnCreate {
      current = this@KavachScreeningModule
    }

    OnDestroy {
      if (current === this@KavachScreeningModule) current = null
      pendingRolePromise = null
    }

    Function("isAvailable") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
    }

    Function("getStatus") {
      buildStatus()
    }

    Function("setCallScreeningEnabled") { enabled: Boolean ->
      ScreeningStore.setCallEnabled(context, enabled)
    }

    Function("setSmsScreeningEnabled") { enabled: Boolean ->
      ScreeningStore.setSmsEnabled(context, enabled)
    }

    Function("syncBlocklist") { numbers: List<String> ->
      ScreeningStore.setBlocklist(context, numbers)
    }

    Function("syncKeywords") { keywords: List<String> ->
      ScreeningStore.setKeywords(context, keywords)
    }

    Function("syncLanguage") { code: String ->
      ScreeningStore.setLanguage(context, code)
    }

    Function("syncApiConfig") { baseUrl: String, token: String? ->
      ScreeningStore.setApiConfig(context, baseUrl, token ?: "")
    }

    // Accept the ringing call (the popup's "Answer" button). Requires the
    // ANSWER_PHONE_CALLS runtime permission; returns false if unavailable so the
    // JS screen can still dismiss gracefully.
    Function("answerCall") {
      KavachTelecom.answer(context)
    }

    // End the current ringing/active call (the popup's "Block" button). Requires
    // ANSWER_PHONE_CALLS (API 28+); returns false if unavailable.
    Function("endCall") {
      KavachTelecom.end(context)
    }

    // The latest screened incoming call recorded natively (by the overlay), so
    // JS can surface the Play-safe post-call prompt for ANY screened call — not
    // only ones answered through the in-app alert. Null when there's nothing pending.
    Function("getPendingScreenedCall") {
      ScreeningStore.getPendingCall(context)
    }

    Function("clearPendingScreenedCall") {
      ScreeningStore.clearPendingCall(context)
    }

    // Persist a number to the on-device blocklist so future calls from it are
    // silently rejected by the screening service (no extra permission needed).
    Function("blockNumber") { number: String ->
      ScreeningStore.addToBlocklist(context, number)
    }

    // The numbers the user blocked manually, for the in-app "Blocked numbers"
    // screen. Engine-derived high-risk numbers are managed automatically and are
    // excluded so the user only sees (and can undo) their own blocks.
    Function("getBlockedNumbers") {
      ScreeningStore.getUserBlocklist(context).sorted()
    }

    // Remove a user-blocked number — the in-app Unblock action.
    Function("unblockNumber") { number: String ->
      ScreeningStore.removeFromUserBlock(context, number)
    }

    AsyncFunction("requestCallScreeningRole") { promise: Promise ->
      requestCallScreeningRole(promise)
    }

    AsyncFunction("requestOverlayPermission") { promise: Promise ->
      val ctx = context
      if (KavachCallOverlay.canDraw(ctx)) {
        promise.resolve(true)
        return@AsyncFunction
      }
      // Opens the system "Display over other apps" screen. The grant happens
      // out-of-process, so we resolve the current (still-false) state; the JS
      // screen re-reads getStatus() when it regains focus.
      try {
        val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:" + ctx.packageName)
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        (appContext.currentActivity ?: ctx).startActivity(intent)
      } catch (_: Throwable) {
        // No settings activity to handle the intent — nothing more to do.
      }
      promise.resolve(false)
    }

    AsyncFunction("requestFullScreenIntentPermission") { promise: Promise ->
      val ctx = context
      // Pre-Android 14 the permission is granted by manifest declaration alone.
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        promise.resolve(true)
        return@AsyncFunction
      }
      val mgr = ctx.getSystemService(NotificationManager::class.java)
      if (mgr != null && mgr.canUseFullScreenIntent()) {
        promise.resolve(true)
        return@AsyncFunction
      }
      // Opens the per-app "full-screen notifications" settings screen. The grant
      // happens out-of-process, so we resolve the current (still-false) state;
      // the JS screen re-reads getStatus() when it regains focus.
      try {
        val intent = Intent(
          Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT,
          Uri.parse("package:" + ctx.packageName)
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        (appContext.currentActivity ?: ctx).startActivity(intent)
      } catch (_: Throwable) {
        // No settings activity to handle the intent — nothing more to do.
      }
      promise.resolve(false)
    }

    AsyncFunction("requestBatteryOptimizationExemption") { promise: Promise ->
      val ctx = context
      if (isIgnoringBatteryOptimizations(ctx)) {
        promise.resolve(true)
        return@AsyncFunction
      }
      // Open the system battery-optimization list (NOT the per-app prompt) so we
      // don't need the Play-restricted REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
      // permission. The grant happens out-of-process; we resolve the current
      // (still-false) state and JS re-reads getStatus() on focus.
      try {
        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        (appContext.currentActivity ?: ctx).startActivity(intent)
      } catch (_: Throwable) {
        // No settings activity to handle the intent — nothing more to do.
      }
      promise.resolve(false)
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == ROLE_REQUEST_CODE) {
        val granted = payload.resultCode == Activity.RESULT_OK
        pendingRolePromise?.resolve(granted)
        pendingRolePromise = null
      }
    }
  }

  private fun buildStatus(): Map<String, Any> {
    val ctx = context
    return mapOf(
      "callScreening" to ScreeningStore.isCallEnabled(ctx),
      "smsScreening" to ScreeningStore.isSmsEnabled(ctx),
      "hasCallRole" to hasCallRole(ctx),
      "hasSmsPermission" to false,
      "hasNotificationPermission" to hasNotificationPermission(ctx),
      "hasFullScreenIntentPermission" to hasFullScreenIntentPermission(ctx),
      "hasOverlayPermission" to KavachCallOverlay.canDraw(ctx),
      "hasAnswerCallsPermission" to KavachTelecom.hasPermission(ctx),
      "isIgnoringBatteryOptimizations" to isIgnoringBatteryOptimizations(ctx),
      "blocklistSize" to ScreeningStore.getBlocklist(ctx).size,
      "keywordCount" to ScreeningStore.getKeywords(ctx).size
    )
  }

  /**
   * Whether the OS has exempted Netraksh from battery optimization. When it
   * hasn't, aggressive OEM Doze can kill the call-screening service so incoming
   * calls aren't flagged — hence the in-app "keep running" prompt. Reading this
   * needs no special permission.
   */
  private fun isIgnoringBatteryOptimizations(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
    val pm = ctx.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return false
    return try {
      pm.isIgnoringBatteryOptimizations(ctx.packageName)
    } catch (_: Throwable) {
      false
    }
  }

  private fun hasCallRole(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
    val rm = ctx.getSystemService(Context.ROLE_SERVICE) as? RoleManager ?: return false
    return rm.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING) &&
      rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
  }

  private fun hasNotificationPermission(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true
    return ContextCompat.checkSelfPermission(
      ctx,
      Manifest.permission.POST_NOTIFICATIONS
    ) == PackageManager.PERMISSION_GRANTED
  }

  /**
   * Whether the full-screen-intent notification can actually launch full-screen.
   * Android 14 (API 34) revokes USE_FULL_SCREEN_INTENT by default for apps that
   * aren't default dialers/alarm clocks, downgrading our locked-screen alert to a
   * heads-up. Pre-14 the manifest declaration alone is sufficient.
   */
  private fun hasFullScreenIntentPermission(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true
    val mgr = ctx.getSystemService(NotificationManager::class.java) ?: return false
    return mgr.canUseFullScreenIntent()
  }

  private fun requestCallScreeningRole(promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      promise.resolve(false)
      return
    }
    val ctx = context
    val rm = ctx.getSystemService(Context.ROLE_SERVICE) as? RoleManager
    if (rm == null || !rm.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
      promise.resolve(false)
      return
    }
    if (rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
      promise.resolve(true)
      return
    }
    val activity = appContext.currentActivity
    if (activity == null) {
      promise.reject("ERR_NO_ACTIVITY", "No foreground activity to request the role.", null)
      return
    }
    // Resolve any earlier in-flight request as failed before starting a new one.
    pendingRolePromise?.resolve(false)
    pendingRolePromise = promise
    try {
      val intent = rm.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
      activity.startActivityForResult(intent, ROLE_REQUEST_CODE)
    } catch (e: Exception) {
      // Launch failed (e.g. no handling activity) — never leave the JS promise hanging.
      pendingRolePromise = null
      promise.resolve(false)
    }
  }

  private fun emitCallScreened(number: String, blocked: Boolean) {
    sendEvent("onCallScreened", mapOf("number" to number, "blocked" to blocked))
  }

  companion object {
    private const val ROLE_REQUEST_CODE = 0xCA11
    private var current: KavachScreeningModule? = null

    /** Bridges a screened call from the background service to JS listeners. */
    fun notifyCallScreened(number: String, blocked: Boolean) {
      current?.emitCallScreened(number, blocked)
    }
  }
}
