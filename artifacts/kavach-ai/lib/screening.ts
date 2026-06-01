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
import { Platform } from "react-native";

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

/** Ask the system to make KavachAI the call-screening app (Android 10+). */
export async function requestCallScreeningRole(): Promise<boolean> {
  if (!isScreeningSupported()) return false;
  try {
    return await KavachScreening.requestCallScreeningRole();
  } catch {
    return false;
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
