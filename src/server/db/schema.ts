import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { ProductImage } from "@/domain/catalog";
import type { GiftDetails } from "@/domain/cart";
import { ORDER_STATUSES } from "@/domain/order";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;
const timestamps = {
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
};

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    kind: text("kind", { enum: ["bouquet", "subscription"] }).notNull(),
    status: text("status", { enum: ["draft", "active", "hidden", "archived"] }).notNull().default("draft"),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    sizeLabel: text("size_label").notNull().default(""),
    displayScale: integer("display_scale_pct").notNull().default(100),
    details: text("details", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    care: text("care", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    images: text("images", { mode: "json" }).$type<ProductImage[]>().notNull().default(sql`'[]'`),
    inventory: integer("inventory"),
    maxPerOrder: integer("max_per_order").notNull().default(6),
    deliveries: integer("deliveries"),
    startMonths: text("start_months", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    availableFrom: text("available_from"),
    availableUntil: text("available_until"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug), index("products_status_idx").on(t.status)],
);

export const pickupWindows = sqliteTable(
  "pickup_windows",
  {
    id: text("id").primaryKey(),
    date: text("date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    label: text("label").notNull().default(""),
    capacity: integer("capacity").notNull(),
    status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
    notes: text("notes").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("pickup_windows_date_idx").on(t.date)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    number: integer("number").notNull(),
    publicToken: text("public_token").notNull(),
    status: text("status", { enum: ORDER_STATUSES }).notNull().default("pending_payment"),
    isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
    needsAttention: integer("needs_attention", { mode: "boolean" }).notNull().default(false),
    attentionNote: text("attention_note").notNull().default(""),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull().default(""),
    customerNote: text("customer_note").notNull().default(""),
    marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
    pickupWindowId: text("pickup_window_id").references(() => pickupWindows.id),
    subtotalCents: integer("subtotal_cents").notNull(),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    inventoryReleased: integer("inventory_released", { mode: "boolean" }).notNull().default(false),
    adminNotes: text("admin_notes").notNull().default(""),
    expiresAt: text("expires_at").notNull(),
    paidAt: text("paid_at"),
    readyAt: text("ready_at"),
    pickedUpAt: text("picked_up_at"),
    cancelledAt: text("cancelled_at"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.number),
    uniqueIndex("orders_token_idx").on(t.publicToken),
    uniqueIndex("orders_stripe_session_idx").on(t.stripeSessionId),
    index("orders_status_idx").on(t.status),
    index("orders_pickup_idx").on(t.pickupWindowId),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    kind: text("kind", { enum: ["bouquet", "subscription"] }).notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    cardMessage: text("card_message").notNull().default(""),
    gift: text("gift", { mode: "json" }).$type<GiftDetails | null>(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId), index("order_items_product_idx").on(t.productId)],
);

export const giftSubscriptions = sqliteTable(
  "gift_subscriptions",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    planName: text("plan_name").notNull(),
    deliveriesTotal: integer("deliveries_total").notNull(),
    deliveriesCompleted: integer("deliveries_completed").notNull().default(0),
    recipientName: text("recipient_name").notNull(),
    recipientEmail: text("recipient_email").notNull().default(""),
    senderName: text("sender_name").notNull(),
    message: text("message").notNull().default(""),
    startMonth: text("start_month").notNull(),
    status: text("status", { enum: ["active", "completed", "cancelled"] }).notNull().default("active"),
    adminNotes: text("admin_notes").notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("gift_subscriptions_item_idx").on(t.orderItemId)],
);

/** Every processed Stripe event id, for idempotent webhook handling. */
export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: text("received_at").notNull().default(now),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "replied", "archived"] }).notNull().default("new"),
  createdAt: text("created_at").notNull().default(now),
});

/** Business enquiries from /wholesale. Contact details stay in the database and admin only. */
export const wholesaleInquiries = sqliteTable(
  "wholesale_inquiries",
  {
    id: text("id").primaryKey(),
    contactName: text("contact_name").notNull(),
    businessName: text("business_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    businessType: text("business_type").notNull(),
    location: text("location").notNull().default(""),
    intendedUse: text("intended_use").notNull().default(""),
    quantity: text("quantity").notNull().default(""),
    startDate: text("start_date").notNull().default(""),
    details: text("details").notNull().default(""),
    status: text("status", { enum: ["new", "replied", "archived"] }).notNull().default("new"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("wholesale_inquiries_created_idx").on(t.createdAt)],
);

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    source: text("source").notNull(),
    consentText: text("consent_text").notNull(),
    consentedAt: text("consented_at").notNull().default(now),
    unsubscribeToken: text("unsubscribe_token").notNull(),
    unsubscribedAt: text("unsubscribed_at"),
  },
  (t) => [uniqueIndex("subscribers_email_idx").on(t.email)],
);

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    lastLoginAt: text("last_login_at"),
    ...timestamps,
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    /** SHA-256 of the session token; the raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

/** Fixed-window counters for rate limiting (login, contact form, newsletter). */
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: integer("window_start").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: text("updated_at").notNull().default(now),
});

/** Every outgoing email is recorded; when no provider is configured this is the only delivery. */
export const emailOutbox = sqliteTable("email_outbox", {
  id: text("id").primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  text: text("text").notNull(),
  status: text("status", { enum: ["logged", "sent", "failed"] }).notNull(),
  provider: text("provider").notNull(),
  error: text("error").notNull().default(""),
  createdAt: text("created_at").notNull().default(now),
});
