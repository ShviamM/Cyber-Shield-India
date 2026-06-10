/**
 * Fixed-window rate limiter, keyed by an arbitrary string (e.g. client IP).
 *
 * Backed by Redis when `REDIS_URL` is set, so the limit is shared across every
 * API instance — this is what makes it safe to run the service horizontally
 * (instance_count > 1). Without Redis (local dev, single instance) it falls
 * back to a per-process in-memory window. It also falls back to in-memory if a
 * Redis call fails, so a Redis blip degrades the limiter to per-instance
 * counting instead of taking the endpoint down.
 */
import Redis from "ioredis";
import { config } from "../config";
import { logger } from "./logger";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

// ── In-memory fallback (single process) ─────────────────────────────────────
type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

function hitInMemory(key: string, max: number, windowMs: number): RateLimitResult {
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

// ── Redis backend (shared across instances) ─────────────────────────────────
// Atomic fixed-window: INCR the key, set the expiry on first hit, read the TTL.
// Returns [count, pttlMs].
const FIXED_WINDOW_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
`;

const KEY_PREFIX = "rl:";

let redis: Redis | null = null;

function initRedis(): Redis | null {
  const url = config.redisUrl;
  if (!url) {
    if (config.isProduction) {
      logger.warn(
        "REDIS_URL is not set — rate limiting is in-memory (per-instance). " +
          "Do NOT run more than one API instance without Redis, or per-IP " +
          "limits (incl. OTP/SMS abuse protection) weaken by a factor of N.",
      );
    }
    return null;
  }

  const useTls = url.startsWith("rediss://");
  const client = new Redis(url, {
    // Fail fast so a Redis outage degrades to the in-memory fallback instead of
    // hanging requests.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 3000,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    ...(useTls
      ? { tls: { rejectUnauthorized: process.env.REDIS_TLS_NO_VERIFY !== "true" } }
      : {}),
  });

  client.on("error", (err) => {
    // Swallow — every command is wrapped in try/catch and falls back. Logging
    // here just surfaces connectivity problems without crashing the process.
    logger.warn({ err }, "Redis rate-limiter connection error (falling back)");
  });

  logger.info("Rate limiter using Redis (shared across instances)");
  return client;
}

redis = initRedis();

/**
 * Records a hit for `key` and reports whether it is within the allowed budget.
 * Async because the Redis backend is async; the in-memory fallback resolves
 * synchronously under the hood.
 */
export async function hitRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (redis) {
    try {
      const result = (await redis.eval(
        FIXED_WINDOW_LUA,
        1,
        `${KEY_PREFIX}${key}`,
        String(windowMs),
      )) as [number, number];
      const count = Number(result[0]);
      const pttl = Number(result[1]);
      return {
        allowed: count <= max,
        remaining: Math.max(0, max - count),
        resetAt: Date.now() + (pttl > 0 ? pttl : windowMs),
      };
    } catch (err) {
      logger.warn({ err }, "Redis rate-limit call failed; using in-memory fallback");
      return hitInMemory(key, max, windowMs);
    }
  }
  return hitInMemory(key, max, windowMs);
}
