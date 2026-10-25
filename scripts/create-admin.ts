/**
 * Create or reset an admin login.
 *   npm run admin:create -- --email sarah@example.com --name Sarah
 * The password is read from the ADMIN_PASSWORD env var, or prompted for interactively.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { eq } from "drizzle-orm";
import { scriptDb } from "./db";
import * as schema from "../src/server/db/schema";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/server/password";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const rl = createInterface({ input: stdin, output: stdout });
const email = (arg("email") ?? (await rl.question("Admin email: "))).trim().toLowerCase();
const name = arg("name") ?? "Sarah";
const password = process.env.ADMIN_PASSWORD ?? (await rl.question(`Password (min ${MIN_PASSWORD_LENGTH} chars): `));
rl.close();

if (!email.includes("@")) throw new Error("A valid email is required.");
if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

const { db, client } = scriptDb();
const passwordHash = await hashPassword(password);
const existing = await db.query.adminUsers.findFirst({ where: eq(schema.adminUsers.email, email) });
if (existing) {
  await db.update(schema.adminUsers).set({ passwordHash, name, updatedAt: new Date().toISOString() }).where(eq(schema.adminUsers.id, existing.id));
  await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, existing.id));
  console.log(`✓ Password reset for ${email} (existing sessions signed out)`);
} else {
  await db.insert(schema.adminUsers).values({ id: crypto.randomUUID(), email, name, passwordHash });
  console.log(`✓ Admin created: ${email}`);
}
client.close();
