import { describe, expect, it } from "vitest";
import { buildQuote } from "@/server/pricing";
import { windowAvailability } from "@/server/availability";
import { seedProducts } from "@/server/db/seed-data";
import type { PickupWindow, Product } from "@/domain/catalog";

const products: Product[] = seedProducts.map((p) => ({ ...p, updatedAt: "2026-10-01T00:00:00Z" }));
const byId = (id: string) => products.find((p) => p.id === id)!;
const today = "2026-10-24";
const now = new Date("2026-10-24T14:00:00Z");

const window: PickupWindow = { id: "w1", date: "2026-10-31", startTime: "09:00", endTime: "12:00", label: "", capacity: 5, status: "open", notes: "" };
const open = windowAvailability(window, 0, now, 36);

const gift = { recipientName: "Margaret", senderName: "Avery", message: "", startMonth: "2027-06", notifyRecipient: false };

describe("buildQuote", () => {
  it("prices lines from the catalog, never from the cart", () => {
    const q = buildQuote({
      cart: { lines: [{ key: "a", productId: "prod_garden_bouquet", quantity: 2 }], pickupWindowId: "w1" },
      products,
      pickup: open,
      today,
      taxRateBps: 0,
    });
    expect(q.ok).toBe(true);
    expect(q.subtotalCents).toBe(7000);
    expect(q.totalCents).toBe(7000);
    expect(q.bouquetCount).toBe(2);
  });

  it("adds tax only when a rate is configured, rounded to the cent", () => {
    const q = buildQuote({
      cart: { lines: [{ key: "a", productId: "prod_little_posy", quantity: 1 }], pickupWindowId: "w1" },
      products,
      pickup: open,
      today,
      taxRateBps: 600,
    });
    expect(q.taxCents).toBe(120);
    expect(q.totalCents).toBe(2120);
  });

  it("requires a pickup day for bouquets but not for gift subscriptions", () => {
    const bouquet = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_little_posy", quantity: 1 }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(bouquet.ok).toBe(false);
    expect(bouquet.issues.map((i) => i.code)).toContain("pickup_required");

    const sub = buildQuote({ cart: { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(sub.ok).toBe(true);
    expect(sub.needsPickup).toBe(false);
    expect(sub.totalCents).toBe(10500);
  });

  it("rejects more bouquets than the pickup day has room for", () => {
    const q = buildQuote({
      cart: { lines: [{ key: "a", productId: "prod_garden_bouquet", quantity: 4 }], pickupWindowId: "w1" },
      products,
      pickup: windowAvailability(window, 3, now, 36),
      today,
      taxRateBps: 0,
    });
    expect(q.issues.map((i) => i.code)).toContain("pickup_full");
  });

  it("enforces stock, per-order limits and seasonal dates", () => {
    const limited = products.map((p) => (p.id === "prod_garden_bouquet" ? { ...p, inventory: 1 } : p));
    const stock = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_garden_bouquet", quantity: 2 }], pickupWindowId: "w1" }, products: limited, pickup: open, today, taxRateBps: 0 });
    expect(stock.issues.map((i) => i.code)).toContain("insufficient_stock");

    const many = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_harlow_brook_bunch", quantity: 5 }], pickupWindowId: "w1" }, products, pickup: { ...open, capacity: 50, remaining: 50 }, today, taxRateBps: 0 });
    expect(many.issues.map((i) => i.code)).toContain("max_per_order");

    const seasonal = products.map((p) => (p.id === "prod_little_posy" ? { ...p, availableFrom: "2027-06-01" } : p));
    const early = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_little_posy", quantity: 1 }], pickupWindowId: "w1" }, products: seasonal, pickup: open, today, taxRateBps: 0 });
    expect(early.issues.map((i) => i.code)).toContain("out_of_season");
  });

  it("does not sell drafts or sold-out products", () => {
    const draft = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_dahlia_armful", quantity: 1 }], pickupWindowId: "w1" }, products, pickup: open, today, taxRateBps: 0 });
    expect(draft.issues.map((i) => i.code)).toContain("unavailable");
    const soldOut = products.map((p) => (p.id === "prod_little_posy" ? { ...p, inventory: 0 } : p));
    const q = buildQuote({ cart: { lines: [{ key: "a", productId: "prod_little_posy", quantity: 1 }], pickupWindowId: "w1" }, products: soldOut, pickup: open, today, taxRateBps: 0 });
    expect(q.issues.map((i) => i.code)).toContain("sold_out");
  });

  it("requires gift details and a valid start month for subscriptions", () => {
    const noGift = buildQuote({ cart: { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1 }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(noGift.issues.map((i) => i.code)).toContain("gift_required");
    const badMonth = buildQuote({ cart: { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift: { ...gift, startMonth: "2027-12" } }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(badMonth.issues.map((i) => i.code)).toContain("invalid_start_month");
  });

  it("flags unknown products instead of pricing them", () => {
    const q = buildQuote({ cart: { lines: [{ key: "x", productId: "prod_fake", quantity: 1 }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(q.ok).toBe(false);
    expect(q.subtotalCents).toBe(0);
  });

  it("ignores the quantity sent for subscription lines", () => {
    expect(byId("prod_season_of_flowers").maxPerOrder).toBe(1);
    const q = buildQuote({ cart: { lines: [{ key: "g", productId: "prod_season_of_flowers", quantity: 1, gift }] }, products, pickup: null, today, taxRateBps: 0 });
    expect(q.lines[0].quantity).toBe(1);
  });
});

describe("windowAvailability", () => {
  it("closes orders at the cutoff before the pickup starts", () => {
    // Pickup Oct 31 09:00 EDT = 13:00Z; a 36h cutoff closes at Oct 30 01:00Z.
    expect(windowAvailability(window, 0, new Date("2026-10-30T00:59:00Z"), 36).bookable).toBe(true);
    const late = windowAvailability(window, 0, new Date("2026-10-30T01:01:00Z"), 36);
    expect(late.bookable).toBe(false);
    expect(late.reason).toBe("cutoff");
  });

  it("reports full and closed days", () => {
    expect(windowAvailability(window, 5, now, 36).reason).toBe("full");
    expect(windowAvailability({ ...window, status: "closed" }, 0, now, 36).reason).toBe("closed");
    expect(windowAvailability(window, 2, now, 36).remaining).toBe(3);
  });
});
