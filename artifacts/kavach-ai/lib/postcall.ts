/**
 * Play-safe post-call "How was this call?" prompt state.
 *
 * Detecting that an answered call has ended normally needs `READ_PHONE_STATE`
 * / `READ_CALL_LOG` or default-dialer status — all of which the app avoids to
 * stay within Google Play policy (see play-permissions-policy). So instead of
 * watching the call, we record the calls the user answers THROUGH Netraksh's
 * own call alert, and surface the prompt the next time the app is foregrounded.
 * Everything here is device-local AsyncStorage; no new permission is involved.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { tenDigits } from "@/lib/phone";

const PENDING_KEY = "kv_postcall_pending";
const REPORTED_KEY = "kv_postcall_reported";
const LEGIT_KEY = "kv_postcall_legit";
const ENABLED_KEY = "kv_postcall_enabled";

/**
 * Only prompt if the app is re-opened within this window of answering. Guards
 * against surfacing a stale "How was this call?" for a call answered long ago.
 */
const PROMPT_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Don't prompt until at least this long after the call was answered. A
 * foreground transition is only a heuristic for "the call ended"; if the user
 * just answered and immediately switches to Netraksh, the call is very likely
 * still in progress. Waiting a short settle period avoids popping the prompt
 * over a live call — we simply re-check on the next foreground.
 */
const SETTLE_MS = 10 * 1000; // 10 seconds

/** Cap the suppression/reported sets so they can't grow without bound. */
const MAX_SET = 50;

export type PendingPostCall = { number: string; answeredAt: number };

/**
 * What to do with a pending record on a foreground transition:
 * - "show": prompt the user now, then clear.
 * - "clear": permanently disqualified (expired, emergency, already acted on) — drop it.
 * - "defer": temporarily not eligible (feature off, call may still be live) — keep
 *   it so a later foreground can re-evaluate within the time window.
 */
export type PostCallDecision = "show" | "clear" | "defer";

/**
 * Indian emergency and common public-service short codes. A post-call prompt
 * must never appear for these — reporting or blocking them makes no sense.
 */
const EMERGENCY_NUMBERS = new Set([
  "112", "100", "101", "102", "103", "108", "1091", "1098", "1090",
  "139", "181", "182", "1930", "1078", "1073", "1097", "104", "1100",
]);

/** A stable comparison key for a phone number (last 10 digits where possible). */
function phoneKey(raw: string | null | undefined): string | null {
  const ten = tenDigits(raw);
  if (ten) return ten;
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits || null;
}

function isEmergency(raw: string): boolean {
  return EMERGENCY_NUMBERS.has((raw ?? "").replace(/\D/g, ""));
}

async function readSet(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function addToSet(key: string, value: string | null): Promise<void> {
  if (!value) return;
  try {
    const current = await readSet(key);
    if (current.includes(value)) return;
    const next = [value, ...current].slice(0, MAX_SET);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch {
    // ignore persistence failures — worst case the prompt shows again
  }
}

/**
 * Remember that the user answered this number through Netraksh's call alert, so
 * the next time the app comes to the foreground we can ask how the call went.
 */
export async function recordAnsweredCall(number: string): Promise<void> {
  if (!number || !number.trim()) return;
  if (isEmergency(number)) return;
  const record: PendingPostCall = { number: number.trim(), answeredAt: Date.now() };
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export async function getPendingPostCall(): Promise<PendingPostCall | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.number === "string" &&
      typeof parsed.answeredAt === "number"
    ) {
      return parsed as PendingPostCall;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearPendingPostCall(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

/** The post-call prompt is on by default; the user can turn it off in settings. */
export async function isPostCallEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    if (raw === null) return true;
    return JSON.parse(raw) === true;
  } catch {
    return true;
  }
}

export async function setPostCallEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, JSON.stringify(enabled));
  } catch {
    // ignore
  }
}

/** Suppress future prompts for a number the user reported or already acted on. */
export async function markReported(number: string): Promise<void> {
  await addToSet(REPORTED_KEY, phoneKey(number));
}

/** The user confirmed this caller is legitimate — never prompt for it again. */
export async function markLegitimate(number: string): Promise<void> {
  await addToSet(LEGIT_KEY, phoneKey(number));
}

/**
 * Decide what to do with a recorded answered call on a foreground transition.
 * Distinguishes permanent disqualifiers ("clear") from temporary ones ("defer")
 * so a call the user simply returned to too early — or while the feature was
 * momentarily off — isn't lost; it's re-evaluated on the next foreground until
 * it either qualifies or ages out of the time window.
 */
export async function evaluatePending(
  pending: PendingPostCall,
): Promise<PostCallDecision> {
  const elapsed = Date.now() - pending.answeredAt;
  // Permanent: too old to still be relevant.
  if (elapsed > PROMPT_WINDOW_MS) return "clear";
  // Permanent: emergency/short codes are never reportable.
  if (isEmergency(pending.number)) return "clear";
  const key = phoneKey(pending.number);
  if (!key) return "clear";
  // Permanent: the user has already reported or vouched for this number.
  const [reported, legit] = await Promise.all([
    readSet(REPORTED_KEY),
    readSet(LEGIT_KEY),
  ]);
  if (reported.includes(key) || legit.includes(key)) return "clear";
  // Temporary: feature switched off — keep it in case it's turned back on.
  if (!(await isPostCallEnabled())) return "defer";
  // Temporary: too soon after answering — the call is likely still live.
  if (elapsed < SETTLE_MS) return "defer";
  return "show";
}
