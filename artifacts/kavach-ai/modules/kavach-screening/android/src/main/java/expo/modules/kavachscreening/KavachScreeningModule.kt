package expo.modules.kavachscreening

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.NotificationManager
import android.app.role.RoleManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.telecom.TelecomManager
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
      answerRingingCall(context)
    }

    // End the current ringing/active call (the popup's "Block" button). Requires
    // ANSWER_PHONE_CALLS (API 28+); returns false if unavailable.
    Function("endCall") {
      endOngoingCall(context)
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

    // Fire the exact caller-alert experience a real incoming call produces, using
    // a demo number, so the user can lock their phone and confirm the popup
    // actually fronts on THEIR device/OEM. Returns false off a supported build.
    Function("sendTestAlert") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return@Function false
      KavachCallScreeningService.launchCallScreen(context, TEST_ALERT_NUMBER)
      true
    }

    // Open the system battery-optimization settings list so the user can mark
    // Netraksh as "unrestricted". Uses the settings-list intent (not the direct
    // REQUEST_IGNORE_BATTERY_OPTIMIZATIONS prompt) so no Play-restricted
    // permission is needed. Resolves the current exemption state.
    AsyncFunction("requestDisableBatteryOptimization") { promise: Promise ->
      val ctx = context
      if (isIgnoringBatteryOptimizations(ctx)) {
        promise.resolve(true)
        return@AsyncFunction
      }
      try {
        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        (appContext.currentActivity ?: ctx).startActivity(intent)
      } catch (_: Throwable) {
        // No settings activity — fall back to the app's detail page.
        openAppDetailsSettings(ctx)
      }
      promise.resolve(false)
    }

    // Open the OEM-specific autostart / background-launch manager so the screening
    // service survives aggressive battery managers (MIUI/ColorOS/Funtouch/etc.).
    // Tries known component names for the running manufacturer, falling back to
    // the app's system settings page. Resolves true if an activity was launched.
    AsyncFunction("openAutoStartSettings") { promise: Promise ->
      promise.resolve(openAutoStartSettings(context))
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
      "hasAnswerCallsPermission" to hasAnswerCallsPermission(ctx),
      "isIgnoringBatteryOptimizations" to isIgnoringBatteryOptimizations(ctx),
      "manufacturer" to (Build.MANUFACTURER ?: ""),
      "blocklistSize" to ScreeningStore.getBlocklist(ctx).size,
      "keywordCount" to ScreeningStore.getKeywords(ctx).size
    )
  }

  /**
   * Whether Netraksh is exempt from battery optimization. When it isn't,
   * aggressive OEM power managers may freeze/kill the call-screening process so
   * the caller popup never appears — the #1 cause of cross-OEM unreliability.
   */
  private fun isIgnoringBatteryOptimizations(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
    val pm = ctx.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return false
    return pm.isIgnoringBatteryOptimizations(ctx.packageName)
  }

  /** Open the app's own system settings page (autostart/battery fallback). */
  private fun openAppDetailsSettings(ctx: Context) {
    try {
      val intent = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.parse("package:" + ctx.packageName)
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      (appContext.currentActivity ?: ctx).startActivity(intent)
    } catch (_: Throwable) {
      // Nothing else we can do.
    }
  }

  /**
   * Launch the OEM-specific "autostart" / "background launch" manager. These
   * screens live in each vendor's security app under non-standard component
   * names; we try the known ones for the running manufacturer and fall back to
   * the app's system settings page. Returns true if an activity was started.
   */
  private fun openAutoStartSettings(ctx: Context): Boolean {
    val launcher = appContext.currentActivity ?: ctx
    for (cn in AUTOSTART_COMPONENTS) {
      val intent = Intent().apply {
        component = ComponentName(cn[0], cn[1])
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      if (ctx.packageManager.resolveActivity(intent, 0) != null) {
        try {
          launcher.startActivity(intent)
          return true
        } catch (_: Throwable) {
          // Try the next candidate.
        }
      }
    }
    openAppDetailsSettings(ctx)
    return false
  }

  /** Whether ANSWER_PHONE_CALLS is granted (needed to answer/end live calls). */
  private fun hasAnswerCallsPermission(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    return ContextCompat.checkSelfPermission(
      ctx,
      Manifest.permission.ANSWER_PHONE_CALLS
    ) == PackageManager.PERMISSION_GRANTED
  }

  /** Accept the currently ringing call. Returns false if not possible. */
  @SuppressLint("MissingPermission")
  private fun answerRingingCall(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    if (!hasAnswerCallsPermission(ctx)) return false
    val tm = ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager ?: return false
    return try {
      tm.acceptRingingCall()
      true
    } catch (_: Throwable) {
      false
    }
  }

  /** End the current ringing/active call. Returns false if not possible. */
  @SuppressLint("MissingPermission")
  private fun endOngoingCall(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return false
    if (!hasAnswerCallsPermission(ctx)) return false
    val tm = ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager ?: return false
    return try {
      tm.endCall()
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

    /** Demo caller for the "Send test alert" self-test. */
    private const val TEST_ALERT_NUMBER = "+918765432100"

    /**
     * OEM "autostart" / "background launch" manager activities, in priority
     * order. Covers Xiaomi/Redmi/POCO (MIUI), Oppo/Realme (ColorOS),
     * Vivo/iQOO (Funtouch/OriginOS), OnePlus (OxygenOS) and Honor/Huawei.
     * Each entry is [package, fully-qualified activity]; the first one the device
     * can resolve is launched.
     */
    private val AUTOSTART_COMPONENTS = listOf(
      // Xiaomi / Redmi / POCO
      arrayOf("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
      // Oppo / Realme
      arrayOf("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
      arrayOf("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"),
      arrayOf("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"),
      // Vivo / iQOO
      arrayOf("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"),
      arrayOf("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager"),
      arrayOf("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"),
      // OnePlus
      arrayOf("com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"),
      // Honor / Huawei
      arrayOf("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
      arrayOf("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity")
    )

    /** Bridges a screened call from the background service to JS listeners. */
    fun notifyCallScreened(number: String, blocked: Boolean) {
      current?.emitCallScreened(number, blocked)
    }
  }
}
