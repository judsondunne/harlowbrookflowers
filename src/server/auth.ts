import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "./db/client";

export const ADMIN_COOKIE = "hb_admin";
const SESSION_DAYS = 14;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type AdminUser = { id: string; email: string; name: string };

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(schema.adminSessions).values({ id: hashToken(token), userId, expiresAt: expires.toISOString() });
  await db.delete(schema.adminSessions).where(lt(schema.adminSessions.expiresAt, new Date().toISOString()));
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Resolves the signed-in admin from the session cookie, or null. Reads request data: call inside Suspense. */
export async function getAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  await connection();
  const [row] = await db
    .select({ id: schema.adminUsers.id, email: schema.adminUsers.email, name: schema.adminUsers.name })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(and(eq(schema.adminSessions.id, hashToken(token)), gt(schema.adminSessions.expiresAt, new Date().toISOString())))
    .limit(1);
  return row ?? null;
}

/** Authorization gate for every admin page, action and export. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, hashToken(token)));
  store.delete(ADMIN_COOKIE);
}
