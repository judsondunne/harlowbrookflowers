import "server-only";
import { and, asc, eq, gte, inArray, isNotNull, ne, or, sql, gt } from "drizzle-orm";
import { schema, type Database } from "./db/client";
import type { PickupWindow, PickupWindowAvailability } from "@/domain/catalog";
import { RESERVING_STATUSES } from "@/domain/order";
import { farmTimeToUtc, farmToday } from "@/lib/time";

/** Bouquets currently holding capacity in each pickup window (unexpired pending + paid states). */
export async function reservedByWindow(db: Database, now: Date, windowIds?: string[]) {
  const nowIso = now.toISOString();
  const rows = await db
    .select({
      windowId: schema.orders.pickupWindowId,
      qty: sql<number>`coalesce(sum(${schema.orderItems.quantity}), 0)`,
    })
    .from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orders.id, schema.orderItems.orderId))
    .where(
      and(
        eq(schema.orderItems.kind, "bouquet"),
        isNotNull(schema.orders.pickupWindowId),
        inArray(schema.orders.status, [...RESERVING_STATUSES]),
        or(ne(schema.orders.status, "pending_payment"), gt(schema.orders.expiresAt, nowIso)),
        windowIds && windowIds.length ? inArray(schema.orders.pickupWindowId, windowIds) : undefined,
      ),
    )
    .groupBy(schema.orders.pickupWindowId);
  return new Map(rows.map((r) => [r.windowId as string, Number(r.qty)]));
}

export function windowAvailability(
  w: PickupWindow,
  reserved: number,
  now: Date,
  cutoffHours: number,
): PickupWindowAvailability {
  const remaining = Math.max(0, w.capacity - reserved);
  const cutoff = farmTimeToUtc(w.date, w.startTime).getTime() - cutoffHours * 3600_000;
  let reason: PickupWindowAvailability["reason"];
  if (w.status !== "open") reason = "closed";
  else if (now.getTime() >= cutoff) reason = "cutoff";
  else if (remaining <= 0) reason = "full";
  return { ...w, reserved, remaining, bookable: !reason, reason };
}

/** Upcoming pickup windows (today onwards) with live remaining capacity. */
export async function getUpcomingWindows(
  db: Database,
  opts: { now: Date; cutoffHours: number; includeClosed?: boolean; limit?: number },
): Promise<PickupWindowAvailability[]> {
  const today = farmToday(opts.now);
  const rows = await db
    .select()
    .from(schema.pickupWindows)
    .where(
      and(
        gte(schema.pickupWindows.date, today),
        opts.includeClosed ? undefined : eq(schema.pickupWindows.status, "open"),
      ),
    )
    .orderBy(asc(schema.pickupWindows.date), asc(schema.pickupWindows.startTime))
    .limit(opts.limit ?? 60);
  const reserved = await reservedByWindow(db, opts.now, rows.map((r) => r.id));
  return rows.map((r) => windowAvailability(toWindow(r), reserved.get(r.id) ?? 0, opts.now, opts.cutoffHours));
}

export async function getWindow(db: Database, id: string, now: Date, cutoffHours: number) {
  const row = await db.query.pickupWindows.findFirst({ where: eq(schema.pickupWindows.id, id) });
  if (!row) return null;
  const reserved = await reservedByWindow(db, now, [id]);
  return windowAvailability(toWindow(row), reserved.get(id) ?? 0, now, cutoffHours);
}

export function toWindow(r: typeof schema.pickupWindows.$inferSelect): PickupWindow {
  return {
    id: r.id,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
    label: r.label,
    capacity: r.capacity,
    status: r.status,
    notes: r.notes,
  };
}
