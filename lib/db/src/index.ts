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

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(ssl ? { ssl } : {}),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
