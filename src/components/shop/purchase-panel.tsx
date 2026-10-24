"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { PickupPicker } from "@/components/cart/pickup-picker";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Button } from "@/components/ui/button";
import { IconCheck, IconInfo } from "@/components/ui/icons";
import type { PickupWindowAvailability } from "@/domain/catalog";
import { cn, formatPrice } from "@/lib/format";

/** Product purchase controls: pickup day, quantity, optional card, add to cart. */
export function PurchasePanel({
  product,
  windows,
  purchasable,
  unavailableReason,
  maxQuantity,
}: {
  product: { id: string; name: string; priceCents: number };
  windows: PickupWindowAvailability[];
  purchasable: boolean;
  unavailableReason?: string;
  maxQuantity: number;
}) {
  const { cart, open, announce } = useCart();
  const id = useId();
  const [quantity, setQuantity] = useState(1);
  const [withCard, setWithCard] = useState(false);
  const [card, setCard] = useState("");
  const [pickup, setPickup] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonVisible, setButtonVisible] = useState(true);

  // Mobile: keep price + add-to-cart within reach once the main button scrolls away.
  useEffect(() => {
    const el = buttonRef.current;
    const footer = document.querySelector("footer");
    if (!el || !("IntersectionObserver" in window)) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      setButtonVisible([...seen.values()].some(Boolean));
    });
    io.observe(el);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  const selectedPickup = pickup ?? (windows.some((w) => w.id === cart.pickupWindowId && w.bookable) ? cart.pickupWindowId : undefined);
  const hasWindows = windows.some((w) => w.bookable);

  const add = () => {
    if (!selectedPickup && hasWindows) {
      setError("Choose a pickup day first.");
      document.getElementById(`${id}-pickup`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    cartStore.add({ productId: product.id, quantity, cardMessage: withCard && card.trim() ? card.trim() : undefined });
    if (selectedPickup) cartStore.setPickup(selectedPickup);
    announce(`${quantity} × ${product.name} added to your cart.`);
    open();
  };

  if (!purchasable) {
    return (
      <div className="rounded-sm border border-line-strong bg-paper p-5">
        <p className="font-semibold">{unavailableReason ?? "Not available right now"}</p>
        <p className="mt-1 text-sm text-muted">
          Join the list at the bottom of the page and we&apos;ll write when it&apos;s back.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section aria-labelledby={`${id}-pickup`}>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 id={`${id}-pickup`} className="t-label">
            1 · Choose a pickup day
          </h2>
          <Link href="/how-it-works" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
            Where &amp; when?
          </Link>
        </div>
        <PickupPicker
          windows={windows}
          value={selectedPickup}
          onChange={(v) => {
            setPickup(v);
            setError("");
          }}
          bouquetCount={quantity}
          compact
          limit={4}
          name={`${id}-pickup-choice`}
        />
      </section>

      <section aria-labelledby={`${id}-qty`} className="flex items-center justify-between gap-4">
        <h2 id={`${id}-qty`} className="t-label">
          2 · Quantity
        </h2>
        <QuantityStepper label={`Quantity of ${product.name}`} value={quantity} max={maxQuantity} onChange={setQuantity} />
      </section>

      <section>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={withCard}
            onChange={(e) => setWithCard(e.target.checked)}
            className="mt-1 size-4 accent-[var(--color-ink)]"
          />
          <span>
            <span className="block font-semibold">Add a handwritten card</span>
            <span className="block text-sm text-muted">Free. Sarah writes your note on a card tucked into the bouquet.</span>
          </span>
        </label>
        {withCard && (
          <div className="mt-3">
            <label htmlFor={`${id}-card`} className="sr-only">
              Card message
            </label>
            <textarea
              id={`${id}-card`}
              value={card}
              maxLength={300}
              rows={3}
              onChange={(e) => setCard(e.target.value)}
              placeholder="Happy birthday, with love from…"
              className="w-full resize-none rounded-sm border border-line-strong bg-paper px-4 py-3 text-[0.9375rem] outline-none focus:border-ink"
            />
            <p className="mt-1 text-right text-xs text-muted tabular-nums">{card.length}/300</p>
          </div>
        )}
      </section>

      <div>
        {error && (
          <p role="alert" className="mb-3 text-sm font-medium text-error">
            {error}
          </p>
        )}
        <Button ref={buttonRef} size="lg" className="w-full" onClick={add}>
          Add to cart · {formatPrice(product.priceCents * quantity)}
        </Button>
        <div
          aria-hidden={buttonVisible}
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-500 ease-(--ease-out-quint) lg:hidden",
            buttonVisible ? "translate-y-full" : "translate-y-0",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg leading-tight">{product.name}</p>
              <p className="text-sm text-muted tabular-nums">{formatPrice(product.priceCents * quantity)}</p>
            </div>
            <Button onClick={add} tabIndex={buttonVisible ? -1 : 0}>
              Add to cart
            </Button>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-ink-soft">
          {["Picked for your pickup day", "Collect at the farm in Hartland, VT", "Secure checkout, no account needed"].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <IconCheck size={16} className="text-olive" strokeWidth={1.75} /> {t}
            </li>
          ))}
        </ul>
      </div>

      <p className="flex gap-3 rounded-sm bg-butter/55 p-4 text-sm leading-relaxed text-ink-soft">
        <IconInfo size={20} className="mt-0.5 shrink-0 text-olive" />
        <span>
          <span className="font-semibold text-ink">Seasonal by nature.</span> Photos show the style and size. Your bouquet
          is made from what&apos;s blooming that week, so the exact flowers and colors will differ.
        </span>
      </p>
    </div>
  );
}
