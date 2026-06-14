import type { FraudSignal } from "@workspace/api-zod";
import { config } from "../config";
import { logger } from "./logger";

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "rb.gy",
  "bitly.com",
]);

// TLDs disproportionately abused for phishing / throwaway scam sites.
const SUSPICIOUS_TLDS = new Set([
  "zip",
  "xyz",
  "top",
  "club",
  "online",
  "click",
  "link",
  "gq",
  "tk",
  "ml",
  "cf",
  "ga",
  "work",
  "loan",
  "rest",
  "cam",
  "country",
  "kim",
  "men",
]);

// Brand tokens commonly impersonated in Indian phishing, with their official
// registrable domains. A host containing the token but not on an official
// domain is a strong impersonation signal.
const BRAND_TOKENS: { token: string; official: string[] }[] = [
  { token: "sbi", official: ["onlinesbi.sbi", "sbi.co.in", "sbi.bank.in"] },
  { token: "hdfc", official: ["hdfcbank.com"] },
  { token: "icici", official: ["icicibank.com"] },
  { token: "axisbank", official: ["axisbank.com"] },
  { token: "kotak", official: ["kotak.com"] },
  { token: "paytm", official: ["paytm.com", "paytmbank.com"] },
  { token: "phonepe", official: ["phonepe.com"] },
  { token: "npci", official: ["npci.org.in"] },
  { token: "aadhaar", official: ["uidai.gov.in"] },
  { token: "incometax", official: ["incometax.gov.in"] },
  { token: "indiapost", official: ["indiapost.gov.in"] },
];

const SENSITIVE_PATH_KEYWORDS = [
  "login",
  "verify",
  "kyc",
  "otp",
  "update",
  "secure",
  "account",
  "netbanking",
  "refund",
  "wallet",
  "password",
];

function info(label: string): FraudSignal {
  return { source: "url_heuristic", severity: "info", label };
}

/** Extract a parseable URL object, prepending http:// when no scheme is given. */
export function parseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`);
  } catch {
    return null;
  }
}

/**
 * Canonical key for community URL reputation. Drops scheme, leading "www.",
 * query and fragment, and any trailing slashes so that report-time and
 * check-time lookups for the same link agree. Returns null when unparseable.
 */
export function normalizeUrlKey(raw: string): string | null {
  const url = parseUrl(raw);
  if (!url) return null;
  let host = url.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  const path = url.pathname.replace(/\/+$/, "");
  return `${host}${path}`;
}

function registrableTld(host: string): string {
  const parts = host.split(".");
  return parts.length ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Purely local, structural URL heuristics. No network calls — safe to run even
 * when no threat-feed key is configured.
 */
export function analyzeUrlHeuristics(raw: string): {
  url: URL | null;
  signals: FraudSignal[];
} {
  const url = parseUrl(raw);
  if (!url) {
    return { url: null, signals: [info("Could not parse this as a URL.")] };
  }

  const signals: FraudSignal[] = [];
  const host = url.hostname.toLowerCase();
  const sig = (severity: FraudSignal["severity"], label: string) =>
    signals.push({ source: "url_heuristic", severity, label });

  // Credentials embedded before the host (https://bank.com@evil.com/...).
  if (url.username || url.password || raw.includes("@")) {
    if (url.username || url.password) {
      sig("high", "URL embeds login credentials before the real domain (phishing trick).");
    }
  }

  // IP-literal host instead of a domain name.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) {
    sig("high", "Link points to a raw IP address instead of a domain name.");
  }

  // Punycode / internationalized homograph domains.
  if (host.includes("xn--")) {
    sig("medium", "Domain uses punycode, which can disguise look-alike characters.");
  }

  // URL shorteners hide the true destination.
  if (URL_SHORTENERS.has(host)) {
    sig("medium", "Shortened link hides its real destination.");
  }

  // Suspicious/abused TLD.
  const tld = registrableTld(host);
  if (SUSPICIOUS_TLDS.has(tld)) {
    sig("medium", `Uses a domain extension (.${tld}) commonly abused for scams.`);
  }

  // Brand impersonation.
  for (const { token, official } of BRAND_TOKENS) {
    if (host.includes(token) && !official.some((d) => host === d || host.endsWith(`.${d}`))) {
      sig("high", `Domain imitates a known brand ("${token}") but is not its official site.`);
      break;
    }
  }

  // Not HTTPS.
  if (url.protocol !== "https:") {
    sig("low", "Connection is not secure (no HTTPS).");
  }

  // Excessive subdomains (e.g. sbi.secure.login.example.com).
  const labels = host.split(".");
  if (labels.length >= 5) {
    sig("low", "Unusually deep subdomain structure.");
  }

  // Lots of hyphens or digits in the host.
  const hyphens = (host.match(/-/g) ?? []).length;
  const digits = (host.match(/\d/g) ?? []).length;
  if (hyphens >= 3 || digits >= 6) {
    sig("low", "Host name has an unusual number of digits or hyphens.");
  }

  // Sensitive keywords in the path/query.
  const pathAndQuery = `${url.pathname}${url.search}`.toLowerCase();
  const matched = SENSITIVE_PATH_KEYWORDS.filter((k) => pathAndQuery.includes(k));
  if (matched.length) {
    sig("low", `Link path mentions sensitive action(s): ${matched.slice(0, 3).join(", ")}.`);
  }

  return { url, signals };
}

type SafeBrowsingMatch = { threatType?: string };

/**
 * Optional Google Safe Browsing lookup, gated on a configured API key. Returns
 * a signal describing the result (or the explicit fallback when unconfigured).
 */
export async function checkSafeBrowsing(url: URL): Promise<FraudSignal> {
  if (!config.safeBrowsingApiKey) {
    return {
      source: "url_threat_feed",
      severity: "info",
      label: "External threat feed not configured; used structural checks only.",
    };
  }

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(config.safeBrowsingApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "kavachai", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url.toString() }],
          },
        }),
      },
    );

    if (!res.ok) {
      logger.error({ status: res.status }, "Safe Browsing lookup failed");
      return {
        source: "url_threat_feed",
        severity: "info",
        label: "Threat feed lookup unavailable; used structural checks only.",
      };
    }

    const data = (await res.json()) as { matches?: SafeBrowsingMatch[] };
    if (data.matches && data.matches.length > 0) {
      const types = [...new Set(data.matches.map((m) => m.threatType).filter(Boolean))];
      return {
        source: "url_threat_feed",
        severity: "high",
        label: `Listed on Google Safe Browsing${types.length ? ` (${types.join(", ").toLowerCase()})` : ""}.`,
      };
    }

    return {
      source: "url_threat_feed",
      severity: "info",
      label: "Not listed on Google Safe Browsing.",
    };
  } catch (err) {
    logger.error({ err }, "Safe Browsing lookup error");
    return {
      source: "url_threat_feed",
      severity: "info",
      label: "Threat feed lookup unavailable; used structural checks only.",
    };
  }
}
