/**
 * A tiny in-memory fixed-window rate limiter, keyed by an arbitrary string
 * (e.g. client IP). Suitable for a single-process API server; if the service is
 * ever scaled horizontally this should move to a shared store (Redis, etc.).
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/**
 * Records a hit for `key` and reports whether it is within the allowed budget.
 * Returns `allowed` plus how many requests remain and when the window resets.
 */
export function hitRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  existing.count += 1;
  const allowed = existing.count <= max;
  return {
    allowed,
    remaining: Math.max(0, max - existing.count),
    resetAt: existing.resetAt,
  };
}

// Opportunistically evict expired windows so the map can't grow unbounded.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
}, SWEEP_INTERVAL_MS);
sweep.unref?.();
