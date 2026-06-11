---
name: Cross-OEM call-screening reliability
description: Why the incoming-call popup is inconsistent across Android OEMs and the Play-safe way to fix it
---

# Cross-OEM call-screening reliability

The CallScreeningService + overlay + full-screen-intent stack is correct, but the
caller popup is unreliable on aggressive OEMs (Xiaomi/MIUI, Oppo+Realme/ColorOS,
Vivo+iQOO/Funtouch, OnePlus, Honor/Huawei). The cause is **runtime device power
management**, not code: the OS freezes/kills the screening process unless the app
is battery-unrestricted AND (on those OEMs) has the vendor "autostart /
background-launch" toggle enabled. Pixel/Samsung are mostly fine without it.

**The fix in-app = guidance + self-test, not more permissions.**
- Battery exemption: open `Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`
  (the list flow). Read state with `PowerManager.isIgnoringBatteryOptimizations`.
- Autostart: there is NO public API. Launch the vendor security-app activity by
  hard-coded `ComponentName` (probe `resolveActivity` first), fall back to
  `ACTION_APPLICATION_DETAILS_SETTINGS`. Gate the UI on `Build.MANUFACTURER`.
- Self-test: reuse the service's real `launchCallScreen` companion to fire the
  actual full-screen-intent notification so the user can confirm it fronts on
  their own device.

**Why:** Play rejects the restricted route — never use
`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` + the direct `ACTION_REQUEST_IGNORE_...`
prompt for a non-allowed category, and never re-add READ_CALL_LOG/READ_SMS/
READ_PHONE_STATE/RECORD_AUDIO. The settings-list + autostart-intent approach
needs none of those.

**Constraint to remember:** autostart grant state is NOT introspectable after the
fact (Android exposes no query), so success can't be verified programmatically —
the self-test is the only honest confirmation. Don't try to show a green "done"
checkmark for autostart.

**How to apply:** any future "popup didn't show on device X" report is almost
always a battery/autostart device-setting, not a code regression — point the user
at the Reliability section + Send-test-alert before changing native code.
