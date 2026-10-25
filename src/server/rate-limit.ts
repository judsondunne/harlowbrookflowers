import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db as defaultDb, schema, type Database } from "./db/client";

/** Fixed-window limiter stored in the database, so it works across serverless instances. */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  db: Database = defaultDb,
  nowMs = Date.now(),
): Promise<{ ok: boolean; retryAfterSeconds: number }> {
  return db.transaction(async (tx) => {
    const row = await tx.query.rateLimits.findFirst({ where: eq(schema.rateLimits.key, key) });
    const windowMs = windowSeconds * 1000;
    if (!row || nowMs - row.windowStart >= windowMs) {
      await tx
        .insert(schema.rateLimits)
        .values({ key, count: 1, windowStart: nowMs })
        .onConflictDoUpdate({ target: schema.rateLimits.key, set: { count: 1, windowStart: nowMs } });
      return { ok: true, retryAfterSeconds: 0 };
    }
    if (row.count >= limit) {
      return { ok: false, retryAfterSeconds: Math.ceil((row.windowStart + windowMs - nowMs) / 1000) };
    }
    await tx.update(schema.rateLimits).set({ count: row.count + 1 }).where(eq(schema.rateLimits.key, key));
    return { ok: true, retryAfterSeconds: 0 };
  });
}

/** Hashed client fingerprint, so raw IP addresses are never stored. */
export async function clientFingerprint() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
  return createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? "harlow-brook"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}
