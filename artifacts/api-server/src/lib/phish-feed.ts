import type { FraudSignal } from "@workspace/api-zod";
import { logger } from "./logger";

/**
 * Active phishing domains from phishunt.io (data is CC0 / public domain).
 *
 * We download the whole active-domain list periodically and match locally, so
 * the links people check never leave our server. The list is small (hundreds to
 * low thousands of domains), so it lives in memory.
 */
const FEED_URL = "https://phishunt.io/api/v1/domains";
const PAGE_SIZE = 500;
const MAX_DOMAINS = 20_000;
const REFRESH_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15_000;

let domains: Set<string> = new Set();
let loadedAt: number | null = null;
let timer: NodeJS.Timeout | null = null;

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}

/** Replace the in-memory list (exported for tests). */
export function setPhishDomains(list: Iterable<string>): void {
  domains = new Set([...list].map(normalizeHost).filter(Boolean));
  loadedAt = Date.now();
}

/** The listed domain matching this host or one of its parent domains, if any. */
export function findPhishDomain(host: string): string | null {
  const parts = normalizeHost(host).split(".");
  // Check the host itself and every parent with at least two labels, so
  // "login.evil.example" matches a listed "evil.example".
  for (let i = 0; i <= parts.length - 2; i++) {
    const candidate = parts.slice(i).join(".");
    if (domains.has(candidate)) return candidate;
  }
  return null;
}

async function fetchPage(offset: number): Promise<{ total: number; results: { domain?: string }[] }> {
  const res = await fetch(`${FEED_URL}?format=json&limit=${PAGE_SIZE}&offset=${offset}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "Netraksh/1.0 (+https://netraksh.com)" },
  });
  if (!res.ok) throw new Error(`phishunt feed HTTP ${res.status}`);
  return (await res.json()) as { total: number; results: { domain?: string }[] };
}

export async function refreshPhishFeed(): Promise<void> {
  try {
    const next: string[] = [];
    let offset = 0;
    let total = Infinity;
    while (offset < total && next.length < MAX_DOMAINS) {
      const page = await fetchPage(offset);
      total = page.total;
      for (const r of page.results) if (r.domain) next.push(r.domain);
      if (page.results.length === 0) break;
      offset += page.results.length;
    }
    // Keep the previous list if the feed came back empty (likely an outage).
    if (next.length > 0) {
      setPhishDomains(next);
      logger.info({ domains: domains.size }, "phishunt feed refreshed");
    }
  } catch (err) {
    logger.warn({ err }, "phishunt feed refresh failed; keeping previous list");
  }
}

/** Load the feed now and keep it fresh. Safe to call once at startup. */
export function startPhishFeed(): void {
  if (timer) return;
  void refreshPhishFeed();
  timer = setInterval(() => void refreshPhishFeed(), REFRESH_MS);
  timer.unref();
}

export function checkPhishFeed(url: URL): FraudSignal {
  if (loadedAt === null) {
    return {
      source: "url_threat_feed",
      severity: "info",
      label: "Phishing feed temporarily unavailable.",
    };
  }
  const match = findPhishDomain(url.hostname);
  if (match) {
    return {
      source: "url_threat_feed",
      severity: "high",
      label: `Listed as an active phishing site (${match}) on the phishunt.io threat feed.`,
    };
  }
  return {
    source: "url_threat_feed",
    severity: "info",
    label: "Not on the active phishing-site feed.",
  };
}
