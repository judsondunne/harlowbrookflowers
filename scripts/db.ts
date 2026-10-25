/** Standalone DB connection for CLI scripts (the app uses src/server/db/client.ts). */
import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/server/db/schema";
import { databaseEnv } from "../src/server/db/env";

export function scriptDb() {
  const { url, authToken } = databaseEnv();
  if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });
  const client = createClient({ url, authToken, timeout: 5000 });
  return { client, db: drizzle(client, { schema }), url };
}
