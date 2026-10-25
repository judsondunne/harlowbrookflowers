"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cartStore } from "@/components/cart/cart-store";

/** Empties the cart once payment is confirmed. */
export function ClearCart() {
  useEffect(() => {
    cartStore.clear();
    try {
      sessionStorage.removeItem("hb-checkout-contact");
    } catch {
      // Storage unavailable.
    }
  }, []);
  return null;
}

/** While payment is still being confirmed, re-checks every few seconds (up to ~1 minute). */
export function AwaitConfirmation() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      if (n > 20) window.clearInterval(t);
      else router.refresh();
    }, 3000);
    return () => window.clearInterval(t);
  }, [router]);
  return null;
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm font-semibold underline underline-offset-4 print:hidden"
    >
      Print gift card
    </button>
  );
}
