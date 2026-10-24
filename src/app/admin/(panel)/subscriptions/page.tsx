import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { adjustDeliveriesAction, saveSubscriptionNotesAction } from "../../actions";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, adminButtonSecondary, adminInput, td, th } from "@/components/admin/ui";
import { formatOrderNumber } from "@/lib/format";
import { addMonths, formatMonth } from "@/lib/time";

export const metadata = { title: "Gift subscriptions" };

export default function SubscriptionsAdminPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Subscriptions />
    </Suspense>
  );
}

async function Subscriptions() {
  await requireAdmin();
  const rows = await db
    .select({ sub: schema.giftSubscriptions, order: schema.orders })
    .from(schema.giftSubscriptions)
    .innerJoin(schema.orders, eq(schema.orders.id, schema.giftSubscriptions.orderId))
    .orderBy(desc(schema.giftSubscriptions.createdAt));

  return (
    <>
      <AdminHeader
        title="Gift subscriptions"
        description="Prepaid seasonal gifts. Record each bouquet as it's collected; the subscription completes on its own."
      />
      {rows.length === 0 ? (
        <EmptyState>No gift subscriptions yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
          <table className="w-full min-w-[56rem]">
            <thead>
              <tr className="border-b border-line">
                <th className={th}>Recipient</th>
                <th className={th}>Plan & months</th>
                <th className={th}>From</th>
                <th className={th}>Bouquets collected</th>
                <th className={th}>Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ sub: s, order: o }) => (
                <tr key={s.id}>
                  <td className={td}>
                    <p className="font-semibold">{s.recipientName}</p>
                    {s.recipientEmail ? (
                      <a href={`mailto:${s.recipientEmail}`} className="text-xs underline">
                        {s.recipientEmail}
                      </a>
                    ) : (
                      <p className="text-xs text-muted">No email: contact the giver</p>
                    )}
                    <div className="mt-1">
                      <Badge tone={s.status === "active" ? "good" : s.status === "cancelled" ? "bad" : "neutral"}>{s.status}</Badge>
                      {o.isDemo && <span className="ml-1"><Badge>Demo</Badge></span>}
                    </div>
                  </td>
                  <td className={td}>
                    {s.planName}
                    <p className="text-xs text-muted">
                      {formatMonth(s.startMonth)} – {formatMonth(addMonths(s.startMonth, s.deliveriesTotal - 1))}
                    </p>
                  </td>
                  <td className={td}>
                    {s.senderName}
                    <p className="text-xs">
                      <Link href={`/admin/orders/${o.id}` as Route} className="underline">
                        {formatOrderNumber(o.number)}
                      </Link>{" "}
                      · <a href={`mailto:${o.customerEmail}`} className="underline">{o.customerEmail}</a>
                    </p>
                    {s.message && <p className="mt-1 max-w-xs text-xs text-ink-soft">“{s.message}”</p>}
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <form action={adjustDeliveriesAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="delta" value="-1" />
                        <button className={adminButtonSecondary} disabled={s.deliveriesCompleted === 0 || s.status === "cancelled"} aria-label="Undo one">
                          −
                        </button>
                      </form>
                      <span className="w-12 text-center font-semibold tabular-nums">
                        {s.deliveriesCompleted}/{s.deliveriesTotal}
                      </span>
                      <form action={adjustDeliveriesAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="delta" value="1" />
                        <button className={adminButtonSecondary} disabled={s.deliveriesCompleted >= s.deliveriesTotal || s.status === "cancelled"} aria-label="Record one collected">
                          +
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className={td}>
                    <form action={saveSubscriptionNotesAction} className="flex gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input name="adminNotes" defaultValue={s.adminNotes} className={`${adminInput} h-9 w-48`} aria-label="Notes" />
                      <button className={adminButtonSecondary}>Save</button>
                    </form>
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
