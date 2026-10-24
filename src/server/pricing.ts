import { productAvailability, type PickupWindowAvailability, type Product } from "@/domain/catalog";
import type { Cart, GiftDetails } from "@/domain/cart";
import { formatDateShort } from "@/lib/time";

// Pure and side-effect free: the single source of truth for totals, used by the cart UI and checkout.

export type QuoteIssueCode =
  | "not_found"
  | "unavailable"
  | "sold_out"
  | "out_of_season"
  | "insufficient_stock"
  | "max_per_order"
  | "gift_required"
  | "invalid_start_month"
  | "pickup_required"
  | "pickup_unavailable"
  | "pickup_full";

export type QuoteIssue = { code: QuoteIssueCode; message: string; lineKey?: string };

export type QuoteLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  kind: Product["kind"];
  image: Product["images"][number] | null;
  sizeLabel: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  cardMessage: string;
  gift: GiftDetails | null;
  maxQuantity: number;
};

export type Quote = {
  lines: QuoteLine[];
  issues: QuoteIssue[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  bouquetCount: number;
  needsPickup: boolean;
  pickup: PickupWindowAvailability | null;
  ok: boolean;
};

export function buildQuote(input: {
  cart: Cart;
  products: Product[];
  pickup: PickupWindowAvailability | null;
  today: string;
  taxRateBps: number;
}): Quote {
  const byId = new Map(input.products.map((p) => [p.id, p]));
  const issues: QuoteIssue[] = [];
  const lines: QuoteLine[] = [];
  const qtyByProduct = new Map<string, number>();

  for (const line of input.cart.lines) {
    qtyByProduct.set(line.productId, (qtyByProduct.get(line.productId) ?? 0) + line.quantity);
  }

  for (const line of input.cart.lines) {
    const product = byId.get(line.productId);
    if (!product) {
      issues.push({ code: "not_found", lineKey: line.key, message: "An item in your cart is no longer available." });
      continue;
    }
    const availability = productAvailability(product, input.today);
    const totalQty = qtyByProduct.get(product.id) ?? line.quantity;

    if (availability.state === "unavailable") {
      issues.push({ code: "unavailable", lineKey: line.key, message: `${product.name} isn't available to order right now.` });
    } else if (availability.state === "sold_out") {
      issues.push({ code: "sold_out", lineKey: line.key, message: `${product.name} has sold out.` });
    } else if (availability.state === "out_of_season") {
      issues.push({ code: "out_of_season", lineKey: line.key, message: `${product.name} is out of season.` });
    } else if (product.inventory !== null && totalQty > product.inventory) {
      issues.push({
        code: "insufficient_stock",
        lineKey: line.key,
        message: `Only ${product.inventory} of ${product.name} left. Please lower the quantity.`,
      });
    }

    if (totalQty > product.maxPerOrder) {
      issues.push({
        code: "max_per_order",
        lineKey: line.key,
        message: `You can order up to ${product.maxPerOrder} of ${product.name} at a time.`,
      });
    }

    let gift: GiftDetails | null = null;
    if (product.kind === "subscription") {
      if (!line.gift) {
        issues.push({ code: "gift_required", lineKey: line.key, message: `Add gift details for ${product.name}.` });
      } else {
        gift = line.gift;
        if (!product.startMonths.includes(line.gift.startMonth)) {
          issues.push({
            code: "invalid_start_month",
            lineKey: line.key,
            message: `Choose an available starting month for ${product.name}.`,
          });
        }
      }
    }

    const quantity = product.kind === "subscription" ? 1 : line.quantity;
    lines.push({
      key: line.key,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      kind: product.kind,
      image: product.images.find((i) => i.kind === "cutout") ?? product.images[0] ?? null,
      sizeLabel: product.sizeLabel,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * quantity,
      cardMessage: product.kind === "bouquet" ? (line.cardMessage ?? "").trim() : "",
      gift,
      maxQuantity: Math.max(
        1,
        Math.min(product.maxPerOrder, product.inventory ?? product.maxPerOrder),
      ),
    });
  }

  const bouquetCount = lines.filter((l) => l.kind === "bouquet").reduce((n, l) => n + l.quantity, 0);
  const needsPickup = bouquetCount > 0;
  let pickup: PickupWindowAvailability | null = null;

  if (needsPickup) {
    if (!input.cart.pickupWindowId) {
      issues.push({ code: "pickup_required", message: "Choose a pickup day for your bouquets." });
    } else if (!input.pickup || input.pickup.id !== input.cart.pickupWindowId) {
      issues.push({ code: "pickup_unavailable", message: "That pickup time is no longer available. Please choose another." });
    } else {
      pickup = input.pickup;
      if (pickup.reason === "closed" || pickup.reason === "cutoff") {
        issues.push({
          code: "pickup_unavailable",
          message: `Orders for ${formatDateShort(pickup.date)} have closed. Please choose another pickup day.`,
        });
      } else if (bouquetCount > pickup.remaining) {
        issues.push({
          code: "pickup_full",
          message:
            pickup.remaining > 0
              ? `Only ${pickup.remaining} more bouquet${pickup.remaining === 1 ? "" : "s"} can be picked for ${formatDateShort(pickup.date)}.`
              : `${formatDateShort(pickup.date)} is fully booked. Please choose another pickup day.`,
        });
      }
    }
  }

  const subtotalCents = lines.reduce((n, l) => n + l.lineTotalCents, 0);
  const taxCents = Math.round((subtotalCents * input.taxRateBps) / 10_000);

  return {
    lines,
    issues,
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
    bouquetCount,
    needsPickup,
    pickup,
    ok: issues.length === 0 && lines.length > 0,
  };
}
