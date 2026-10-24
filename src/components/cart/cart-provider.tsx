"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cartStore } from "./cart-store";
import { getCartSnapshot, type CartSnapshot } from "@/app/actions/cart";
import type { Cart } from "@/domain/cart";

type CartContextValue = {
  cart: Cart;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Server-verified prices, availability and pickup windows. Null until first loaded. */
  snapshot: CartSnapshot | null;
  loading: boolean;
  requestSnapshot: () => () => void;
  announce: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [isOpen, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");
  const requestId = useRef(0);

  const count = useMemo(() => cart.lines.reduce((n, l) => n + l.quantity, 0), [cart]);
  const wanted = isOpen || interest > 0;

  useEffect(() => {
    if (!wanted) return;
    const id = ++requestId.current;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await getCartSnapshot(cart);
        if (id === requestId.current) setSnapshot(next);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 120);
    return () => window.clearTimeout(t);
  }, [cart, wanted]);

  const requestSnapshot = useCallback(() => {
    setInterest((n) => n + 1);
    return () => setInterest((n) => n - 1);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      snapshot,
      loading,
      requestSnapshot,
      announce: setLiveMessage,
    }),
    [cart, count, isOpen, snapshot, loading, requestSnapshot],
  );

  return (
    <CartContext value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </CartContext>
  );
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Subscribes the calling component to server-verified cart data for as long as it is mounted. */
export function useCartSnapshot() {
  const ctx = useCart();
  const { requestSnapshot } = ctx;
  useEffect(() => requestSnapshot(), [requestSnapshot]);
  return ctx;
}
