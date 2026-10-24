import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db as defaultDb, schema, type Database } from "./db/client";
import { DEFAULT_SETTINGS, settingsSchema, type StoreSettings } from "@/domain/settings";

/** Reads settings, falling back to defaults per key so one bad value never breaks the store. */
export async function loadSettings(db: Database = defaultDb): Promise<StoreSettings> {
  const rows = await db.select().from(schema.settings);
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  const shape = settingsSchema.shape;
  for (const row of rows) {
    const field = shape[row.key as keyof typeof shape];
    if (!field) continue;
    const parsed = field.safeParse(row.value);
    if (parsed.success) merged[row.key] = parsed.data;
  }
  return merged as StoreSettings;
}

/** Cached for storefront rendering; invalidated with the "settings" tag on save. */
export async function getSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  return loadSettings();
}

export async function saveSettings(values: Partial<StoreSettings>, db: Database = defaultDb) {
  const parsed = settingsSchema.partial().parse(values);
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(parsed)) {
    await db
      .insert(schema.settings)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: now } });
  }
}
