import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// TLS handling for managed Postgres providers (e.g. DigitalOcean Managed
// Databases, which present a certificate signed by their own CA). Defaults to
// "off" so environments where the connection string already works (local dev,
// Replit) are unaffected.
//   - DATABASE_CA_CERT        : full PEM of the provider CA → verified TLS.
//   - DATABASE_SSL_NO_VERIFY  : "true" → TLS without certificate verification
//                               (use when you can't supply the CA, e.g. DO's
//                               internal connection string).
function resolveSsl() {
  const ca = process.env.DATABASE_CA_CERT?.trim();
  if (ca) return { ca, rejectUnauthorized: true };
  if (process.env.DATABASE_SSL_NO_VERIFY === "true") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const ssl = resolveSsl();

// When we explicitly control TLS via the `ssl` option, strip any `sslmode`
// query param from the connection string. Newer pg/pg-connection-string treat
// `sslmode=require` as an alias for `verify-full`, which would override our
// explicit `ssl` settings and reject the provider's self-signed CA chain.
function buildConnectionString() {
  const url = process.env.DATABASE_URL!;
  if (!ssl) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("sslmode");
    return parsed.toString();
  } catch {
    return url;
  }
}

// Explicit pool sizing. Total Postgres connections = (API instance_count) ×
// (DB_POOL_MAX), so cap this with your managed-Postgres connection limit in
// mind when scaling the API horizontally (e.g. 2 instances × 10 = 20). Use a
// connection pooler (PgBouncer) if you outgrow the raw limit.
function poolMax() {
  const raw = Number(process.env.DB_POOL_MAX);
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

export const pool = new Pool({
  connectionString: buildConnectionString(),
  max: poolMax(),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ...(ssl ? { ssl } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
