import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, OrderStatusBadge, td, th, adminInput, adminButtonSecondary } from "@/components/admin/ui";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/domain/order";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { formatDateShort, formatTimeRange } from "@/lib/time";

export const metadata = { title: "Orders" };

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const view = typeof sp.view === "string" ? sp.view : "active";
  const pickup = typeof sp.pickup === "string" ? sp.pickup : undefined;
  const showDemo = sp.demo === "1";

  const where: SQL[] = [];
  if (status) where.push(eq(schema.orders.status, status));
  else if (view === "active") where.push(inArray(schema.orders.status, ["paid", "ready", "pending_payment"]));
  if (pickup) where.push(eq(schema.orders.pickupWindowId, pickup));
  if (!showDemo) where.push(eq(schema.orders.isDemo, false));

  const rows = await db
    .select({ order: schema.orders, window: schema.pickupWindows })
    .from(schema.orders)
    .leftJoin(schema.pickupWindows, eq(schema.pickupWindows.id, schema.orders.pickupWindowId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.orders.createdAt))
    .limit(200);

  const demoCount = showDemo ? 0 : (await db.select({ id: schema.orders.id }).from(schema.orders).where(eq(schema.orders.isDemo, true)).limit(1)).length;

  return (
    <>
      <AdminHeader
        title="Orders"
        description="Paid orders appear here once Stripe confirms payment. Mark them ready, then picked up."
        actions={
          <a href={`/api/admin/orders.csv${pickup ? `?pickup=${pickup}` : ""}`} className={adminButtonSecondary}>
            Export CSV
          </a>
        }
      />
      <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
        <label className="text-xs font-semibold">
          Show
          <select name="view" defaultValue={status ? "" : view} className={`${adminInput} mt-1 w-44`}>
            <option value="active">Open orders</option>
            <option value="all">All orders</option>
          </select>
        </label>
        <label className="text-xs font-semibold">
          Status
          <select name="status" defaultValue={status ?? ""} className={`${adminInput} mt-1 w-48`}>
            <option value="">Any status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" name="demo" value="1" defaultChecked={showDemo} /> Include demo orders
        </label>
        {pickup && <input type="hidden" name="pickup" value={pickup} />}
        <button className={adminButtonSecondary}>Apply</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState>
          No orders match these filters.{demoCount > 0 && " Demo orders are hidden; tick “Include demo orders” to see them."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
          <table className="w-full min-w-[48rem]">
            <thead>
              <tr className="border-b border-line">
                <th className={th}>Order</th>
                <th className={th}>Placed</th>
                <th className={th}>Customer</th>
                <th className={th}>Pickup</th>
                <th className={th}>Total</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ order: o, window: w }) => (
                <tr key={o.id} className={o.needsAttention ? "bg-error/[0.04]" : undefined}>
                  <td className={td}>
                    <Link href={`/admin/orders/${o.id}` as Route} className="font-semibold underline underline-offset-2">
                      {formatOrderNumber(o.number)}
                    </Link>
                    <div className="mt-1 flex gap-1">
                      {o.isDemo && <Badge>Demo</Badge>}
                      {o.needsAttention && <Badge tone="bad">Attention</Badge>}
                    </div>
                  </td>
                  <td className={`${td} text-muted`}>{formatDateShort(o.createdAt.slice(0, 10))}</td>
                  <td className={td}>
                    {o.customerName}
                    <div className="text-xs text-muted">{o.customerEmail}</div>
                  </td>
                  <td className={td}>
                    {w ? (
                      <>
                        {formatDateShort(w.date)}
                        <div className="text-xs text-muted">{formatTimeRange(w.startTime, w.endTime)}</div>
                      </>
                    ) : (
                      <span className="text-muted">Gift subscription</span>
                    )}
                  </td>
                  <td className={`${td} tabular-nums`}>{formatMoney(o.totalCents)}</td>
                  <td className={td}>
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
