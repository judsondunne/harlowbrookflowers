"use client";

import Link from "next/link";
import { useCartSnapshot } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { CartLines } from "@/components/cart/cart-lines";
import { PickupPicker } from "@/components/cart/pickup-picker";
import { Totals } from "@/components/cart/order-summary";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/format";

export function CartView() {
  const { cart, snapshot, loading } = useCartSnapshot();
  const quote = snapshot?.quote;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-display text-4xl leading-tight">Your cart is empty.</p>
        <p className="mt-4 text-ink-soft">The garden isn&apos;t. Choose a bouquet for pickup in Hartland, or give a season of flowers.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop">Shop bouquets</ButtonLink>
          <ButtonLink href="/subscriptions" variant="secondary">
            Flower subscriptions
          </ButtonLink>
        </div>
      </div>
    );
  }

  const cartIssues = quote?.issues.filter((i) => !i.lineKey && i.code !== "pickup_required") ?? [];
  const canCheckout = !!quote?.ok && snapshot?.checkout.open && !loading;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <div className="border-t border-line">
          <CartLines cart={cart} snapshot={snapshot} />
        </div>
        {quote?.needsPickup && snapshot && (
          <section aria-labelledby="pickup-h" className="mt-6 border-t border-line pt-8">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="pickup-h" className="t-h3">
                Choose a pickup day
              </h2>
              <p className="text-sm text-muted">{snapshot.pickupLocation}</p>
            </div>
            <PickupPicker
              windows={snapshot.windows}
              value={cart.pickupWindowId}
              bouquetCount={quote.bouquetCount}
              onChange={(id) => cartStore.setPickup(id)}
            />
            <p className="mt-3 text-sm text-muted">
              The exact address and directions come with your confirmation.{" "}
              <Link href="/how-it-works" className="underline underline-offset-4 hover:text-ink">
                How pickup works
              </Link>
            </p>
          </section>
        )}
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-paper p-6 ring-1 ring-line sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <h2 className="font-display text-2xl">Summary</h2>
          <div className="mt-5">
            <Totals snapshot={snapshot} />
          </div>
          {cartIssues.map((i) => (
            <p key={i.message} role="alert" className="mt-4 text-sm font-medium text-error">
              {i.message}
            </p>
          ))}
          {snapshot && !snapshot.checkout.open && <p className="mt-4 text-sm text-ink-soft">{snapshot.checkout.reason}</p>}
          <Link
            href="/checkout"
            aria-disabled={!canCheckout}
            onClick={(e) => {
              if (!canCheckout) e.preventDefault();
            }}
            className={buttonClass("primary", "lg", cn("mt-6 w-full", !canCheckout && "pointer-events-none opacity-45"))}
          >
            {quote?.needsPickup && !cart.pickupWindowId ? "Choose a pickup day to continue" : "Continue to checkout"}
          </Link>
          <p className="mt-4 text-center text-xs text-muted">Secure payment by Stripe · No account needed</p>
          <Link href="/shop" className="mt-6 block text-center text-sm font-medium underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
            Keep shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
