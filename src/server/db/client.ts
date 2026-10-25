import "server-only";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { serializeLocalClient } from "./serialize";
import { databaseEnv } from "./env";

export type Database = LibSQLDatabase<typeof schema>;

/**
 * Local development uses a SQLite file (DATABASE_URL=file:./data/harlow-brook.db).
 * Production uses a hosted libSQL database (Turso): DATABASE_URL + DATABASE_AUTH_TOKEN, or the TURSO_* variables
 * set by Vercel's Turso integration (see env.ts).
 */
function connect(): { client: Client; db: Database } {
  const env = databaseEnv();
  const url = resolveUrl(env.url);
  const local = url.startsWith("file:");
  // Local files: queue work in-process (see serialize.ts); the busy timeout covers other processes.
  const raw = createClient({ url, authToken: env.authToken, timeout: 5000 });
  const client = local ? serializeLocalClient(raw) : raw;
  if (local) void client.execute("PRAGMA journal_mode = WAL");
  return { client, db: drizzle(client, { schema }) };
}

/**
 * A Vercel deployment without a hosted database is a disposable preview: the build seeds a SQLite file that ships
 * with the functions (read-only), and each server instance works on its own copy in /tmp. Nothing written there
 * (orders, messages, inquiries) persists. Connect a hosted database (Turso) for a real deployment.
 */
function resolveUrl(url: string) {
  if (!process.env.VERCEL || !url.startsWith("file:")) return url;
  // Always the build's default location (vercel.json seeds it); a fixed path keeps file tracing to this one file.
  const bundled = path.join(process.cwd(), "data", "harlow-brook.db");
  const working = "/tmp/harlow-brook.db";
  if (!existsSync(working) && existsSync(bundled)) copyFileSync(bundled, working);
  return `file:${working}`;
}

const globalForDb = globalThis as unknown as { __hbDb?: { client: Client; db: Database } };
const conn = globalForDb.__hbDb ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__hbDb = conn;

export const db = conn.db;
export { schema };
