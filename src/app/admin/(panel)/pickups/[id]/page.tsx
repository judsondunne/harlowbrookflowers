import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { markPickupReadyAction } from "../../../actions";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, OrderStatusBadge, Panel, adminButtonPrimary, adminButtonSecondary, td, th } from "@/components/admin/ui";
import { formatOrderNumber } from "@/lib/format";
import { formatDateLong, formatTimeRange } from "@/lib/time";

export const metadata = { title: "Picking list" };

export default function PickingListPage({ params }: PageProps<"/admin/pickups/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <PickingList params={params} />
    </Suspense>
  );
}

async function PickingList({ params }: { params: PageProps<"/admin/pickups/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  const window = await db.query.pickupWindows.findFirst({ where: eq(schema.pickupWindows.id, id) });
  if (!window) notFound();
  const orders = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.pickupWindowId, id), inArray(schema.orders.status, ["paid", "ready", "picked_up"])));
  const items = orders.length
    ? await db.select().from(schema.orderItems).where(inArray(schema.orderItems.orderId, orders.map((o) => o.id)))
    : [];
  const totals = new Map<string, number>();
  for (const i of items.filter((i) => i.kind === "bouquet")) totals.set(i.productName, (totals.get(i.productName) ?? 0) + i.quantity);
  const unpaidDemo = orders.filter((o) => o.isDemo).length;

  return (
    <>
      <AdminHeader
        title={`Picking list · ${formatDateLong(window.date)}`}
        description={`${formatTimeRange(window.startTime, window.endTime)}${window.label ? ` · ${window.label}` : ""}`}
        actions={
          <>
            <a href={`/api/admin/orders.csv?pickup=${id}`} className={adminButtonSecondary}>
              Export CSV
            </a>
            {orders.some((o) => o.status === "paid") && (
              <form action={markPickupReadyAction}>
                <input type="hidden" name="windowId" value={id} />
                <button className={adminButtonPrimary}>Mark all ready</button>
              </form>
            )}
          </>
        }
      />
      <Link href="/admin/pickups" className="mb-6 inline-block text-sm underline underline-offset-2 print:hidden">
        ← Pickup days
      </Link>
      {unpaidDemo > 0 && <p className="mb-4 text-sm text-muted">Includes {unpaidDemo} demo order(s).</p>}

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Bouquets to pick">
          {totals.size === 0 ? (
            <EmptyState>No paid orders for this day yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {[...totals].map(([name, qty]) => (
                <li key={name} className="flex justify-between py-2.5 text-sm">
                  <span>{name}</span>
                  <span className="font-display text-2xl tabular-nums">{qty}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="xl:col-span-2">
          {orders.length > 0 && (
            <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
              <table className="w-full min-w-[40rem]">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Order</th>
                    <th className={th}>Name</th>
                    <th className={th}>Bouquets & cards</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className={td}>
                        <Link href={`/admin/orders/${o.id}` as Route} className="font-semibold underline">
                          {formatOrderNumber(o.number)}
                        </Link>
                        {o.isDemo && <div className="mt-1"><Badge>Demo</Badge></div>}
                      </td>
                      <td className={td}>
                        {o.customerName}
                        {o.customerNote && <div className="mt-1 text-xs text-ink-soft">“{o.customerNote}”</div>}
                      </td>
                      <td className={td}>
                        <ul className="space-y-1">
                          {items
                            .filter((i) => i.orderId === o.id && i.kind === "bouquet")
                            .map((i) => (
                              <li key={i.id}>
                                {i.quantity} × {i.productName}
                                {i.cardMessage && <div className="text-xs text-ink-soft">Card: “{i.cardMessage}”</div>}
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className={td}>
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
