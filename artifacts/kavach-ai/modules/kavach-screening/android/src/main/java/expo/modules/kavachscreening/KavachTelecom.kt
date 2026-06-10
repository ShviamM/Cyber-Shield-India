package expo.modules.kavachscreening

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telecom.TelecomManager
import androidx.core.content.ContextCompat

/**
 * Shared call-control helpers used by both the JS bridge ([KavachScreeningModule])
 * and the native overlay ([KavachCallOverlay]). Both need to Answer or End the
 * live ringing call from their own UI, so the logic lives here to avoid drift.
 *
 * Uses only `ANSWER_PHONE_CALLS` (a caller-management permission, disclosed at
 * Play review) — never `READ_CALL_LOG` / `READ_PHONE_STATE`.
 */
object KavachTelecom {
  fun hasPermission(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    return ContextCompat.checkSelfPermission(
      ctx,
      Manifest.permission.ANSWER_PHONE_CALLS,
    ) == PackageManager.PERMISSION_GRANTED
  }

  /** Accept the currently ringing call. Returns false if not possible. */
  @SuppressLint("MissingPermission")
  fun answer(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    if (!hasPermission(ctx)) return false
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
  fun end(ctx: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return false
    if (!hasPermission(ctx)) return false
    val tm = ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager ?: return false
    return try {
      tm.endCall()
    } catch (_: Throwable) {
      false
    }
  }
}
