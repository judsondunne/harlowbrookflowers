"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { IconCheck, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/format";

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
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border border-ink/80 px-4 text-[0.8125rem] font-semibold transition-colors duration-300",
        "hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-muted disabled:hover:bg-transparent",
        className,
      )}
      aria-label={`${label}: ${name}`}
    >
      {added ? <IconCheck size={16} strokeWidth={2} /> : <IconPlus size={16} />}
      {added ? "Added" : label}
    </button>
  );
}
