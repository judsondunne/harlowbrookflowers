"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/server/db/client";
import { createAdminSession, destroyAdminSession, requireAdmin } from "@/server/auth";
import { verifyPassword } from "@/server/password";
import { clientFingerprint, rateLimit } from "@/server/rate-limit";
import { adminUpdateOrderStatus } from "@/server/orders";
import { saveSettings } from "@/server/settings";
import { storeProductImage, UploadError } from "@/server/storage";
import { ORDER_STATUSES, type OrderStatus } from "@/domain/order";
import { PRODUCT_STATUSES, type ProductImage } from "@/domain/catalog";

export type AdminFormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

/* ─── Auth ─────────────────────────────────────────────────────────── */

export async function loginAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fp = await clientFingerprint();
  const limit = await rateLimit(`login:${fp}`, 8, 15 * 60);
  if (!limit.ok) {
    return { message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };
  }
  const user = email ? await db.query.adminUsers.findFirst({ where: eq(schema.adminUsers.email, email) }) : undefined;
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(
    password,
    user?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
  );
  if (!user || !valid) return { message: "That email and password don't match." };
  await createAdminSession(user.id);
  await db.update(schema.adminUsers).set({ lastLoginAt: new Date().toISOString() }).where(eq(schema.adminUsers.id, user.id));
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* ─── Products ─────────────────────────────────────────────────────── */

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().min(0).max(100000).nullable(),
);
const optionalDate = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
);

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  kind: z.enum(["bouquet", "subscription"]),
  status: z.enum(PRODUCT_STATUSES),
  price: z.coerce.number().min(1, "Price must be at least $1.").max(5000),
  tagline: z.string().trim().max(140),
  summary: z.string().trim().max(400),
  description: z.string().trim().max(4000),
  sizeLabel: z.string().trim().max(80),
  inventory: optionalInt,
  maxPerOrder: z.coerce.number().int().min(1).max(24),
  displayScale: z.coerce.number().int().min(50).max(100),
  deliveries: optionalInt,
  availableFrom: optionalDate,
  availableUntil: optionalDate,
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

const imageSchema = z.array(
  z.object({
    src: z.string().min(1).max(500),
    alt: z.string().trim().max(240),
    kind: z.enum(["cutout", "photo"]),
    provisional: z.boolean(),
  }),
);

