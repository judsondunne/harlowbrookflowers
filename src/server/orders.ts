import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";
import { schema, type Database } from "./db/client";
import { loadProductsByIds } from "./catalog";
import { getWindow, reservedByWindow } from "./availability";
import { loadSettings } from "./settings";
import { buildQuote, type Quote } from "./pricing";
import type { Cart, CheckoutContact } from "@/domain/cart";
import { canTransition, type OrderStatus } from "@/domain/order";
import { farmToday } from "@/lib/time";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Executor = Database | Tx;

export type OrderRow = typeof schema.orders.$inferSelect;
export type OrderItemRow = typeof schema.orderItems.$inferSelect;

/** How long an unpaid checkout holds stock and pickup capacity. Longer than Stripe's 30-minute session. */
export const RESERVATION_MINUTES = 60;

export async function quoteCart(db: Executor, cart: Cart, now: Date): Promise<Quote> {
  const settings = await loadSettings(db as Database);
  const products = await loadProductsByIds(db as Database, [...new Set(cart.lines.map((l) => l.productId))]);
  const pickup = cart.pickupWindowId
    ? await getWindow(db as Database, cart.pickupWindowId, now, settings.orderCutoffHours)
    : null;
  return buildQuote({ cart, products, pickup, today: farmToday(now), taxRateBps: settings.taxRateBps });
}

export type CreateOrderResult =
  | { ok: true; order: OrderRow; items: OrderItemRow[]; quote: Quote }
  | { ok: false; quote: Quote };

/**
 * Creates a pending order and reserves stock + pickup capacity in one write transaction
 * (BEGIN IMMEDIATE), so concurrent checkouts can never oversell. Prices come only from the database.
 */
