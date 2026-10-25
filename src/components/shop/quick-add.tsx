"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { buttonClass } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/format";

/**
 * Adds one bouquet and opens the cart. `variant="bar"` is the full-width bar that rises over a product photo on
 * hover; the default is the small outlined button.
 */
export function QuickAdd({
  productId,
  name,
  priceCents,
  disabled,
  label = "Add to cart",
  variant = "button",
  className,
}: {
  productId: string;
  name: string;
  priceCents?: number;
  disabled?: boolean;
  label?: string;
  variant?: "button" | "bar";
  className?: string;
}) {
  const { open, announce } = useCart();
  const [added, setAdded] = useState(false);
  const text = added ? "Added" : disabled ? "Unavailable" : label;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        cartStore.add({ productId, quantity: 1 });
        announce(`${name} added to your cart.`);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
        open();
      }}
      className={
        variant === "bar"
          ? cn(
              "flex h-12 w-full items-center justify-between bg-paper/95 px-5 text-[0.875rem] font-medium text-ink shadow-[0_10px_30px_-18px_rgba(42,34,29,0.6)] backdrop-blur-sm transition-colors hover:bg-ink hover:text-paper disabled:opacity-60",
              className,
            )
          : buttonClass("secondary", "sm", className)
      }
      aria-label={`${label}: ${name}${priceCents !== undefined ? `, ${formatPrice(priceCents)}` : ""}`}
    >
      {variant === "bar" ? (
        <>
          <span>{text}</span>
          {priceCents !== undefined && <span className="tabular-nums">{formatPrice(priceCents)}</span>}
        </>
      ) : (
        text
      )}
    </button>
  );
}
