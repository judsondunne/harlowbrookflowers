/**
 * Which database to use. DATABASE_URL / DATABASE_AUTH_TOKEN win; otherwise the TURSO_* variables that Vercel's
 * Turso integration sets; otherwise the local SQLite file. Shared by the app, the scripts and drizzle-kit.
 */
export const LOCAL_DB_URL = "file:./data/harlow-brook.db";

export function databaseEnv() {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || LOCAL_DB_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
  return { url, authToken, hosted: !url.startsWith("file:") };
}
