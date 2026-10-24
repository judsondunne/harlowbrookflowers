"use client";

import { lazy, Suspense, useState } from "react";
import { useCart } from "./cart-provider";

const CartDrawer = lazy(() => import("./cart-drawer").then((m) => ({ default: m.CartDrawer })));

/** Loads the drawer's code the first time the cart is opened, keeping it out of the initial page JavaScript. */
export function LazyCartDrawer() {
  const { isOpen } = useCart();
  const [wanted, setWanted] = useState(false);
  if (isOpen && !wanted) setWanted(true);
  if (!wanted) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}
