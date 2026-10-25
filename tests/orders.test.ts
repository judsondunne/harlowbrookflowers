import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { addWindow, contact, createTestDb } from "./helpers/db";
import { schema, type Database } from "@/server/db/client";
import {
  adminUpdateOrderStatus,
  createPendingOrder,
  markOrderPaid,
  releasePendingOrder,
  RESERVATION_MINUTES,
  StockConflictError,
  sweepExpiredOrders,
} from "@/server/orders";
import { confirmPayment } from "@/server/order-events";
import type { Cart } from "@/domain/cart";

const NOW = new Date("2026-10-24T14:00:00Z");
const later = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);
const gift = { recipientName: "Margaret", senderName: "Avery", message: "Enjoy", startMonth: "2027-06", notifyRecipient: false };

let db: Database;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb());
  await addWindow(db, { id: "sat", date: "2026-10-31", capacity: 3 });
});
afterEach(() => cleanup());

const bouquetCart = (qty: number, productId = "prod_garden_bouquet"): Cart => ({
  lines: [{ key: productId, productId, quantity: qty }],
  pickupWindowId: "sat",
});
const inventoryOf = async (id: string) =>
  (await db.select({ inv: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, id)))[0].inv;

describe("createPendingOrder", () => {
  it("prices from the database and holds pickup capacity", async () => {
    const res = await createPendingOrder(db, { cart: bouquetCart(2), contact, isDemo: false, now: NOW });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.order.totalCents).toBe(7000);
    expect(res.order.status).toBe("pending_payment");
    expect(res.order.number).toBe(1001);

    const second = await createPendingOrder(db, { cart: bouquetCart(2), contact, isDemo: false, now: NOW });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.quote.issues.map((i) => i.code)).toContain("pickup_full");
  });

  it("never oversells limited stock, even with simultaneous checkouts", async () => {
    await db.update(schema.products).set({ inventory: 1 }).where(eq(schema.products.id, "prod_season_of_flowers"));
    const cart: Cart = { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift }] };
    const results = await Promise.allSettled([
      createPendingOrder(db, { cart, contact, isDemo: false, now: NOW }),
      createPendingOrder(db, { cart, contact, isDemo: false, now: NOW }),
      createPendingOrder(db, { cart, contact, isDemo: false, now: NOW }),
    ]);
    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.ok);
    expect(succeeded).toHaveLength(1);
    for (const r of results) {
      if (r.status === "rejected") expect(r.reason).toBeInstanceOf(StockConflictError);
    }
    expect(await inventoryOf("prod_season_of_flowers")).toBe(0);
  });

  it("releases capacity once a hold expires", async () => {
    await createPendingOrder(db, { cart: bouquetCart(3), contact, isDemo: false, now: NOW });
    const blocked = await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: later(5) });
    expect(blocked.ok).toBe(false);
    const after = await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: later(RESERVATION_MINUTES + 1) });
    expect(after.ok).toBe(true);
  });
});

describe("payment state transitions", () => {
  it("marks paid exactly once and creates gift subscriptions once", async () => {
    const cart: Cart = { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift }] };
    const res = await createPendingOrder(db, { cart, contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    const first = await confirmPayment({ orderId: res.order.id, now: later(2), amountTotal: 10500 }, db);
    const replay = await markOrderPaid(db, { orderId: res.order.id, now: later(3), amountTotal: 10500 });
    expect(first?.status).toBe("paid");
    expect(replay.changed).toBe(false);
    const subs = await db.select().from(schema.giftSubscriptions);
    expect(subs).toHaveLength(1);
    expect(subs[0].deliveriesTotal).toBe(3);
    const emails = await db.select().from(schema.emailOutbox);
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toBe(contact.email);
  });

  it("flags an amount mismatch for review", async () => {
    const res = await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    const paid = await markOrderPaid(db, { orderId: res.order.id, now: later(1), amountTotal: 100 });
    expect(paid.order?.needsAttention).toBe(true);
  });

  it("returns stock when a checkout is abandoned, and only once", async () => {
    const cart: Cart = { lines: [{ key: "g", productId: "prod_six_months", quantity: 1, gift: { ...gift, startMonth: "2027-05" } }] };
    const before = await inventoryOf("prod_six_months");
    const res = await createPendingOrder(db, { cart, contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    expect(await inventoryOf("prod_six_months")).toBe(before! - 1);
    expect(await releasePendingOrder(db, res.order.id, "expired", later(40))).toBe(true);
    expect(await releasePendingOrder(db, res.order.id, "expired", later(41))).toBe(false);
    expect(await inventoryOf("prod_six_months")).toBe(before);
  });

  it("sweeps lapsed holds", async () => {
    await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: NOW });
    const released = await db.transaction((tx) => sweepExpiredOrders(tx, later(RESERVATION_MINUTES + 5)));
    expect(released).toBe(1);
    const [order] = await db.select().from(schema.orders);
    expect(order.status).toBe("expired");
  });

  it("recovers a payment that lands after the hold expired, if stock still fits", async () => {
    const res = await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    await releasePendingOrder(db, res.order.id, "expired", later(70));
    const paid = await markOrderPaid(db, { orderId: res.order.id, now: later(71), amountTotal: 3500 });
    expect(paid.order?.status).toBe("paid");
    expect(paid.order?.needsAttention).toBe(false);
    expect(paid.order?.inventoryReleased).toBe(false);
  });

  it("flags a late payment when the pickup day has since filled up", async () => {
    const res = await createPendingOrder(db, { cart: bouquetCart(2), contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    await releasePendingOrder(db, res.order.id, "expired", later(70));
    const other = await createPendingOrder(db, { cart: bouquetCart(3), contact, isDemo: false, now: later(71) });
    expect(other.ok).toBe(true);
    const paid = await markOrderPaid(db, { orderId: res.order.id, now: later(72), amountTotal: 7000 });
    expect(paid.order?.status).toBe("paid");
    expect(paid.order?.needsAttention).toBe(true);
  });
});

describe("admin transitions", () => {
  it("follows paid → ready → picked up and rejects invalid jumps", async () => {
    const res = await createPendingOrder(db, { cart: bouquetCart(1), contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    await expect(adminUpdateOrderStatus(db, res.order.id, "picked_up", later(1))).rejects.toThrow();
    await markOrderPaid(db, { orderId: res.order.id, now: later(1) });
    await adminUpdateOrderStatus(db, res.order.id, "ready", later(2));
    await adminUpdateOrderStatus(db, res.order.id, "picked_up", later(3));
    const [o] = await db.select().from(schema.orders);
    expect(o.status).toBe("picked_up");
    expect(o.pickedUpAt).not.toBeNull();
  });

  it("cancelling a paid order returns its stock", async () => {
    await db.update(schema.products).set({ inventory: 5 }).where(eq(schema.products.id, "prod_little_posy"));
    const res = await createPendingOrder(db, { cart: bouquetCart(2, "prod_little_posy"), contact, isDemo: false, now: NOW });
    if (!res.ok) throw new Error("expected order");
    await markOrderPaid(db, { orderId: res.order.id, now: later(1) });
    expect(await inventoryOf("prod_little_posy")).toBe(3);
    await adminUpdateOrderStatus(db, res.order.id, "cancelled", later(2));
    expect(await inventoryOf("prod_little_posy")).toBe(5);
  });
});
