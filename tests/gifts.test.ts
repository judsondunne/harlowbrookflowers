import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { contact, createTestDb } from "./helpers/db";
import { schema, type Database } from "@/server/db/client";
import { createPendingOrder, markOrderPaid } from "@/server/orders";
import { getGiftByShareToken, giftSummary } from "@/server/gifts";
import { giftDetailsSchema, type Cart } from "@/domain/cart";

const NOW = new Date("2026-10-24T14:00:00Z");
const gift = {
  recipientName: "Margaret Ellis",
  senderName: "Jo",
  message: "Something to look forward to.",
  startMonth: "2027-07",
  notifyRecipient: false,
  cardStyle: "evening" as const,
};

let db: Database;
let cleanup: () => void;
beforeEach(async () => ({ db, cleanup } = await createTestDb()));
afterEach(() => cleanup());

async function paidGift(details: Cart["lines"][number]["gift"] = gift) {
  const cart: Cart = { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift: details }] };
  const res = await createPendingOrder(db, { cart, contact, isDemo: false, now: NOW });
  if (!res.ok) throw new Error("order failed");
  await markOrderPaid(db, { orderId: res.order.id, now: NOW, amountTotal: res.order.totalCents });
  const [row] = await db.select().from(schema.giftSubscriptions).where(eq(schema.giftSubscriptions.orderId, res.order.id));
  return row;
}

describe("gift pages", () => {
  it("gives every paid gift a private share token and keeps the chosen card design", async () => {
    const row = await paidGift();
    expect(row.shareToken).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(row.cardStyle).toBe("evening");

    const found = await getGiftByShareToken(row.shareToken!, db);
    expect(found?.gift.recipientName).toBe("Margaret Ellis");
    expect(found?.design).toBe("evening");
    expect(found?.endMonth).toBe("2027-09");
    expect(found?.image).toMatch(/season-of-flowers/);
  });

  it("falls back to the classic card for gifts without a design", async () => {
    const older = { ...gift, cardStyle: undefined };
    const row = await paidGift(older);
    expect(row.cardStyle).toBe("letterpress");
    expect(giftSummary({ ...row, cardStyle: "unknown" }).design).toBe("letterpress");
  });

  it("finds nothing for unknown or malformed tokens", async () => {
    await paidGift();
    expect(await getGiftByShareToken("x".repeat(22), db)).toBeNull();
    expect(await getGiftByShareToken("../../etc/passwd", db)).toBeNull();
    expect(await getGiftByShareToken("", db)).toBeNull();
  });

  it("only accepts the four card designs", () => {
    expect(giftDetailsSchema.safeParse({ ...gift, cardStyle: "garden" }).success).toBe(true);
    expect(giftDetailsSchema.safeParse({ ...gift, cardStyle: "neon" }).success).toBe(false);
  });
});
