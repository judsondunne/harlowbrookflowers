import "server-only";
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
  const url = process.env.DATABASE_URL ?? "file:./data/harlow-brook.db";
  const local = url.startsWith("file:");
  // Local files: queue work in-process (see serialize.ts); the busy timeout covers other processes.
  const raw = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN, timeout: 5000 });
  const client = local ? serializeLocalClient(raw) : raw;
  if (local) void client.execute("PRAGMA journal_mode = WAL");
  return { client, db: drizzle(client, { schema }) };
}

const globalForDb = globalThis as unknown as { __hbDb?: { client: Client; db: Database } };
const conn = globalForDb.__hbDb ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__hbDb = conn;

export const db = conn.db;
export { schema };
