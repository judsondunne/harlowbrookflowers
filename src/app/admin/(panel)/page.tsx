import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { getUpcomingWindows } from "@/server/availability";
import { sweepExpiredOrders } from "@/server/orders";
import { loadSettings } from "@/server/settings";
import { paymentMode } from "@/server/config";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, OrderStatusBadge, Panel, Stat, td, th } from "@/components/admin/ui";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { formatDateShort, formatTimeRange } from "@/lib/time";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await requireAdmin();
  const now = new Date();
  await db.transaction((tx) => sweepExpiredOrders(tx, now));
  const settings = await loadSettings();
  const mode = paymentMode();
  const paidStatuses = ["paid", "ready", "picked_up"] as const;

  const [windows, [sales], [demoSales], [subs], [msgs], attention, recent] = await Promise.all([
    getUpcomingWindows(db, { now, cutoffHours: settings.orderCutoffHours, includeClosed: true, limit: 8 }),
    db
      .select({ n: sql<number>`count(*)`, total: sql<number>`coalesce(sum(${schema.orders.totalCents}),0)` })
      .from(schema.orders)
      .where(and(inArray(schema.orders.status, [...paidStatuses]), eq(schema.orders.isDemo, false))),
    db
      .select({ n: sql<number>`count(*)` })
      .from(schema.orders)
      .where(and(inArray(schema.orders.status, [...paidStatuses]), eq(schema.orders.isDemo, true))),
    db.select({ n: sql<number>`count(*)` }).from(schema.giftSubscriptions).where(eq(schema.giftSubscriptions.status, "active")),
    db.select({ n: sql<number>`count(*)` }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new")),
    db.select().from(schema.orders).where(eq(schema.orders.needsAttention, true)).orderBy(desc(schema.orders.createdAt)).limit(5),
    db
      .select()
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, new Date(now.getTime() - 60 * 86400_000).toISOString()))
      .orderBy(desc(schema.orders.createdAt))
      .limit(8),
  ]);

  const checklist = [
    { done: mode !== "demo", label: "Connect Stripe (test keys first)", href: "/admin/settings" },
    { done: !!process.env.STRIPE_WEBHOOK_SECRET, label: "Add the Stripe webhook secret", href: "/admin/settings" },
    { done: !!process.env.RESEND_API_KEY, label: "Connect an email provider", href: "/admin/settings" },
    { done: !settings.pickupInstructions.startsWith("["), label: "Write pickup instructions", href: "/admin/settings" },
    { done: settings.catalogApproved, label: "Approve products, prices and photos", href: "/admin/products" },
  ];

  return (
    <>
      <AdminHeader
        title={`Good to see you, ${admin.name}.`}
        description="Here's what's happening in the shop."
        actions={
          <Link href="/admin/pickups" className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-paper">
            Add pickup days
          </Link>
        }
      />

      {mode === "demo" && (
        <p className="mb-6 rounded-md bg-butter/70 p-4 text-sm">
          <span className="font-semibold">Demo mode.</span> Stripe isn&apos;t connected, so checkout is a demonstration and
          demo orders never count as sales. See <span className="font-mono text-xs">docs/SETUP.md</span> to connect payments.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sales (paid orders)" value={formatMoney(Number(sales.total))} hint={`${sales.n} orders${Number(demoSales.n) ? ` · plus ${demoSales.n} demo` : ""}`} />
        <Stat label="Next pickup" value={windows[0] ? formatDateShort(windows[0].date) : "—"} hint={windows[0] ? `${windows[0].reserved} of ${windows[0].capacity} bouquets booked` : "No upcoming days"} />
        <Stat label="Active gift subscriptions" value={subs.n} />
        <Stat label="New messages" value={msgs.n} hint={<Link href="/admin/messages" className="underline">Open inbox</Link>} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Panel title="Upcoming pickup days" actions={<Link href="/admin/pickups" className="text-xs font-semibold underline">Manage</Link>} className="xl:col-span-2">
          {windows.length === 0 ? (
            <EmptyState>No upcoming pickup days. Add some so customers can order.</EmptyState>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Day</th>
                  <th className={th}>Time</th>
                  <th className={th}>Booked</th>
                  <th className={th}>Status</th>
                  <th className={th}><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {windows.map((w) => (
                  <tr key={w.id}>
                    <td className={td}>{formatDateShort(w.date)}</td>
                    <td className={td}>{formatTimeRange(w.startTime, w.endTime)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">
                          {w.reserved}/{w.capacity}
                        </span>
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-linen">
                          <span className="block h-full bg-ink" style={{ width: `${Math.min(100, (w.reserved / Math.max(1, w.capacity)) * 100)}%` }} />
                        </span>
                      </div>
                    </td>
                    <td className={td}>
                      {w.status === "closed" ? <Badge>Closed</Badge> : w.reason === "full" ? <Badge tone="warn">Full</Badge> : w.reason === "cutoff" ? <Badge>Orders closed</Badge> : <Badge tone="good">Open</Badge>}
                    </td>
                    <td className={`${td} text-right`}>
                      <Link href={`/admin/pickups/${w.id}` as Route} className="text-xs font-semibold underline">
                        Picking list
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Launch checklist">
          <ul className="space-y-3 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[0.625rem] font-bold ${c.done ? "bg-success text-paper" : "border border-line-strong"}`}>
                  {c.done ? "✓" : ""}
                </span>
                <Link href={c.href as Route} className={c.done ? "text-muted line-through" : "hover:underline"}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Full list in docs/LAUNCH_CHECKLIST.md.</p>
        </Panel>
      </div>

      {attention.length > 0 && (
        <Panel title="Needs your attention" className="mt-6 ring-error/40">
          <ul className="divide-y divide-line">
            {attention.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <Link href={`/admin/orders/${o.id}` as Route} className="font-semibold underline">
                    {formatOrderNumber(o.number)}
                  </Link>{" "}
                  · {o.customerName} · <span className="text-error">{o.attentionNote || "Flagged for follow-up"}</span>
                </span>
                <OrderStatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Recent orders" actions={<Link href="/admin/orders" className="text-xs font-semibold underline">All orders</Link>} className="mt-6">
        {recent.length === 0 ? (
          <EmptyState>No orders yet. They&apos;ll appear here as soon as someone checks out.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem]">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Total</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className={td}>
                      <Link href={`/admin/orders/${o.id}` as Route} className="font-semibold underline">
                        {formatOrderNumber(o.number)}
                      </Link>
                      {o.isDemo && <span className="ml-2"><Badge>Demo</Badge></span>}
                    </td>
                    <td className={td}>{o.customerName}</td>
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
      </Panel>
    </>
  );
}
