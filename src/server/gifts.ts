import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db as defaultDb, schema, type Database } from "./db/client";
import { DEFAULT_CARD_STYLE, isCardStyle } from "@/domain/gift-card";
import { addMonths } from "@/lib/time";
import { site } from "@/lib/site";

export type GiftRow = typeof schema.giftSubscriptions.$inferSelect;

/** The recipient's gift page, private to whoever holds the link. */
export const giftPagePath = (token: string) => `/gift/${token}`;
export const giftPageUrl = (token: string) => `${site.url}${giftPagePath(token)}`;
/** The gift's link-preview image: a stable address, so the confirmation page can show it too. */
export const giftCardImagePath = (token: string) => `${giftPagePath(token)}/card`;

/** Bouquet cutouts for a set of gifts' plans, for the Garden card design. */
export async function giftPlanImages(gifts: Pick<GiftRow, "productId">[], db: Database = defaultDb) {
  const ids = [...new Set(gifts.map((g) => g.productId))];
  if (!ids.length) return new Map<string, string>();
  const rows = await db.select({ id: schema.products.id, images: schema.products.images }).from(schema.products).where(inArray(schema.products.id, ids));
  return new Map(rows.flatMap((r) => (r.images.find((i) => i.kind === "cutout") ? [[r.id, r.images.find((i) => i.kind === "cutout")!.src] as const] : [])));
}

/** A gift by its share token. Gifts only exist once their order is paid, so a match is always a real gift. */
export async function getGiftByShareToken(token: string, db: Database = defaultDb) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const [gift] = await db.select().from(schema.giftSubscriptions).where(eq(schema.giftSubscriptions.shareToken, token)).limit(1);
  if (!gift) return null;
  const image = (await giftPlanImages([gift], db)).get(gift.productId) ?? null;
  return { gift, image, ...giftSummary(gift) };
}

/** Display facts shared by the gift page, its link preview and the confirmation page. */
export function giftSummary(gift: Pick<GiftRow, "deliveriesTotal" | "startMonth" | "cardStyle">) {
  const endMonth = addMonths(gift.startMonth, Math.max(0, gift.deliveriesTotal - 1));
  return { endMonth, design: isCardStyle(gift.cardStyle) ? gift.cardStyle : DEFAULT_CARD_STYLE };
}
