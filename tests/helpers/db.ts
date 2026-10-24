import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/server/db/schema";
import { seedProducts } from "@/server/db/seed-data";
import type { Database } from "@/server/db/client";
import { serializeLocalClient } from "@/server/db/serialize";

/** A fresh, migrated, seeded SQLite database in a temp directory. */
export async function createTestDb() {
  const dir = mkdtempSync(path.join(tmpdir(), "hb-test-"));
  const client = serializeLocalClient(createClient({ url: `file:${path.join(dir, "test.db")}`, timeout: 5000 }));
  const db = drizzle(client, { schema }) as unknown as Database;
  await migrate(db, { migrationsFolder: path.resolve(__dirname, "../../drizzle") });
  for (const p of seedProducts) {
    await db.insert(schema.products).values({ ...p, displayScale: Math.round(p.displayScale * 100) });
  }
  return {
    db,
    cleanup: () => {
      client.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

export async function addWindow(db: Database, w: { id: string; date: string; capacity: number; startTime?: string; endTime?: string; status?: "open" | "closed" }) {
  await db.insert(schema.pickupWindows).values({
    id: w.id,
    date: w.date,
    startTime: w.startTime ?? "09:00",
    endTime: w.endTime ?? "12:00",
    capacity: w.capacity,
    status: w.status ?? "open",
  });
}

export const contact = { name: "Test Buyer", email: "buyer@example.com", phone: "", note: "", marketingOptIn: false };
