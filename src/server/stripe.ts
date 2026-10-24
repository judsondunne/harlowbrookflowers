import "server-only";
import Stripe from "stripe";
import { siteOrigin } from "./config";
import type { OrderItemRow, OrderRow } from "./orders";
import type { PickupWindow } from "@/domain/catalog";
import { formatOrderNumber } from "@/lib/format";
import { formatDateLong, formatTimeRange } from "@/lib/time";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  client ??= new Stripe(key, { appInfo: { name: "Harlow Brook Flowers" } });
  return client;
}

/**
 * Hosted Stripe Checkout. Amounts come from the order rows the server just priced; nothing from the browser.
 * Apple Pay, Google Pay and Link appear automatically when enabled in the Stripe dashboard.
 */
export async function createCheckoutSession(order: OrderRow, items: OrderItemRow[], window: PickupWindow | null) {
  const origin = siteOrigin();
  const publicImages = origin.startsWith("https://");
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.productName,
        description:
          item.kind === "subscription" && item.gift
            ? `Gift for ${item.gift.recipientName}, starting ${item.gift.startMonth}`
            : "Seasonal bouquet. Final arrangement varies with what's in bloom.",
        ...(publicImages ? { images: [`${origin}/images/bouquets/${item.productSlug}.webp`] } : {}),
        metadata: { productId: item.productId },
      },
    },
  }));
  if (order.taxCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: order.taxCents, product_data: { name: "Sales tax" } },
    });
  }

  const pickupText = window
    ? `Pickup in Hartland, Vermont: ${formatDateLong(window.date)}, ${formatTimeRange(window.startTime, window.endTime)}.`
    : "Gift subscription. Sarah will confirm pickup dates by email.";

  return getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems,
      customer_email: order.customerEmail,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: formatOrderNumber(order.number) },
      payment_intent_data: {
        metadata: { orderId: order.id, orderNumber: formatOrderNumber(order.number) },
        description: `Harlow Brook Flowers order ${formatOrderNumber(order.number)}`,
      },
      submit_type: "pay",
      custom_text: { submit: { message: pickupText } },
      // Stripe requires at least 30 minutes; our own hold lasts longer (see RESERVATION_MINUTES).
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=${order.publicToken}`,
    },
    { idempotencyKey: `checkout-${order.id}` },
  );
}
