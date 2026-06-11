/**
 * High-level wrapper around the native `kavach-screening` module.
 *
 * On-device call/SMS screening is Android-only and requires a custom Expo Dev
 * Build (it cannot run in Expo Go or on web). Everything here is safe to call
 * on every platform: when the native module is absent it degrades to a no-op
 * and reports `available: false`, so the UI can explain the requirement.
 *
 * Privacy model: the engine's risk data is reduced to (1) a blocklist of
 * high-risk numbers and (2) scam keyword patterns, both synced into on-device
 * storage. The native services match against these locally — full message
 * contents are never sent off-device without the user's explicit action.
 */
import { PermissionsAndroid, Platform } from "react-native";

import KavachScreening, {
  type CallScreenedEvent,
  type ScreeningStatus,
  type SmsScreenedEvent,
} from "@/modules/kavach-screening";
import { normalizeIndianPhone } from "@/lib/phone";

/**
 * Common Indian scam-SMS phrases used for the on-device keyword heuristic.
 * Intentionally language-neutral signals (English + transliterated terms that
 * appear in real scam texts) — full classification still happens server-side
 * when the user opts into a check.
 */
export const DEFAULT_SCAM_KEYWORDS: string[] = [
  "otp",
  "one time password",
  "kyc",
  "update kyc",
  "account blocked",
  "account will be blocked",
  "account suspended",
  "verify your account",
  "click the link",
  "click here",
  "claim your prize",
  "you have won",
  "lottery",
  "lucky draw",
  "refund",
  "income tax refund",
  "electricity bill",
  "your electricity will be disconnected",
  "pan card",
  "aadhaar",
  "credit card blocked",
  "debit card blocked",
  "loan approved",
  "work from home",
  "earn money",
  "bit.ly",
  "tinyurl",
  "rdp",
  "anydesk",
  "teamviewer",
  "gift",
  "customs",
  "parcel",
  "courier",
  "fedex",
];

export type { ScreeningStatus, CallScreenedEvent, SmsScreenedEvent };

const UNAVAILABLE_STATUS: ScreeningStatus = {
  callScreening: false,
  smsScreening: false,
  hasCallRole: false,
  hasSmsPermission: false,
  hasNotificationPermission: false,
  hasFullScreenIntentPermission: false,
  hasOverlayPermission: false,
  hasAnswerCallsPermission: false,
  isIgnoringBatteryOptimizations: false,
  manufacturer: "",
  blocklistSize: 0,
  keywordCount: 0,
};

/** True only on a native Android build where the module is linked. */
export function isScreeningSupported(): boolean {
  if (Platform.OS !== "android") return false;
  try {
    return KavachScreening.isAvailable();
  } catch {
    return false;
  }
}

export function getScreeningStatus(): ScreeningStatus {
  if (!isScreeningSupported()) return UNAVAILABLE_STATUS;
  try {
    return KavachScreening.getStatus();
  } catch {
    return UNAVAILABLE_STATUS;
  }
}

export function setCallScreeningEnabled(enabled: boolean): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.setCallScreeningEnabled(enabled);
  } catch {
    // ignore — native call failed, status will reflect reality on next read
  }
}

export function setSmsScreeningEnabled(enabled: boolean): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.setSmsScreeningEnabled(enabled);
  } catch {
    // ignore
  }
}

/** Ask the system to make Netraksh the call-screening app (Android 10+). */
export async function requestCallScreeningRole(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.requestCallScreeningRole();
  } catch {
    return false;
  }
}

/**
 * Open the system "Display over other apps" screen so the incoming-call overlay
 * can draw over the call screen. Resolves true only if already granted — the
 * grant happens in Settings, so callers should re-read `getScreeningStatus()`
 * when the screen regains focus.
 */
export async function requestOverlayPermission(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.requestOverlayPermission();
  } catch {
    return false;
  }
}

/**
 * Open the per-app "full-screen notifications" settings screen so the locked-
 * screen call alert can launch full-screen. Android 14+ revokes this by default
 * for non-dialer apps. Resolves true only if already granted (or pre-Android 14)
 * — the grant happens in Settings, so callers should re-read the status when the
 * screen regains focus.
 */
export async function requestFullScreenIntentPermission(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.requestFullScreenIntentPermission();
  } catch {
    return false;
  }
}

/**
 * Open the system battery-optimization settings so the user can mark Netraksh as
 * "unrestricted". On aggressive OEMs an optimized app gets its screening service
 * frozen/killed, so the caller popup never appears. Resolves true only if already
 * exempt — re-read getScreeningStatus() when the screen regains focus.
 */
export async function requestDisableBatteryOptimization(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.requestDisableBatteryOptimization();
  } catch {
    return false;
  }
}

/**
 * Open the OEM-specific "autostart" / "background launch" manager (MIUI, ColorOS,
 * Funtouch, OxygenOS, etc.) so the screening service is allowed to start in the
 * background. Falls back to the app's system settings page. Resolves true only if
 * a vendor autostart screen was actually opened.
 */
