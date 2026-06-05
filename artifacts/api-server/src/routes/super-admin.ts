import { Router, type IRouter } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, paymentsTable, aiUsageTable } from "@workspace/db";
import type { SuperAdminOverview } from "@workspace/api-zod";
import { config } from "../config";
import { requireSuperAdmin } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/** Object/file storage is not configured in this project (DB-only storage). */
function objectStorageConfigured(): boolean {
  return Boolean(
    process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ||
      process.env.PUBLIC_OBJECT_SEARCH_PATHS ||
      process.env.PRIVATE_OBJECT_DIR,
  );
}

async function getDatabaseHealth(): Promise<SuperAdminOverview["database"]> {
  try {
    const start = Date.now();
    await db.execute(sql`select 1`);
    const latencyMs = Date.now() - start;

    const versionRes = await db.execute<{ v: string }>(
      sql`show server_version`,
    );
    const version =
      (versionRes.rows[0] as { server_version?: string } | undefined)
        ?.server_version ?? null;

    const connRes = await db.execute<{ count: string }>(
      sql`select count(*)::int as count from pg_stat_activity where datname = current_database()`,
    );
    const activeConnections = Number(
      (connRes.rows[0] as { count?: number | string } | undefined)?.count ?? 0,
    );

    return {
      status: "healthy",
      latencyMs,
      version,
      activeConnections,
    };
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return {
      status: "unreachable",
      latencyMs: null,
      version: null,
      activeConnections: null,
    };
  }
}

async function getStorage(): Promise<SuperAdminOverview["storage"]> {
  let databaseBytes = 0;
  let topTables: { name: string; bytes: number }[] = [];
  try {
    const sizeRes = await db.execute(
      sql`select pg_database_size(current_database())::bigint as bytes`,
    );
    databaseBytes = Number(
      (sizeRes.rows[0] as { bytes?: number | string } | undefined)?.bytes ?? 0,
    );

    const tablesRes = await db.execute(
      sql`
        select relname as name,
               pg_total_relation_size(relid)::bigint as bytes
        from pg_catalog.pg_statio_user_tables
        order by pg_total_relation_size(relid) desc
        limit 6
      `,
    );
    topTables = tablesRes.rows.map((r) => {
      const row = r as { name?: string; bytes?: number | string };
      return { name: String(row.name ?? ""), bytes: Number(row.bytes ?? 0) };
    });
  } catch (err) {
    logger.error({ err }, "Storage stats failed");
  }

  return {
    databaseBytes,
    objectStorageConfigured: objectStorageConfigured(),
    topTables,
  };
}

router.get("/admin/super/overview", requireSuperAdmin, async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const ago30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const [
    [revenueAll],
    [revenueMonth],
    [aiAgg30d],
    [aiAggToday],
    database,
    storage,
  ] = await Promise.all([
    db
      .select({ value: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "paid")),
    db
      .select({ value: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)` })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.status, "paid"),
          gte(paymentsTable.createdAt, monthStart),
        ),
      ),
    db
      .select({
        calls: sql<string>`count(*)`,
        prompt: sql<string>`coalesce(sum(${aiUsageTable.promptTokens}), 0)`,
        completion: sql<string>`coalesce(sum(${aiUsageTable.completionTokens}), 0)`,
        total: sql<string>`coalesce(sum(${aiUsageTable.totalTokens}), 0)`,
      })
      .from(aiUsageTable)
      .where(gte(aiUsageTable.createdAt, ago30Days)),
    db
      .select({
        prompt: sql<string>`coalesce(sum(${aiUsageTable.promptTokens}), 0)`,
        completion: sql<string>`coalesce(sum(${aiUsageTable.completionTokens}), 0)`,
      })
      .from(aiUsageTable)
      .where(gte(aiUsageTable.createdAt, dayStart)),
    getDatabaseHealth(),
    getStorage(),
  ]);

  const inputPrice = config.aiInputUsdPerMillionTokens / 1_000_000;
  const outputPrice = config.aiOutputUsdPerMillionTokens / 1_000_000;

  const prompt30d = Number(aiAgg30d?.prompt ?? 0);
  const completion30d = Number(aiAgg30d?.completion ?? 0);
  const estimatedCostUsd30d =
    prompt30d * inputPrice + completion30d * outputPrice;
  const estimatedCostUsdToday =
    Number(aiAggToday?.prompt ?? 0) * inputPrice +
    Number(aiAggToday?.completion ?? 0) * outputPrice;

  const mem = process.memoryUsage();

  const response: SuperAdminOverview = {
    revenue: {
      totalPaise: Number(revenueAll?.value ?? 0),
      thisMonthPaise: Number(revenueMonth?.value ?? 0),
    },
    aiCost: {
      calls30d: Number(aiAgg30d?.calls ?? 0),
      promptTokens30d: prompt30d,
      completionTokens30d: completion30d,
      totalTokens30d: Number(aiAgg30d?.total ?? 0),
      estimatedCostUsd30d: Number(estimatedCostUsd30d.toFixed(4)),
      estimatedCostUsdToday: Number(estimatedCostUsdToday.toFixed(4)),
    },
    cloudCost: {
      configured: false,
      note: "No cloud billing data source is connected.",
    },
    infrastructure: {
      status: "healthy",
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      memoryRssBytes: mem.rss,
      memoryHeapUsedBytes: mem.heapUsed,
      memoryHeapTotalBytes: mem.heapTotal,
    },
    database,
    storage,
  };

  res.json(response);
});

export default router;
