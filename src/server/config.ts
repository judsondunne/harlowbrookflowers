import "server-only";
import type { StoreSettings } from "@/domain/settings";

/**
 * demo        – no Stripe key. Orders are recorded and clearly labelled as demonstrations; no money moves.
 * stripe_test – Stripe test keys. Real Stripe Checkout with test cards.
 * stripe_live – Stripe live keys. Only accepted when ALLOW_LIVE_PAYMENTS=true and the catalog is approved.
 */
export type PaymentMode = "demo" | "stripe_test" | "stripe_live";

export function paymentMode(): PaymentMode {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return "demo";
  return key.startsWith("sk_live_") || key.startsWith("rk_live_") ? "stripe_live" : "stripe_test";
}

/** Demo checkout runs locally by default, and in a deployed preview only when explicitly enabled. */
export function demoCheckoutEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_CHECKOUT === "true";
}

export type CheckoutGate = { open: true; mode: PaymentMode } | { open: false; mode: PaymentMode; reason: string };

export function checkoutGate(settings: StoreSettings): CheckoutGate {
  const mode = paymentMode();
  if (!settings.salesOpen) return { open: false, mode, reason: settings.closedMessage };
  if (mode === "demo" && !demoCheckoutEnabled()) {
    return { open: false, mode, reason: "Online ordering opens soon. Join the list and we'll write when pickups are posted." };
  }
  if (mode === "stripe_live") {
    if (process.env.ALLOW_LIVE_PAYMENTS !== "true") {
      return { open: false, mode, reason: "Online ordering opens soon." };
    }
    if (!settings.catalogApproved) {
      return { open: false, mode, reason: "Online ordering opens soon." };
    }
  }
  return { open: true, mode };
}

export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
