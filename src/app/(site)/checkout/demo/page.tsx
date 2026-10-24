import { buttonClass } from "@/components/ui/button";
import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db/client";
import { getOrderByToken } from "@/server/orders";
import { demoCheckoutEnabled, paymentMode } from "@/server/config";
import { demoPaymentAction } from "@/app/actions/checkout";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { formatDateLong, formatTimeRange } from "@/lib/time";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo payment",
  description: "Demonstration checkout. No payment is taken.",
  path: "/checkout/demo",
  noindex: true,
});

export default function DemoPaymentPage({ searchParams }: PageProps<"/checkout/demo">) {
  return (
    <div className="container-page max-w-2xl pt-14 pb-24">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-sm bg-linen/60" />}>
        <DemoPayment searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DemoPayment({ searchParams }: { searchParams: PageProps<"/checkout/demo">["searchParams"] }) {
  await connection();
  const { token } = await searchParams;
  if (paymentMode() !== "demo" || !demoCheckoutEnabled() || typeof token !== "string") notFound();
  const detail = await getOrderByToken(db, token);
  if (!detail || !detail.order.isDemo) notFound();
  const { order, items, window } = detail;
  const pending = order.status === "pending_payment";

  return (
    <>
      <p className="t-eyebrow">Demonstration · no payment is taken</p>
      <h1 className="t-h1 mt-3">Demo payment</h1>
      <p className="t-lead mt-4">
        Stripe isn&apos;t connected yet, so this page stands in for the secure payment step. Choose an outcome to see how
        the shop handles it. Order {formatOrderNumber(order.number)} is recorded as a demo and never counts as a sale.
      </p>

      <div className="mt-10 bg-paper p-6 ring-1 ring-line sm:p-8">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3 text-[0.9375rem]">
              <span>
                {i.quantity} × {i.productName}
              </span>
              <span className="tabular-nums">{formatMoney(i.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        {window && (
          <p className="mt-3 text-sm text-muted">
            Pickup {formatDateLong(window.date)}, {formatTimeRange(window.startTime, window.endTime)}
          </p>
        )}
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(order.totalCents)}</span>
        </p>
      </div>

      {pending ? (
        <form action={demoPaymentAction} className="mt-8 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="token" value={token} />
          <button name="outcome" value="succeed" className={buttonClass("primary")}>
            Simulate successful payment
          </button>
          <button name="outcome" value="fail" className={buttonClass("secondary")}>
            Simulate declined card
          </button>
          <button name="outcome" value="cancel" className="link-rule px-2">
            Cancel and go back
          </button>
        </form>
      ) : (
        <p className="mt-8 rounded-sm bg-butter/60 p-4 text-sm">
          This demo checkout has already finished (status: {order.status.replace("_", " ")}).
        </p>
      )}
    </>
  );
}
