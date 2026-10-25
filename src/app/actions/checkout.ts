"use server";

import { redirect } from "next/navigation";
import { cartSchema, checkoutContactSchema } from "@/domain/cart";
import { startCheckout } from "@/server/checkout";
import { db } from "@/server/db/client";
import { getOrderByToken, releasePendingOrder } from "@/server/orders";
import { confirmPayment } from "@/server/order-events";
import { demoCheckoutEnabled, paymentMode } from "@/server/config";
import type { QuoteIssue } from "@/server/pricing";

export type CheckoutFormState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "note", string>>;
  issues?: QuoteIssue[];
  values?: Record<string, string>;
};

export async function checkoutAction(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  const contact = checkoutContactSchema.safeParse({ ...values, marketingOptIn: formData.get("marketingOptIn") === "on" });
  if (!contact.success) {
    const fieldErrors: CheckoutFormState["fieldErrors"] = {};
    for (const issue of contact.error.issues) {
      const key = issue.path[0] as keyof NonNullable<CheckoutFormState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { message: "Please check the highlighted details.", fieldErrors, values };
  }

  let cartJson: unknown;
  try {
    cartJson = JSON.parse(String(formData.get("cart") ?? "{}"));
  } catch {
    cartJson = null;
  }
  const cart = cartSchema.safeParse(cartJson);
  if (!cart.success || cart.data.lines.length === 0) {
    return { message: "Your cart is empty or out of date. Please review it and try again.", values };
  }

  const result = await startCheckout(cart.data, contact.data);
  if (!result.ok) return { message: result.message, issues: result.issues, values };
  redirect(result.redirectTo as never);
}

/** Demo checkout only: simulates the payment provider's outcome through the real state machine. */
export async function demoPaymentAction(formData: FormData) {
  if (paymentMode() !== "demo" || !demoCheckoutEnabled()) throw new Error("Demo checkout is disabled.");
  const token = String(formData.get("token") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const detail = await getOrderByToken(db, token);
  if (!detail || !detail.order.isDemo) redirect("/cart");

  if (outcome === "succeed") {
    await confirmPayment({ orderId: detail.order.id, now: new Date(), amountTotal: detail.order.totalCents });
    redirect(`/order/success?token=${token}`);
  }
  await releasePendingOrder(db, detail.order.id, outcome === "fail" ? "payment_failed" : "cancelled", new Date());
  redirect(`/checkout?${outcome === "fail" ? "failed" : "canceled"}=${token}` as never);
}

/**
 * Called when a shopper returns from a cancelled or failed payment. Ends the hold right away so stock
 * is released, but only after confirming with Stripe that the session wasn't actually paid.
 */
export async function releaseCheckoutAction(token: string): Promise<{ released: boolean }> {
  if (typeof token !== "string" || token.length < 16 || token.length > 64) return { released: false };
  const detail = await getOrderByToken(db, token);
  if (!detail || detail.order.status !== "pending_payment") return { released: false };
  const { order } = detail;
  if (order.stripeSessionId) {
    const { getStripe } = await import("@/server/stripe");
    try {
      const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      if (session.status === "complete") return { released: false };
      if (session.status === "open") await getStripe().checkout.sessions.expire(order.stripeSessionId);
    } catch (e) {
      console.error("[checkout] could not verify session before release", e);
      return { released: false };
    }
  }
  const released = await releasePendingOrder(db, order.id, "cancelled", new Date());
  return { released };
}
