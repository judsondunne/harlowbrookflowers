"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";
import { cartStore } from "./cart-store";
import { CartLines } from "./cart-lines";
import { PickupPicker } from "./pickup-picker";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/format";

export function CartDrawer() {
  const { cart, count, isOpen, close, snapshot, loading } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  // Close when navigating to another page (not on mount: the drawer mounts as it opens).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      close();
    }
  }, [pathname, close]);

  const quote = snapshot?.quote;
  const needsPickup = quote?.needsPickup ?? false;
  const cartIssues = quote?.issues.filter((i) => !i.lineKey && i.code !== "pickup_required") ?? [];
  const canCheckout = !!quote && quote.ok && snapshot?.checkout.open && !loading;

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby="cart-title"
      className="drawer ml-auto h-dvh max-h-dvh w-full max-w-[28rem] bg-cream p-0 text-ink backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-title" className="font-display text-[1.625rem] font-light">
            Your cart{count > 0 && <span className="ml-2 align-middle text-sm font-sans font-semibold text-muted">{count}</span>}
          </h2>
          <button
            type="button"
            onClick={close}
            className="nav-link"
            aria-label="Close cart"
          >
            Close
          </button>
        </header>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-display text-3xl leading-tight font-light">Nothing here yet,<br />but the garden&apos;s full.</p>
            <p className="max-w-xs text-sm text-muted">Choose a bouquet for pickup in Hartland, or give someone a season of flowers.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/shop" onClick={close}>Shop bouquets</ButtonLink>
              <ButtonLink href="/subscriptions" variant="secondary" onClick={close}>Give a season</ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6">
              <CartLines cart={cart} snapshot={snapshot} onNavigate={close} dense />

              {needsPickup && snapshot && (
                <section aria-labelledby="drawer-pickup" className="border-t border-line py-6">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 id="drawer-pickup" className="t-label">Pickup day</h3>
                    <span className="text-xs text-muted">Hartland, VT</span>
                  </div>
                  <PickupPicker
                    compact
                    limit={6}
                    name="drawer-pickup"
                    windows={snapshot.windows}
                    value={cart.pickupWindowId}
                    bouquetCount={quote?.bouquetCount ?? 1}
                    onChange={(id) => cartStore.setPickup(id)}
                  />
                </section>
              )}
            </div>

            <footer className="border-t border-line bg-paper/70 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {cartIssues.map((i) => (
                <p key={i.message} role="alert" className="mb-3 text-sm font-medium text-error">
                  {i.message}
                </p>
              ))}
              {snapshot && !snapshot.checkout.open && (
                <p className="mb-3 text-sm text-ink-soft">{snapshot.checkout.reason}</p>
              )}
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-semibold tabular-nums">{quote ? formatMoney(quote.subtotalCents) : "—"}</dd>
                </div>
                {quote && quote.taxCents > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Tax</dt>
                    <dd className="tabular-nums">{formatMoney(quote.taxCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Pickup in Hartland</dt>
                  <dd>Free</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                aria-disabled={!canCheckout}
                onClick={(e) => {
                  if (!canCheckout) e.preventDefault();
                }}
                className={buttonClass("primary", "lg", cn("mt-5 w-full", !canCheckout && "pointer-events-none opacity-45"))}
              >
                {needsPickup && !cart.pickupWindowId ? "Choose a pickup day to continue" : "Checkout"}
              </Link>
              <div className="mt-3 flex items-center justify-between text-[0.8125rem]">
                <Link href="/cart" className="font-medium underline-offset-4 hover:underline">
                  View full cart
                </Link>
                <span className="text-muted">Secure payment · Guest checkout</span>
              </div>
              {snapshot?.checkout.demo && snapshot.checkout.open && (
                <p className="mt-3 bg-butter/60 px-3 py-2 text-xs text-ink-soft">
                  Preview mode: checkout is a demonstration and no payment is taken.
                </p>
              )}
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
