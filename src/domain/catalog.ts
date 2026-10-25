/** Catalog domain model shared by the storefront, server and admin. */

export const PRODUCT_KINDS = ["bouquet", "subscription"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

/** draft: never shown · active: listed and purchasable · hidden: direct link only, not purchasable · archived: retired */
export const PRODUCT_STATUSES = ["draft", "active", "hidden", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductImage = {
  src: string;
  alt: string;
  /** cutout = transparent-background bouquet; photo = full-frame photograph */
  kind: "cutout" | "photo";
  /** true while the image is stock/sample photography awaiting Sarah's own photos */
  provisional: boolean;
};

export type Product = {
  id: string;
  slug: string;
  kind: ProductKind;
  status: ProductStatus;
  name: string;
  /** One line used in cards and the hero. */
  tagline: string;
  /** Short paragraph for listings. */
  summary: string;
  /** Long description for the product page. Paragraphs separated by blank lines. */
  description: string;
  priceCents: number;
  /** e.g. "Small · about 10–12 stems" */
  sizeLabel: string;
  /** Visual scale of the cutout in product cards (0.6–1). Communicates relative size honestly. */
  displayScale: number;
  details: string[];
  care: string[];
  images: ProductImage[];
  /** Remaining sellable units; null means not tracked separately (pickup capacity still applies). */
  inventory: number | null;
  maxPerOrder: number;
  /** Subscription plans only: number of monthly bouquets. */
  deliveries: number | null;
  /** Subscription plans only: months a gift may start (YYYY-MM). */
  startMonths: string[];
  /** Optional seasonal sales window (YYYY-MM-DD, inclusive). */
  availableFrom: string | null;
  availableUntil: string | null;
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type Availability =
  | { state: "available"; remaining: number | null }
  | { state: "sold_out" }
  | { state: "out_of_season"; opensOn: string | null }
  | { state: "unavailable" };

/** Pure availability check. `today` is an ISO date in the farm's time zone. */
export function productAvailability(product: Product, today: string): Availability {
  if (product.status !== "active") return { state: "unavailable" };
  if (product.availableFrom && today < product.availableFrom) {
    return { state: "out_of_season", opensOn: product.availableFrom };
  }
  if (product.availableUntil && today > product.availableUntil) {
    return { state: "out_of_season", opensOn: null };
  }
  if (product.inventory !== null && product.inventory <= 0) return { state: "sold_out" };
  return { state: "available", remaining: product.inventory };
}

export function primaryImage(product: Pick<Product, "images">, kind?: ProductImage["kind"]) {
  return (kind ? product.images.find((i) => i.kind === kind) : undefined) ?? product.images[0];
}

export type PickupWindow = {
  id: string;
  /** YYYY-MM-DD in the farm's local time zone */
  date: string;
  /** HH:MM, 24h local */
  startTime: string;
  endTime: string;
  label: string;
  capacity: number;
  status: "open" | "closed";
  notes: string;
};

export type PickupWindowAvailability = PickupWindow & {
  reserved: number;
  remaining: number;
  /** false when the window is full, closed, or past the order cutoff */
  bookable: boolean;
  reason?: "full" | "closed" | "cutoff";
};
