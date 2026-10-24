import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db as defaultDb, schema, type Database } from "./db/client";
import type { Product, ProductKind, ProductStatus } from "@/domain/catalog";

type ProductRow = typeof schema.products.$inferSelect;

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    status: row.status,
    name: row.name,
    tagline: row.tagline,
    summary: row.summary,
    description: row.description,
    priceCents: row.priceCents,
    sizeLabel: row.sizeLabel,
    displayScale: Math.min(1, Math.max(0.5, row.displayScale / 100)),
    details: row.details ?? [],
    care: row.care ?? [],
    images: row.images ?? [],
    inventory: row.inventory,
    maxPerOrder: row.maxPerOrder,
    deliveries: row.deliveries,
    startMonths: row.startMonths ?? [],
    availableFrom: row.availableFrom,
    availableUntil: row.availableUntil,
    featured: row.featured,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt,
  };
}

export async function listProducts(db: Database, statuses: ProductStatus[]) {
  const rows = await db
    .select()
    .from(schema.products)
    .where(inArray(schema.products.status, statuses))
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.name));
  return rows.map(rowToProduct);
}

export async function loadProductsByIds(db: Database, ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.select().from(schema.products).where(inArray(schema.products.id, ids));
  return rows.map(rowToProduct);
}

/** Storefront catalog (active + hidden). Cached; admin edits and orders invalidate the "catalog" tag. */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return listProducts(defaultDb, ["active", "hidden"]);
}

/** Products listed publicly (active only), optionally by kind. */
export async function getListedProducts(kind?: ProductKind) {
  const all = await getCatalog();
  return all.filter((p) => p.status === "active" && (!kind || p.kind === kind));
}

export async function getProductBySlug(slug: string) {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProductForAdmin(id: string, db: Database = defaultDb) {
  const row = await db.query.products.findFirst({ where: eq(schema.products.id, id) });
  return row ? rowToProduct(row) : null;
}
