/** Standalone DB connection for CLI scripts (the app uses src/server/db/client.ts). */
import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/server/db/schema";

export function scriptDb() {
  const url = process.env.DATABASE_URL ?? "file:./data/harlow-brook.db";
  if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN, timeout: 5000 });
  return { client, db: drizzle(client, { schema }), url };
}
