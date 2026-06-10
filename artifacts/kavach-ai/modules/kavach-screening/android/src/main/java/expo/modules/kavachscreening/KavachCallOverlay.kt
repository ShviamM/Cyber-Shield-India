package expo.modules.kavachscreening

import android.content.Context
import android.os.Build
import android.provider.Settings

/**
 * Overlay-permission helper for the incoming-call experience.
 *
 * The rich Truecaller-style card is now the in-app React screen
 * (`app/call-alert.tsx`), launched full-screen by [KavachCallScreeningService]
 * on every incoming call. This object only reports whether the OS will let us
 * start that activity from the background ("Display over other apps").
 */
object KavachCallOverlay {
  /** Whether the OS will let us draw over other apps / background-launch right now. */
  fun canDraw(ctx: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(ctx)
}
