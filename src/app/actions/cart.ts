"use server";

import { db } from "@/server/db/client";
import { cartSchema, type Cart } from "@/domain/cart";
import { quoteCart } from "@/server/orders";
import { getUpcomingWindows } from "@/server/availability";
import { loadSettings } from "@/server/settings";
import { checkoutGate } from "@/server/config";
import type { Quote } from "@/server/pricing";
import type { PickupWindowAvailability } from "@/domain/catalog";

export type CartSnapshot = {
  quote: Quote;
  windows: PickupWindowAvailability[];
  checkout: { open: boolean; reason?: string; demo: boolean };
  pickupLocation: string;
};

/** Authoritative cart pricing + availability for the cart drawer, cart page and checkout. */
export async function getCartSnapshot(raw: Cart): Promise<CartSnapshot> {
  const parsed = cartSchema.safeParse(raw);
  const cart: Cart = parsed.success ? parsed.data : { lines: [] };
  const now = new Date();
  const settings = await loadSettings();
  const [quote, windows] = await Promise.all([
    quoteCart(db, cart, now),
    getUpcomingWindows(db, { now, cutoffHours: settings.orderCutoffHours, limit: 24 }),
  ]);
  const gate = checkoutGate(settings);
  return {
    quote,
    windows,
    checkout: { open: gate.open, reason: gate.open ? undefined : gate.reason, demo: gate.mode === "demo" },
    pickupLocation: settings.pickupLocationPublic,
  };
}
