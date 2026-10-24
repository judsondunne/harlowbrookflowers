"use client";

import type { CartSnapshot } from "@/app/actions/cart";
import type { Cart } from "@/domain/cart";
import { CartLines } from "./cart-lines";
import { formatMoney } from "@/lib/format";
import { formatDateLong, formatTimeRange } from "@/lib/time";
import { IconCalendar } from "@/components/ui/icons";

/** Totals block shared by cart and checkout. */
export function Totals({ snapshot }: { snapshot: CartSnapshot | null }) {
  const q = snapshot?.quote;
  return (
    <dl className="space-y-2 text-[0.9375rem]">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums">{q ? formatMoney(q.subtotalCents) : "—"}</dd>
      </div>
      {q && q.taxCents > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted">Tax</dt>
          <dd className="tabular-nums">{formatMoney(q.taxCents)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted">Pickup</dt>
        <dd>Free</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-lg">
        <dt className="font-semibold">Total</dt>
        <dd className="font-semibold tabular-nums">{q ? formatMoney(q.totalCents) : "—"}</dd>
      </div>
    </dl>
  );
}

export function OrderSummary({ cart, snapshot }: { cart: Cart; snapshot: CartSnapshot | null }) {
  const pickup = snapshot?.quote.pickup;
  return (
    <div className="bg-paper p-6 ring-1 ring-line sm:p-8">
      <h2 className="font-display text-2xl">Your order</h2>
      <CartLines cart={cart} snapshot={snapshot} dense />
      {pickup && (
        <p className="mt-2 flex items-start gap-3 border-t border-line pt-5 text-sm">
          <IconCalendar size={20} className="mt-0.5 shrink-0 text-olive" />
          <span>
            <span className="block font-semibold">Pickup {formatDateLong(pickup.date)}</span>
            <span className="text-muted">
              {formatTimeRange(pickup.startTime, pickup.endTime)} · {snapshot?.pickupLocation}
            </span>
          </span>
        </p>
      )}
      <div className="mt-5 border-t border-line pt-5">
        <Totals snapshot={snapshot} />
      </div>
    </div>
  );
}
