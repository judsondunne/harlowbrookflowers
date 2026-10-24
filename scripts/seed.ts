/**
 * Seeds a fresh database with the DEMO catalog, rolling demo pickup windows, default settings
 * and (optionally) an admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Safe to re-run: existing products and settings are left untouched unless --reset-catalog is passed.
 */
import { eq } from "drizzle-orm";
import { scriptDb } from "./db";
import * as schema from "../src/server/db/schema";
import { demoPickupWindows, seedProducts } from "../src/server/db/seed-data";
import { DEFAULT_SETTINGS } from "../src/domain/settings";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/server/password";

const resetCatalog = process.argv.includes("--reset-catalog");
const { db, client } = scriptDb();

for (const p of seedProducts) {
  const row = { ...p, displayScale: Math.round(p.displayScale * 100) };
  const existing = await db.query.products.findFirst({ where: eq(schema.products.id, p.id) });
  if (!existing) {
    await db.insert(schema.products).values(row);
    console.log(`+ product ${p.slug}`);
  } else if (resetCatalog) {
    await db.update(schema.products).set({ ...row, updatedAt: new Date().toISOString() }).where(eq(schema.products.id, p.id));
    console.log(`~ product ${p.slug} reset`);
  }
}

const windows = demoPickupWindows(new Date());
for (const w of windows) {
  await db.insert(schema.pickupWindows).values(w).onConflictDoNothing();
}
console.log(`+ ${windows.length} demo pickup windows (existing ones kept)`);

for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
  await db.insert(schema.settings).values({ key, value }).onConflictDoNothing();
}
console.log("+ default settings (existing values kept)");

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (email && password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(`! ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters; admin not created.`);
  } else {
    const existing = await db.query.adminUsers.findFirst({ where: eq(schema.adminUsers.email, email) });
    if (!existing) {
      await db.insert(schema.adminUsers).values({
        id: crypto.randomUUID(),
        email,
        name: process.env.ADMIN_NAME ?? "Sarah",
        passwordHash: await hashPassword(password),
      });
      console.log(`+ admin user ${email}`);
    }
  }
} else {
  console.log("· No ADMIN_EMAIL/ADMIN_PASSWORD set; run `npm run admin:create` to add an admin.");
}

client.close();
