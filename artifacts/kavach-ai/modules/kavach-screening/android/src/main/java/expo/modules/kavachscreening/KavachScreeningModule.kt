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
      "blocklistSize" to ScreeningStore.getBlocklist(ctx).size,
      "keywordCount" to ScreeningStore.getKeywords(ctx).size
    )
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
