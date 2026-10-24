"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { buttonClass } from "@/components/ui/button";

export function QuickAdd({
  productId,
  name,
  disabled,
  label = "Add to cart",
  className,
}: {
  productId: string;
  name: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const { open, announce } = useCart();
  const [added, setAdded] = useState(false);
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
      className={buttonClass("secondary", "sm", className)}
      aria-label={`${label}: ${name}`}
    >
      {added ? "Added" : label}
    </button>
  );
}
