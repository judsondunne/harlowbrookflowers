import "server-only";
import { revalidateTag } from "next/cache";
import { db } from "./db/client";
import { checkoutGate } from "./config";
import { loadSettings } from "./settings";
import { attachStripeSession, createPendingOrder, releasePendingOrder, StockConflictError } from "./orders";
import { createCheckoutSession } from "./stripe";
import type { Cart, CheckoutContact } from "@/domain/cart";
import type { QuoteIssue } from "./pricing";

export type StartCheckoutResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; issues?: QuoteIssue[] };

/** Server-authoritative checkout: validates, prices, reserves, then hands off to Stripe (or demo). */
export async function startCheckout(cart: Cart, contact: CheckoutContact): Promise<StartCheckoutResult> {
  const settings = await loadSettings();
  const gate = checkoutGate(settings);
  if (!gate.open) return { ok: false, message: gate.reason };

  let result;
  try {
    result = await createPendingOrder(db, { cart, contact, isDemo: gate.mode === "demo", now: new Date() });
  } catch (e) {
    if (e instanceof StockConflictError) {
      return { ok: false, message: "Someone just ordered the last of one of your items. Please review your cart." };
    }
    throw e;
  }
  if (!result.ok) {
    return { ok: false, message: "Please review your cart before continuing.", issues: result.quote.issues };
  }
  revalidateTag("catalog", "max");

  const { order, items, quote } = result;
  if (gate.mode === "demo") {
    return { ok: true, redirectTo: `/checkout/demo?token=${order.publicToken}` };
  }

  try {
    const session = await createCheckoutSession(order, items, quote.pickup);
    await attachStripeSession(db, order.id, session.id);
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { ok: true, redirectTo: session.url };
  } catch (e) {
    console.error("[checkout] Stripe session failed", e);
    await releasePendingOrder(db, order.id, "cancelled", new Date());
    return {
      ok: false,
      message: "We couldn't open secure payment just now. Nothing was charged; please try again in a moment.",
    };
  }
}