export async function createPendingOrder(
  db: Database,
  input: { cart: Cart; contact: CheckoutContact; isDemo: boolean; now: Date },
): Promise<CreateOrderResult> {
  const { cart, contact, isDemo, now } = input;
  return db.transaction(async (tx) => {
    await sweepExpiredOrders(tx, now);
    const quote = await quoteCart(tx, cart, now);
    if (!quote.ok) return { ok: false as const, quote };

    // Reserve tracked inventory with conditional decrements; any shortfall aborts the transaction.
    const qtyByProduct = new Map<string, number>();
    for (const l of quote.lines) qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    for (const [productId, qty] of qtyByProduct) {
      const res = await tx.run(
        sql`UPDATE products SET inventory = inventory - ${qty}, updated_at = ${now.toISOString()}
            WHERE id = ${productId} AND inventory IS NOT NULL AND inventory >= ${qty}`,
      );
      const tracked = await tx
        .select({ inventory: schema.products.inventory })
        .from(schema.products)
        .where(eq(schema.products.id, productId));
      if (tracked[0]?.inventory !== null && res.rowsAffected === 0) {
        throw new StockConflictError();
      }
    }

    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${schema.orders.number}), 1000) + 1` })
      .from(schema.orders);

    const orderId = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + RESERVATION_MINUTES * 60_000).toISOString();
    const [order] = await tx
      .insert(schema.orders)
      .values({
        id: orderId,
        number: Number(next),
        publicToken: randomBytes(18).toString("base64url"),
        status: "pending_payment",
        isDemo,
        customerName: contact.name,
        customerEmail: contact.email,
        customerPhone: contact.phone ?? "",
        customerNote: contact.note ?? "",
        marketingOptIn: contact.marketingOptIn,
        pickupWindowId: quote.needsPickup ? (quote.pickup?.id ?? null) : null,
        subtotalCents: quote.subtotalCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        expiresAt,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .returning();

    const items = await tx
      .insert(schema.orderItems)
      .values(
        quote.lines.map((l) => ({
          id: crypto.randomUUID(),
          orderId,
          productId: l.productId,
          productSlug: l.slug,
          productName: l.name,
          kind: l.kind,
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
          lineTotalCents: l.lineTotalCents,
          cardMessage: l.cardMessage,
          gift: l.gift,
        })),
      )
      .returning();

    return { ok: true as const, order, items, quote };
  });
}

export class StockConflictError extends Error {
  constructor() {
    super("Stock changed while checking out.");
  }
}

export async function attachStripeSession(db: Database, orderId: string, sessionId: string) {
  await db
    .update(schema.orders)
    .set({ stripeSessionId: sessionId, updatedAt: new Date().toISOString() })
    .where(eq(schema.orders.id, orderId));
}

async function restoreInventory(tx: Executor, orderId: string, now: Date) {
  const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
  const qtyByProduct = new Map<string, number>();
  for (const i of items) qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) ?? 0) + i.quantity);
  for (const [productId, qty] of qtyByProduct) {
    await tx.run(
      sql`UPDATE products SET inventory = inventory + ${qty}, updated_at = ${now.toISOString()}
          WHERE id = ${productId} AND inventory IS NOT NULL`,
    );
  }
}

/** Re-reserves stock and capacity for an order whose hold had lapsed. Returns false if it no longer fits. */
async function tryReReserve(tx: Executor, order: OrderRow, now: Date): Promise<boolean> {
  const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  if (order.pickupWindowId) {
    const window = await tx.query.pickupWindows.findFirst({ where: eq(schema.pickupWindows.id, order.pickupWindowId) });
    const reserved = (await reservedByWindow(tx as Database, now, [order.pickupWindowId])).get(order.pickupWindowId) ?? 0;
    const bouquets = items.filter((i) => i.kind === "bouquet").reduce((n, i) => n + i.quantity, 0);
    if (!window || reserved + bouquets > window.capacity) return false;
  }
  const qtyByProduct = new Map<string, number>();
  for (const i of items) qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) ?? 0) + i.quantity);
  for (const [productId, qty] of qtyByProduct) {
    const [p] = await tx.select({ inventory: schema.products.inventory }).from(schema.products).where(eq(schema.products.id, productId));
    if (p && p.inventory !== null && p.inventory < qty) return false;
  }
  for (const [productId, qty] of qtyByProduct) {
    await tx.run(
      sql`UPDATE products SET inventory = inventory - ${qty} WHERE id = ${productId} AND inventory IS NOT NULL`,
    );
  }
  return true;
}

async function createGiftSubscriptions(tx: Executor, order: OrderRow, now: Date) {
  const items = await tx
    .select()
    .from(schema.orderItems)
    .where(and(eq(schema.orderItems.orderId, order.id), eq(schema.orderItems.kind, "subscription")));
  for (const item of items) {
    const [product] = await tx.select().from(schema.products).where(eq(schema.products.id, item.productId));
    const gift = item.gift;
    if (!gift) continue;
    await tx
      .insert(schema.giftSubscriptions)
      .values({
        id: crypto.randomUUID(),
        orderId: order.id,
        orderItemId: item.id,
        productId: item.productId,
        planName: item.productName,
        deliveriesTotal: product?.deliveries ?? 1,
        recipientName: gift.recipientName,
        recipientEmail: gift.recipientEmail ?? "",
        senderName: gift.senderName,
        message: gift.message ?? "",
        startMonth: gift.startMonth,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .onConflictDoNothing();
  }
}

export type MarkPaidResult = { changed: boolean; order: OrderRow | null };

/**
 * Idempotent, replay-safe payment confirmation. Called from the verified Stripe webhook,
 * from the success page after retrieving the session from Stripe, or from the demo checkout.
 */
export async function markOrderPaid(
  db: Database,
  input: { orderId: string; now: Date; paymentIntentId?: string | null; amountTotal?: number | null; sessionId?: string | null },
): Promise<MarkPaidResult> {
  return db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, input.orderId) });
    if (!order) return { changed: false, order: null };
    if (order.status === "paid" || order.status === "ready" || order.status === "picked_up" || order.status === "refunded") {
      return { changed: false, order };
    }

    const notes: string[] = [];
    let needsAttention = order.needsAttention;
    let inventoryReleased = order.inventoryReleased;

    if (input.amountTotal != null && input.amountTotal !== order.totalCents) {
      needsAttention = true;
      notes.push(`Stripe charged ${input.amountTotal}¢ but the order total is ${order.totalCents}¢.`);
    }
    if (order.status !== "pending_payment") {
      // Payment arrived after the hold lapsed (expired/cancelled/failed). Try to restore the reservation.
      if (order.inventoryReleased) {
        const fits = await tryReReserve(tx, order, input.now);
        if (fits) inventoryReleased = false;
        else {
          needsAttention = true;
          notes.push("Paid after the checkout hold expired, and stock or pickup capacity is no longer available. Contact the customer or refund.");
        }
      }
    }

    const [updated] = await tx
      .update(schema.orders)
      .set({
        status: "paid",
        paidAt: input.now.toISOString(),
        updatedAt: input.now.toISOString(),
        stripePaymentIntentId: input.paymentIntentId ?? order.stripePaymentIntentId,
        stripeSessionId: input.sessionId ?? order.stripeSessionId,
        needsAttention,
        inventoryReleased,
        attentionNote: [order.attentionNote, ...notes].filter(Boolean).join(" "),
      })
      .where(eq(schema.orders.id, order.id))
      .returning();

    await createGiftSubscriptions(tx, updated, input.now);
    return { changed: true, order: updated };
  });
}

type ReleaseStatus = Extract<OrderStatus, "expired" | "cancelled" | "payment_failed">;

async function releasePendingOrderTx(tx: Executor, orderId: string, to: ReleaseStatus, now: Date) {
  const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order || order.status !== "pending_payment") return false;
  if (!order.inventoryReleased) await restoreInventory(tx, orderId, now);
  await tx
    .update(schema.orders)
    .set({
      status: to,
      inventoryReleased: true,
      cancelledAt: to === "cancelled" ? now.toISOString() : order.cancelledAt,
      updatedAt: now.toISOString(),
    })
    .where(eq(schema.orders.id, orderId));
  return true;
}

/** Ends an unpaid checkout and returns its stock. No-op unless the order is still pending. */
export async function releasePendingOrder(db: Database, orderId: string, to: ReleaseStatus, now: Date) {
  return db.transaction((tx) => releasePendingOrderTx(tx, orderId, to, now));
}

/** Expires pending orders whose hold has lapsed. Safe to call often; pass a transaction or the database. */
export async function sweepExpiredOrders(db: Executor, now: Date) {
  const stale = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.status, "pending_payment"), lt(schema.orders.expiresAt, now.toISOString())));
  for (const { id } of stale) await releasePendingOrderTx(db, id, "expired", now);
  return stale.length;
}

/** Manual status changes from the admin. Cancelling or refunding before pickup returns stock. */
export async function adminUpdateOrderStatus(db: Database, orderId: string, to: OrderStatus, now: Date) {
  return db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
    if (!order) throw new Error("Order not found");
    if (order.status === "pending_payment" && to === "cancelled") {
      await releasePendingOrderTx(tx, orderId, "cancelled", now);
      return;
    }
    if (!canTransition(order.status, to)) {
      throw new Error(`Can't change an order from ${order.status} to ${to}.`);
    }
    const releases = (to === "cancelled" || to === "refunded") && order.status !== "picked_up" && !order.inventoryReleased;
    if (releases) await restoreInventory(tx, orderId, now);
    const stamp = now.toISOString();
    await tx
      .update(schema.orders)
      .set({
        status: to,
        inventoryReleased: releases ? true : order.inventoryReleased,
        readyAt: to === "ready" ? stamp : order.readyAt,
        pickedUpAt: to === "picked_up" ? stamp : order.pickedUpAt,
        cancelledAt: to === "cancelled" ? stamp : order.cancelledAt,
        updatedAt: stamp,
      })
      .where(eq(schema.orders.id, orderId));
    if (to === "cancelled" || to === "refunded") {
      await tx
        .update(schema.giftSubscriptions)
        .set({ status: "cancelled", updatedAt: stamp })
        .where(eq(schema.giftSubscriptions.orderId, orderId));
    }
  });
}

export async function getOrderByToken(db: Database, token: string) {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.publicToken, token) });
  if (!order) return null;
  return loadOrderDetail(db, order);
}

export async function getOrderBySession(db: Database, sessionId: string) {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.stripeSessionId, sessionId) });
  if (!order) return null;
  return loadOrderDetail(db, order);
}

export async function loadOrderDetail(db: Database, order: OrderRow) {
  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  const window = order.pickupWindowId
    ? ((await db.query.pickupWindows.findFirst({ where: eq(schema.pickupWindows.id, order.pickupWindowId) })) ?? null)
    : null;
  const gifts = await db.select().from(schema.giftSubscriptions).where(eq(schema.giftSubscriptions.orderId, order.id));
  return { order, items, window, gifts };
}
export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderByToken>>>;

/** Orders for a set of pickup windows, used by the admin picking list. */
export async function ordersForWindows(db: Database, windowIds: string[]) {
  if (!windowIds.length) return [];
  return db
    .select()
    .from(schema.orders)
    .where(and(isNotNull(schema.orders.pickupWindowId), inArray(schema.orders.pickupWindowId, windowIds)));
}
