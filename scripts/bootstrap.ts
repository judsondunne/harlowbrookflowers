/**
 * Deploy-time database setup (vercel.json build command): always migrate; seed the demo catalog only when the
 * database has no products yet. A fresh Turso database sets itself up on its first deploy, and later deploys
 * never touch real data. Disposable previews (no hosted database) start empty every build, so they always seed.
 */
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { scriptDb } from "./db";
import { seedDatabase } from "./lib/seed";
import * as schema from "../src/server/db/schema";

const { db, client, url } = scriptDb();
await migrate(db, { migrationsFolder: "./drizzle" });
const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(schema.products);
if (Number(n) === 0) {
  console.log(`Empty database at ${url.replace(/\?.*$/, "")}: seeding the demo catalog.`);
  await seedDatabase(db);
} else {
  console.log(`✓ Database ready (${n} products); nothing seeded.`);
}
client.close();
