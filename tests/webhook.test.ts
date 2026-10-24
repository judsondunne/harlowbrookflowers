import { beforeAll, describe, expect, it } from "vitest";
import path from "node:path";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Cart } from "@/domain/cart";

// The route uses the app's default connection (DATABASE_URL points at a temp file in vitest.config.ts).
process.env.STRIPE_SECRET_KEY = "sk_test_harlow_brook_unit";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_harlow_brook_unit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET;
const contact = { name: "Webhook Buyer", email: "hook@example.com", phone: "", note: "", marketingOptIn: false };

let db: typeof import("@/server/db/client").db;
let schema: typeof import("@/server/db/client").schema;
let POST: (req: Request) => Promise<Response>;
let orders: typeof import("@/server/orders");

beforeAll(async () => {
  ({ db, schema } = await import("@/server/db/client"));
  await migrate(db, { migrationsFolder: path.resolve(__dirname, "../drizzle") });
  const { seedProducts } = await import("@/server/db/seed-data");
  for (const p of seedProducts) {
    await db.insert(schema.products).values({ ...p, displayScale: Math.round(p.displayScale * 100) }).onConflictDoNothing();
  }
  orders = await import("@/server/orders");
  ({ POST } = await import("@/app/api/webhooks/stripe/route"));
});

function signed(event: object) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": header } });
}

async function pendingGiftOrder() {
  const cart: Cart = {
    lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift: { recipientName: "M", senderName: "A", message: "", startMonth: "2027-06", notifyRecipient: false } }],
  };
  const res = await orders.createPendingOrder(db, { cart, contact, isDemo: false, now: new Date() });
  if (!res.ok) throw new Error("expected order");
  return res.order;
}

const sessionEvent = (id: string, type: string, orderId: string, extra: object = {}) => ({
  id,
  object: "event",
  type,
  data: { object: { id: `cs_test_${id}`, object: "checkout.session", metadata: { orderId }, payment_status: "paid", amount_total: 10500, payment_intent: `pi_${id}`, ...extra } },
});

describe("Stripe webhook", () => {
  it("rejects requests without a valid signature", async () => {
    const bad = new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=nope" } });
    expect((await POST(bad)).status).toBe(400);
    const missing = new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}" });
    expect((await POST(missing)).status).toBe(400);
  });

  it("confirms payment once, even when Stripe delivers the event twice", async () => {
    const order = await pendingGiftOrder();
    const event = sessionEvent("evt_paid_1", "checkout.session.completed", order.id);
    const first = await POST(signed(event));
    expect(first.status).toBe(200);
    const replay = await POST(signed(event));
    expect(await replay.json()).toMatchObject({ duplicate: true });

    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, order.id));
    expect(row.status).toBe("paid");
    expect(row.stripePaymentIntentId).toBe("pi_evt_paid_1");
    const subs = await db.select().from(schema.giftSubscriptions).where(eq(schema.giftSubscriptions.orderId, order.id));
    expect(subs).toHaveLength(1);
  });

  it("does not confirm sessions that aren't paid yet", async () => {
    const order = await pendingGiftOrder();
    await POST(signed(sessionEvent("evt_unpaid", "checkout.session.completed", order.id, { payment_status: "unpaid" })));
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, order.id));
    expect(row.status).toBe("pending_payment");
  });

  it("releases the hold when a checkout session expires", async () => {
    const order = await pendingGiftOrder();
    const res = await POST(signed(sessionEvent("evt_exp", "checkout.session.expired", order.id)));
    expect(res.status).toBe(200);
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, order.id));
    expect(row.status).toBe("expired");
    expect(row.inventoryReleased).toBe(true);
  });
});
