import "server-only";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { serializeLocalClient } from "./serialize";

export type Database = LibSQLDatabase<typeof schema>;

/**
 * Local development uses a SQLite file (DATABASE_URL=file:./data/harlow-brook.db).
 * Production uses a hosted libSQL database (e.g. Turso) with DATABASE_URL=libsql://… and DATABASE_AUTH_TOKEN.
 */
function connect(): { client: Client; db: Database } {
  const url = resolveUrl(process.env.DATABASE_URL ?? "file:./data/harlow-brook.db");
  const local = url.startsWith("file:");
  // Local files: queue work in-process (see serialize.ts); the busy timeout covers other processes.
  const raw = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN, timeout: 5000 });
  const client = local ? serializeLocalClient(raw) : raw;
  if (local) void client.execute("PRAGMA journal_mode = WAL");
  return { client, db: drizzle(client, { schema }) };
}

/**
 * A Vercel deployment without a hosted database is a disposable preview: the build seeds a SQLite file that ships
 * with the functions (read-only), and each server instance works on its own copy in /tmp. Nothing written there
 * (orders, messages, inquiries) persists. Set DATABASE_URL to a hosted libSQL database for a real deployment.
 */
function resolveUrl(url: string) {
  if (!process.env.VERCEL || !url.startsWith("file:")) return url;
  const bundled = path.resolve(process.cwd(), url.slice("file:".length));
  const working = "/tmp/harlow-brook.db";
  if (!existsSync(working) && existsSync(bundled)) copyFileSync(bundled, working);
  return `file:${working}`;
}

const globalForDb = globalThis as unknown as { __hbDb?: { client: Client; db: Database } };
const conn = globalForDb.__hbDb ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__hbDb = conn;

export const db = conn.db;
export { schema };
