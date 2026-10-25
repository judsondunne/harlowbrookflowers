import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { loadOrderDetail } from "@/server/orders";
import { paymentMode } from "@/server/config";
import { saveOrderNotesAction, updateOrderStatusAction } from "../../../actions";
import { AdminHeader, AdminSkeleton, Badge, OrderStatusBadge, Panel, adminButtonPrimary, adminButtonSecondary } from "@/components/admin/ui";
import { ADMIN_TRANSITIONS, ORDER_STATUS_LABELS } from "@/domain/order";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { formatDateLong, formatMonth, formatTimeRange } from "@/lib/time";

export const metadata = { title: "Order" };

export default function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) : "—";

async function OrderDetail({ params }: { params: PageProps<"/admin/orders/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, id) });
  if (!order) notFound();
  const { items, window, gifts } = await loadOrderDetail(db, order);
  const transitions = ADMIN_TRANSITIONS[order.status] ?? [];
  const stripeBase = paymentMode() === "stripe_test" ? "https://dashboard.stripe.com/test" : "https://dashboard.stripe.com";

  return (
    <>
      <AdminHeader
        title={`Order ${formatOrderNumber(order.number)}`}
        description={`Placed ${dateTime(order.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            {order.isDemo && <Badge>Demo order</Badge>}
            <OrderStatusBadge status={order.status} />
          </div>
        }
      />
      <Link href="/admin/orders" className="mb-6 inline-block text-sm underline underline-offset-2">
        ← All orders
      </Link>

      {order.needsAttention && (
        <p className="mb-6 rounded-md border border-error/40 bg-error/5 p-4 text-sm">
          <span className="font-semibold text-error">Needs attention.</span> {order.attentionNote || "Flagged for follow-up."}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Items">
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">
                      {i.quantity} × {i.productName}
                    </p>
                    {i.cardMessage && <p className="mt-1 text-ink-soft">Card: “{i.cardMessage}”</p>}
                    {i.gift && (
                      <p className="mt-1 text-ink-soft">
                        Gift for <strong>{i.gift.recipientName}</strong>
                        {i.gift.recipientEmail ? ` (${i.gift.recipientEmail})` : ""} from {i.gift.senderName}, starting{" "}
                        {formatMonth(i.gift.startMonth)}
                        {i.gift.message ? <><br />Note: “{i.gift.message}”</> : null}
                      </p>
                    )}
                  </div>
                  <p className="tabular-nums">{formatMoney(i.lineTotalCents)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              {order.taxCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Tax</dt>
                  <dd>{formatMoney(order.taxCents)}</dd>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatMoney(order.totalCents)}</dd>
              </div>
            </dl>
          </Panel>

          {transitions.length > 0 && (
            <Panel title="Update status">
              <div className="flex flex-wrap gap-2">
                {transitions.map((to) => (
                  <form key={to} action={updateOrderStatusAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="to" value={to} />
                    <button className={to === "ready" || to === "picked_up" ? adminButtonPrimary : adminButtonSecondary}>
                      Mark {ORDER_STATUS_LABELS[to].toLowerCase()}
                    </button>
                  </form>
                ))}
              </div>
              {(transitions.includes("refunded") || transitions.includes("cancelled")) && (
                <p className="mt-3 text-xs text-muted">
                  Cancelling or refunding here returns stock and updates the order, but money is refunded from the Stripe
                  dashboard{order.stripePaymentIntentId ? "" : " (no Stripe payment on this order)"}.
                </p>
              )}
            </Panel>
          )}

          <Panel title="Notes">
            <form action={saveOrderNotesAction} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="adminNotes"
                defaultValue={order.adminNotes}
                rows={4}
                className="w-full rounded-md border border-line-strong bg-paper p-3 text-sm outline-none focus:border-ink"
                placeholder="Private notes for this order"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="needsAttention" defaultChecked={order.needsAttention} /> Flag as needing attention
              </label>
              <button className={adminButtonSecondary}>Save notes</button>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            <p className="font-semibold">{order.customerName}</p>
            <p className="mt-1 text-sm">
              <a href={`mailto:${order.customerEmail}`} className="underline">
                {order.customerEmail}
              </a>
            </p>
            {order.customerPhone && (
              <p className="mt-1 text-sm">
                <a href={`tel:${order.customerPhone}`} className="underline">
                  {order.customerPhone}
                </a>
              </p>
            )}
            {order.customerNote && <p className="mt-3 rounded-md bg-butter/50 p-3 text-sm">“{order.customerNote}”</p>}
            <p className="mt-3 text-xs text-muted">{order.marketingOptIn ? "Opted in to emails" : "Not subscribed to emails"}</p>
          </Panel>
          <Panel title="Pickup">
            {window ? (
              <>
                <p className="font-semibold">{formatDateLong(window.date)}</p>
                <p className="text-sm text-muted">{formatTimeRange(window.startTime, window.endTime)}</p>
                <Link href={`/admin/pickups/${window.id}` as Route} className="mt-3 inline-block text-xs font-semibold underline">
                  Picking list for this day
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted">No pickup: gift subscription only.</p>
            )}
            {gifts.length > 0 && (
              <Link href="/admin/subscriptions" className="mt-3 block text-xs font-semibold underline">
                View gift subscriptions
              </Link>
            )}
          </Panel>
          <Panel title="Payment">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Paid</dt>
                <dd>{dateTime(order.paidAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Ready</dt>
                <dd>{dateTime(order.readyAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Picked up</dt>
                <dd>{dateTime(order.pickedUpAt)}</dd>
              </div>
            </dl>
            {order.stripePaymentIntentId && (
              <a
                href={`${stripeBase}/payments/${order.stripePaymentIntentId}`}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-block text-xs font-semibold underline"
              >
                Open in Stripe ↗
              </a>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