export async function saveProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { message: "Please fix the highlighted fields.", errors };
  }
  const p = parsed.data;

  let images: ProductImage[];
  try {
    images = imageSchema.parse(JSON.parse(String(formData.get("images") ?? "[]")));
  } catch {
    return { message: "The photo list couldn't be read. Please reload and try again." };
  }
  const uploads = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadKind = formData.get("newImageKind") === "cutout" ? "cutout" : "photo";
  try {
    for (const file of uploads) {
      const src = await storeProductImage(file);
      images.push({ src, alt: `${p.name}`, kind: uploadKind, provisional: false });
    }
  } catch (e) {
    return { message: e instanceof UploadError ? e.message : "A photo couldn't be uploaded." };
  }
  if (p.status === "active" && images.length === 0) {
    return { message: "Add at least one photo before making a product active.", errors: { images: "Required for active products." } };
  }
  const missingAlt = images.findIndex((i) => !i.alt.trim());
  if (missingAlt > -1) return { message: `Photo ${missingAlt + 1} needs a short description (alt text).` };

  const startMonths = lines(formData.get("startMonths")).filter((m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m));
  if (p.kind === "subscription" && (!p.deliveries || startMonths.length === 0)) {
    return { message: "Subscriptions need a number of bouquets and at least one start month (YYYY-MM)." };
  }

  const values = {
    name: p.name,
    slug: p.slug,
    kind: p.kind,
    status: p.status,
    priceCents: Math.round(p.price * 100),
    tagline: p.tagline,
    summary: p.summary,
    description: p.description,
    sizeLabel: p.sizeLabel,
    inventory: p.inventory,
    maxPerOrder: p.kind === "subscription" ? 1 : p.maxPerOrder,
    displayScale: p.displayScale,
    deliveries: p.kind === "subscription" ? p.deliveries : null,
    startMonths: p.kind === "subscription" ? startMonths : [],
    availableFrom: p.availableFrom,
    availableUntil: p.availableUntil,
    sortOrder: p.sortOrder,
    featured: formData.get("featured") === "on",
    details: lines(formData.get("details")),
    care: lines(formData.get("care")),
    images,
    updatedAt: new Date().toISOString(),
  };

  const clash = await db.query.products.findFirst({ where: eq(schema.products.slug, p.slug) });
  if (clash && clash.id !== p.id) return { message: "Another product already uses that web address.", errors: { slug: "Already in use." } };

  let id = p.id;
  if (id) {
    await db.update(schema.products).set(values).where(eq(schema.products.id, id));
  } else {
    id = `prod_${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(schema.products).values({ id, ...values });
  }
  updateTag("catalog");
  if (!p.id) redirect(`/admin/products/${id}?saved=1`);
  return { ok: true, message: "Saved. The shop has been updated." };
}

/* ─── Pickup windows ───────────────────────────────────────────────── */

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
const windowSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
    startTime: z.string().regex(timeRe, "Use HH:MM."),
    endTime: z.string().regex(timeRe, "Use HH:MM."),
    capacity: z.coerce.number().int().min(1).max(500),
    label: z.string().trim().max(80),
  })
  .refine((v) => v.endTime > v.startTime, { message: "End time must be after the start.", path: ["endTime"] });

export async function createPickupWindowsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = windowSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { message: "Please check the pickup details.", errors };
  }
  const v = parsed.data;
  const weekdays = formData.getAll("weekday").map(Number);
  const end = v.to || v.from;
  if (end < v.from) return { message: "The end date is before the start date.", errors: { to: "Before start." } };

  const dates: string[] = [];
  for (let t = Date.parse(`${v.from}T12:00:00Z`); t <= Date.parse(`${end}T12:00:00Z`); t += 86400_000) {
    const d = new Date(t);
    if (v.to && weekdays.length && !weekdays.includes(d.getUTCDay())) continue;
    dates.push(d.toISOString().slice(0, 10));
    if (dates.length > 120) return { message: "That's more than 120 pickup days. Please choose a shorter range." };
  }
  if (dates.length === 0) return { message: "No dates matched. Check the weekdays you selected." };

  for (const date of dates) {
    await db
      .insert(schema.pickupWindows)
      .values({
        id: `pw_${date}_${v.startTime.replace(":", "")}`,
        date,
        startTime: v.startTime,
        endTime: v.endTime,
        capacity: v.capacity,
        label: v.label,
      })
      .onConflictDoNothing();
  }
  return { ok: true, message: `Added ${dates.length} pickup ${dates.length === 1 ? "day" : "days"}.` };
}

export async function updatePickupWindowAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const capacity = Number(formData.get("capacity"));
  const status = formData.get("status") === "closed" ? "closed" : "open";
  const notes = String(formData.get("notes") ?? "").slice(0, 300);
  if (!id || !Number.isInteger(capacity) || capacity < 0 || capacity > 500) return;
  await db
    .update(schema.pickupWindows)
    .set({ capacity, status, notes, updatedAt: new Date().toISOString() })
    .where(eq(schema.pickupWindows.id, id));
  updateTag("catalog");
}

export async function deletePickupWindowAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.orders)
    .where(eq(schema.orders.pickupWindowId, id));
  if (Number(n) > 0) return; // Windows with orders are closed instead of deleted.
  await db.delete(schema.pickupWindows).where(eq(schema.pickupWindows.id, id));
}

/* ─── Orders ───────────────────────────────────────────────────────── */

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "") as OrderStatus;
  if (!ORDER_STATUSES.includes(to)) return;
  await adminUpdateOrderStatus(db, id, to, new Date());
  updateTag("catalog");
}

export async function markPickupReadyAction(formData: FormData) {
  await requireAdmin();
  const windowId = String(formData.get("windowId") ?? "");
  const rows = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.pickupWindowId, windowId), eq(schema.orders.status, "paid")));
  for (const r of rows) await adminUpdateOrderStatus(db, r.id, "ready", new Date());
}

export async function saveOrderNotesAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db
    .update(schema.orders)
    .set({
      adminNotes: String(formData.get("adminNotes") ?? "").slice(0, 4000),
      needsAttention: formData.get("needsAttention") === "on",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.orders.id, id));
}

/* ─── Gift subscriptions ───────────────────────────────────────────── */

export async function adjustDeliveriesAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const delta = Number(formData.get("delta")) === -1 ? -1 : 1;
  const sub = await db.query.giftSubscriptions.findFirst({ where: eq(schema.giftSubscriptions.id, id) });
  if (!sub || sub.status === "cancelled") return;
  const done = Math.max(0, Math.min(sub.deliveriesTotal, sub.deliveriesCompleted + delta));
  await db
    .update(schema.giftSubscriptions)
    .set({
      deliveriesCompleted: done,
      status: done >= sub.deliveriesTotal ? "completed" : "active",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.giftSubscriptions.id, id));
}

export async function saveSubscriptionNotesAction(formData: FormData) {
  await requireAdmin();
  await db
    .update(schema.giftSubscriptions)
    .set({ adminNotes: String(formData.get("adminNotes") ?? "").slice(0, 2000), updatedAt: new Date().toISOString() })
    .where(eq(schema.giftSubscriptions.id, String(formData.get("id") ?? "")));
}

/* ─── Messages ─────────────────────────────────────────────────────── */

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!["new", "replied", "archived"].includes(status)) return;
  const ids = formData.getAll("id").map(String);
  await db
    .update(schema.contactMessages)
    .set({ status: status as "new" | "replied" | "archived" })
    .where(inArray(schema.contactMessages.id, ids));
}

/* ─── Settings ─────────────────────────────────────────────────────── */

export async function saveSettingsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  try {
    await saveSettings({
      announcement: String(formData.get("announcement") ?? ""),
      salesOpen: formData.get("salesOpen") === "on",
      catalogApproved: formData.get("catalogApproved") === "on",
      closedMessage: String(formData.get("closedMessage") ?? ""),
      pickupLocationPublic: String(formData.get("pickupLocationPublic") ?? ""),
      pickupInstructions: String(formData.get("pickupInstructions") ?? ""),
      orderCutoffHours: Number(formData.get("orderCutoffHours")),
      taxRateBps: Math.round(Number(formData.get("taxRatePercent") ?? 0) * 100),
      seasonNote: String(formData.get("seasonNote") ?? ""),
      orderNotificationEmail: String(formData.get("orderNotificationEmail") ?? "").trim(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const i of e.issues) errors[String(i.path[0])] ??= i.message;
      return { message: "Some settings aren't valid.", errors };
    }
    throw e;
  }
  updateTag("settings");
  updateTag("catalog");
  return { ok: true, message: "Settings saved." };
}
