/** `npm run db:seed`: the demo catalog, pickup windows, settings and optional admin (see lib/seed.ts). */
import { scriptDb } from "./db";
import { seedDatabase } from "./lib/seed";

const { db, client } = scriptDb();
await seedDatabase(db, { resetCatalog: process.argv.includes("--reset-catalog") });
client.close();
