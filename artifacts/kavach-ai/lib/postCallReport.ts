import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * A tiny persisted hand-off for the "post-call report" prompt.
 *
 * Android exposes no Play-compliant call-ended callback (that would need the
 * restricted call-state permissions Netraksh deliberately avoids), so we
 * approximate it: when the user answers a screened call from the caller popup
 * we queue the caller's number here, then surface the one-tap report screen the
 * next time the app returns to the foreground — typically right after they hang
 * up. The native "report this call" notification remains the fallback when the
 * user doesn't reopen the app.
 */
const KEY = "kv_pending_postcall_report";

// Drop a queued prompt that was never consumed within this window so a stale
// number can't pop up hours/days later.
const MAX_AGE_MS = 60 * 60 * 1000;

export async function setPendingPostCallReport(number: string): Promise<void> {
  const trimmed = number?.trim();
  if (!trimmed) return;
  try {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ number: trimmed, ts: Date.now() }),
    );
  } catch {
    // Best-effort: a failed write just means no auto-prompt (the notification covers it).
  }
}

export async function consumePendingPostCallReport(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as { number?: string; ts?: number };
    if (!parsed?.number || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return parsed.number;
  } catch {
    return null;
  }
}
