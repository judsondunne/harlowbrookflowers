import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { getAdmin } from "@/server/auth";
import { formatOrderNumber } from "@/lib/format";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Paid orders as CSV (optionally for one pickup day). Admin session required. */
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const pickup = new URL(req.url).searchParams.get("pickup");
  const orders = await db
    .select({ o: schema.orders, w: schema.pickupWindows })
    .from(schema.orders)
    .leftJoin(schema.pickupWindows, eq(schema.pickupWindows.id, schema.orders.pickupWindowId))
    .where(and(inArray(schema.orders.status, ["paid", "ready", "picked_up"]), pickup ? eq(schema.orders.pickupWindowId, pickup) : undefined))
    .orderBy(desc(schema.orders.createdAt));
  const items = orders.length
    ? await db.select().from(schema.orderItems).where(inArray(schema.orderItems.orderId, orders.map((r) => r.o.id)))
    : [];
  const header = ["Order", "Status", "Demo", "Customer", "Email", "Phone", "Pickup date", "Pickup time", "Items", "Card messages", "Note", "Total"];
  const rows = orders.map(({ o, w }) => {
    const mine = items.filter((i) => i.orderId === o.id);
    return [
      formatOrderNumber(o.number),
      o.status,
      o.isDemo ? "yes" : "",
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      w?.date ?? "",
      w ? `${w.startTime}-${w.endTime}` : "",
      mine.map((i) => `${i.quantity} x ${i.productName}${i.gift ? ` (gift for ${i.gift.recipientName})` : ""}`).join("; "),
      mine.filter((i) => i.cardMessage).map((i) => i.cardMessage).join(" | "),
      o.customerNote,
      (o.totalCents / 100).toFixed(2),
    ];
  });
  const body = [header, ...rows].map((r) => r.map(csv).join(",")).join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="harlow-brook-orders${pickup ? `-${pickup}` : ""}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