export async function openAutoStartSettings(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.openAutoStartSettings();
  } catch {
    return false;
  }
}

/**
 * Fire the exact caller-alert experience a real incoming call produces (with a
 * demo number) so the user can lock their phone and confirm the popup fronts on
 * their own device/OEM. Returns true only when the native alert was dispatched.
 */
export function sendTestAlert(): boolean {
  if (!isScreeningSupported()) return false;
  try {
    return KavachScreening.sendTestAlert();
  } catch {
    return false;
  }
}

/**
 * Manufacturers known to aggressively kill background services and require an
 * extra autostart / background-launch grant beyond the standard permissions.
 */
const AGGRESSIVE_OEMS = [
  "xiaomi",
  "redmi",
  "poco",
  "oppo",
  "realme",
  "vivo",
  "iqoo",
  "oneplus",
  "huawei",
  "honor",
];

/** True if the device's manufacturer needs the extra autostart guidance step. */
export function needsAutoStartGuidance(manufacturer: string): boolean {
  const m = manufacturer.trim().toLowerCase();
  if (!m) return false;
  return AGGRESSIVE_OEMS.some((oem) => m.includes(oem));
}

/**
 * Ask for the ANSWER_PHONE_CALLS runtime permission so the incoming-call popup's
 * Answer/Block buttons can act on the live call. No-op (resolves false) off a
 * native Android build. Standard caller-management permission — not one of Play's
 * restricted Call Log / SMS permissions.
 */
export async function requestAnswerCallsPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Accept the currently ringing call (the popup's "Answer" button). Returns true
 * only when the native layer actually accepted a call; safe no-op elsewhere.
 */
export function answerCall(): boolean {
  if (!isScreeningSupported()) return false;
  try {
    return KavachScreening.answerCall();
  } catch {
    return false;
  }
}

/**
 * End the current ringing/active call (the popup's "Block" button). Returns true
 * only when the native layer actually ended a call; safe no-op elsewhere.
 */
export function endCall(): boolean {
  if (!isScreeningSupported()) return false;
  try {
    return KavachScreening.endCall();
  } catch {
    return false;
  }
}

/**
 * Add a number to the on-device blocklist so future calls from it are silently
 * rejected by the screening service. Safe no-op off a native build.
 */
export function blockNumber(number: string): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.blockNumber(number);
  } catch {
    // ignore
  }
}

/**
 * The numbers the user has manually blocked (call popup's Block button or the
 * Blocked-numbers screen). Distinct from the engine-derived high-risk list, so
 * an engine re-sync never wipes a user's own blocks. Empty off a native build.
 */
export function getBlockedNumbers(): string[] {
  if (!isScreeningSupported()) return [];
  try {
    return KavachScreening.getBlockedNumbers();
  } catch {
    return [];
  }
}

/** Remove a number the user previously blocked (the in-app Unblock action). */
export function unblockNumber(number: string): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.unblockNumber(number);
  } catch {
    // ignore
  }
}

/** Tell the native overlay which language (e.g. "en"/"hi") to render in. */
export function syncScreeningLanguage(code: string): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.syncLanguage(code);
  } catch {
    // ignore
  }
}

/**
 * Give the native call-screening service the API base URL and session token so
 * it can look up an incoming caller's scam reputation (Truecaller-style). The
 * service runs without a JS bridge, so it can't reach the JS API client — it
 * makes its own request. Pass `null` for the token when signed out.
 */
export function syncScreeningApiConfig(baseUrl: string, token: string | null): void {
  if (!isScreeningSupported()) return;
  try {
    KavachScreening.syncApiConfig(baseUrl, token);
  } catch {
    // ignore
  }
}

/**
 * Push the latest engine-derived risk data into on-device storage. `numbers`
 * are normalized to E.164 where possible; keywords default to the built-in
 * scam phrase list.
 */
export function syncEngineData(numbers: string[], keywords: string[] = DEFAULT_SCAM_KEYWORDS): void {
  if (!isScreeningSupported()) return;
  const normalized = Array.from(
    new Set(
      numbers
        .map((n) => normalizeIndianPhone(n) ?? n.replace(/\s/g, ""))
        .filter((n) => n && n.length >= 6)
    )
  );
  try {
    KavachScreening.syncBlocklist(normalized);
    KavachScreening.syncKeywords(keywords);
  } catch {
    // ignore
  }
}

export function onCallScreened(cb: (e: CallScreenedEvent) => void): { remove: () => void } {
  if (!isScreeningSupported()) return { remove: () => {} };
  return KavachScreening.addListener("onCallScreened", cb);
}

export function onSmsScreened(cb: (e: SmsScreenedEvent) => void): { remove: () => void } {
  if (!isScreeningSupported()) return { remove: () => {} };
  return KavachScreening.addListener("onSmsScreened", cb);
}
