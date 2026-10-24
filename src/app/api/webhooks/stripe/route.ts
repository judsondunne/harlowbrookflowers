import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { getStripe } from "@/server/stripe";
import { confirmPayment } from "@/server/order-events";
import { releasePendingOrder } from "@/server/orders";

/**
 * Stripe webhook: the authoritative source of payment state.
 * - Signature verified with STRIPE_WEBHOOK_SECRET against the raw body.
 * - Idempotent: each event id is recorded; replays are acknowledged without reprocessing.
 * - All transitions are themselves idempotent and only move orders forward.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response("Webhooks not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const seen = await db.query.webhookEvents.findFirst({ where: eq(schema.webhookEvents.id, event.id) });
  if (seen) return Response.json({ received: true, duplicate: true });

  try {
    await handle(event);
  } catch (e) {
    console.error(`[stripe] failed to process ${event.type} ${event.id}`, e);
    // Non-2xx tells Stripe to retry later; nothing has been recorded for this event yet.
    return new Response("Processing error", { status: 500 });
  }

  await db.insert(schema.webhookEvents).values({ id: event.id, type: event.type }).onConflictDoNothing();
  return Response.json({ received: true });
}

async function handle(event: Stripe.Event) {
  const now = new Date();
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return;
      if (session.payment_status !== "paid") return; // async methods confirm later
      await confirmPayment({
        orderId,
        now,
        sessionId: session.id,
        amountTotal: session.amount_total,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      });
      return;
    }
    case "checkout.session.async_payment_failed": {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await releasePendingOrder(db, orderId, "payment_failed", now);
      return;
    }
    case "checkout.session.expired": {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await releasePendingOrder(db, orderId, "expired", now);
      return;
    }
    case "charge.refunded": {
      // Refunds are issued from the Stripe dashboard; record them on the order for Sarah.
      const charge = event.data.object;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!pi) return;
      const order = await db.query.orders.findFirst({ where: eq(schema.orders.stripePaymentIntentId, pi) });
      if (!order) return;
      const full = charge.amount_refunded >= charge.amount;
      await db
        .update(schema.orders)
        .set({
          needsAttention: !full || order.needsAttention,
          attentionNote: [order.attentionNote, full ? "" : `Partially refunded ${charge.amount_refunded}¢ in Stripe.`].filter(Boolean).join(" "),
          adminNotes: [order.adminNotes, `Refund recorded from Stripe (${charge.amount_refunded}¢).`].filter(Boolean).join("\n"),
          updatedAt: now.toISOString(),
        })
        .where(eq(schema.orders.id, order.id));
      return;
    }
    default:
      return;
  }
}
