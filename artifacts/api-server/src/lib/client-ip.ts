import type { Request } from "express";
import { config } from "../config";

/**
 * Client IP used for per-IP rate limits and abuse keys.
 *
 * Never trust the leftmost X-Forwarded-For entry: the client controls it, so
 * keying limits on it lets an attacker rotate fake IPs and bypass every per-IP
 * throttle (including the admin password brute-force guard). Instead prefer the
 * header our edge sets from the real TCP peer (DigitalOcean App Platform:
 * `do-connecting-ip`, overwritten on every request), falling back to `req.ip`,
 * which honours only the `trust proxy` hop count configured in app.ts.
 */
export function clientIp(req: Request): string {
  if (config.clientIpHeader) {
    const value = req.get(config.clientIpHeader)?.split(",")[0]?.trim();
    if (value) return value;
  }
  return req.ip ?? "unknown";
}
