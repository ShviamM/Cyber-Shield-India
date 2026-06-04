import { Router, type IRouter } from "express";
import { and, count, eq, gte, inArray, lt, max, sql } from "drizzle-orm";
import { db, fraudReportsTable, scamCategoriesTable } from "@workspace/db";
import type {
  CityHotspot,
  CityHotspotListResponse,
  ScamOfDay,
  TrendingScam,
  TrendingScamListResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const VISIBLE_STATUSES = ["pending", "verified"] as const;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function cityEq(value: string) {
  return sql`lower(${fraudReportsTable.city}) = lower(${value})`;
}

function trendLevel(value: number, max: number): TrendingScam["trend"] {
  if (max <= 0) return "medium";
  const ratio = value / max;
  if (ratio >= 0.66) return "critical";
  if (ratio >= 0.33) return "high";
  return "medium";
}

type CategoryMeta = {
  nameEn: string;
  nameHi: string | null;
  descriptionEn: string | null;
  tipEn: string | null;
  tipHi: string | null;
};

type TrendingAccumulator = {
  categoryKey: string;
  count: number;
  cityCounts: Map<string, number>;
  lastReportedAt: Date | null;
};

async function computeTrending(city?: string): Promise<{
  scams: TrendingScam[];
  total: number;
  accumulators: Map<string, TrendingAccumulator>;
}> {
  const categories = await db
    .select({
      key: scamCategoriesTable.key,
      nameEn: scamCategoriesTable.nameEn,
      nameHi: scamCategoriesTable.nameHi,
      descriptionEn: scamCategoriesTable.descriptionEn,
      tipEn: scamCategoriesTable.tipEn,
      tipHi: scamCategoriesTable.tipHi,
    })
    .from(scamCategoriesTable);

  const meta = new Map<string, CategoryMeta>(
    categories.map((c) => [
      c.key,
      {
        nameEn: c.nameEn,
        nameHi: c.nameHi,
        descriptionEn: c.descriptionEn,
        tipEn: c.tipEn,
        tipHi: c.tipHi,
      },
    ]),
  );

  const acc = new Map<string, TrendingAccumulator>();
  const ensure = (key: string): TrendingAccumulator => {
    let entry = acc.get(key);
    if (!entry) {
      entry = { categoryKey: key, count: 0, cityCounts: new Map(), lastReportedAt: null };
      acc.set(key, entry);
    }
    return entry;
  };

  // Live community reports in the last 7 days. Public stats reflect only real
  // user reports — no seeded baseline is fused in.
  const since = new Date(Date.now() - WEEK_MS);
  const liveRows = await db
    .select({
      categoryKey: fraudReportsTable.categoryKey,
      city: fraudReportsTable.city,
      c: count(),
      last: max(fraudReportsTable.createdAt),
    })
    .from(fraudReportsTable)
    .where(
      and(
        inArray(fraudReportsTable.status, [...VISIBLE_STATUSES]),
        gte(fraudReportsTable.createdAt, since),
        ...(city ? [cityEq(city)] : []),
      ),
    )
    .groupBy(fraudReportsTable.categoryKey, fraudReportsTable.city);

  for (const row of liveRows) {
    if (!meta.has(row.categoryKey)) continue;
    const entry = ensure(row.categoryKey);
    entry.count += Number(row.c);
    if (row.city) {
      entry.cityCounts.set(row.city, (entry.cityCounts.get(row.city) ?? 0) + Number(row.c));
    }
    if (row.last && (!entry.lastReportedAt || row.last > entry.lastReportedAt)) {
      entry.lastReportedAt = row.last;
    }
  }

  const entries = [...acc.values()].filter((e) => e.count > 0);
  const maxCount = entries.reduce((m, e) => Math.max(m, e.count), 0);
  entries.sort((a, b) => b.count - a.count);

  const topCity = (entry: TrendingAccumulator): string | null => {
    if (city) return city;
    let best: string | null = null;
    let bestN = -1;
    for (const [c, n] of entry.cityCounts) {
      if (n > bestN) {
        bestN = n;
        best = c;
      }
    }
    return best;
  };

  const scams: TrendingScam[] = entries.map((e) => {
    const m = meta.get(e.categoryKey)!;
    return {
      categoryKey: e.categoryKey,
      type: m.nameEn,
      typeHi: m.nameHi,
      description: m.descriptionEn,
      tip: m.tipEn,
      tipHi: m.tipHi,
      count: e.count,
      trend: trendLevel(e.count, maxCount),
      city: topCity(e),
      lastReportedAt: e.lastReportedAt,
    };
  });

  const total = entries.reduce((s, e) => s + e.count, 0);
  return { scams, total, accumulators: acc };
}

router.get("/stats/trending", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const { scams, total } = await computeTrending(city || undefined);
  const response: TrendingScamListResponse = { scams, total };
  res.json(response);
});

