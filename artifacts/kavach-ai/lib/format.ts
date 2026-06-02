import type { TFunction } from "i18next";

/**
 * Renders a localized "time ago" label from an ISO timestamp. Returns a
 * "this week" style fallback when the timestamp is missing (baseline-only data).
 */
export function formatTimeAgo(t: TFunction, iso?: string | null): string {
  if (!iso) return t("common.timeAgo.thisWeek");
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return t("common.timeAgo.thisWeek");

  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t("common.timeAgo.justNow");
  if (mins < 60) return t("common.timeAgo.minutes", { n: mins });

  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("common.timeAgo.hours", { n: hours });

  const days = Math.floor(hours / 24);
  if (days <= 7) return t("common.timeAgo.days", { n: days });

  return t("common.timeAgo.thisWeek");
}

/** Formats a signed week-over-week percentage like "+12%" / "-5%". */
export function formatChangePct(pct: number): string {
  const rounded = Math.round(pct);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}