router.get("/stats/hotspots", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";

  type Row = { cur: number; prev: number };
  const cities = new Map<string, Row>();
  const ensure = (name: string): Row => {
    let r = cities.get(name);
    if (!r) {
      r = { cur: 0, prev: 0 };
      cities.set(name, r);
    }
    return r;
  };

  // Live only: this week vs the prior week, per city (real reports, no baseline).
  const now = Date.now();
  const weekAgo = new Date(now - WEEK_MS);
  const twoWeeksAgo = new Date(now - 2 * WEEK_MS);

  const liveCur = await db
    .select({ city: fraudReportsTable.city, c: count() })
    .from(fraudReportsTable)
    .where(
      and(
        inArray(fraudReportsTable.status, [...VISIBLE_STATUSES]),
        gte(fraudReportsTable.createdAt, weekAgo),
        sql`${fraudReportsTable.city} is not null`,
      ),
    )
    .groupBy(fraudReportsTable.city);
  for (const row of liveCur) {
    if (!row.city) continue;
    ensure(row.city).cur += Number(row.c);
  }

  const livePrev = await db
    .select({ city: fraudReportsTable.city, c: count() })
    .from(fraudReportsTable)
    .where(
      and(
        inArray(fraudReportsTable.status, [...VISIBLE_STATUSES]),
        gte(fraudReportsTable.createdAt, twoWeeksAgo),
        lt(fraudReportsTable.createdAt, weekAgo),
        sql`${fraudReportsTable.city} is not null`,
      ),
    )
    .groupBy(fraudReportsTable.city);
  for (const row of livePrev) {
    if (!row.city) continue;
    ensure(row.city).prev += Number(row.c);
  }

  const all: CityHotspot[] = [...cities.entries()].map(([name, r]) => {
    const changePct = r.prev > 0 ? ((r.cur - r.prev) / r.prev) * 100 : 0;
    return {
      city: name,
      cases: r.cur,
      changePct: Math.round(changePct * 10) / 10,
      up: changePct >= 0,
    };
  });
  all.sort((a, b) => b.cases - a.cases);

  const top = all.slice(0, 8);
  if (city) {
    const match = all.find((h) => h.city.toLowerCase() === city.toLowerCase());
    if (match && !top.some((h) => h.city === match.city)) {
      top.push(match);
    }
  }

  const response: CityHotspotListResponse = { hotspots: top };
  res.json(response);
});

router.get("/stats/scam-of-day", async (_req, res) => {
  const { scams, accumulators } = await computeTrending();
  const top = scams[0];

  if (!top) {
    const empty: ScamOfDay = {
      categoryKey: "",
      tag: "TRENDING TODAY",
      title: "",
      titleHi: null,
      description: null,
      tip: null,
      tipHi: null,
      reports: 0,
      cities: [],
    };
    res.json(empty);
    return;
  }

  const acc = accumulators.get(top.categoryKey);
  const cities = acc
    ? [...acc.cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c)
    : [];

  const response: ScamOfDay = {
    categoryKey: top.categoryKey,
    tag: "TRENDING TODAY",
    title: top.type,
    titleHi: top.typeHi ?? null,
    description: top.description ?? null,
    tip: top.tip ?? null,
    tipHi: top.tipHi ?? null,
    reports: top.count,
    cities,
  };
  res.json(response);
});

export default router;
