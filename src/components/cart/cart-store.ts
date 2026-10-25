import type { Cart, CartLine } from "@/domain/cart";
import { lineKey } from "@/domain/cart-keys";

/**
 * Persistent client cart (localStorage), exposed as an external store for useSyncExternalStore.
 * It only stores selections; prices and availability are always fetched from the server.
 */
const KEY = "hb-cart-v1";
const EMPTY: Cart = { lines: [] };

let state: Cart = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(value: unknown): Cart {
  if (!value || typeof value !== "object") return EMPTY;
  const v = value as Partial<Cart>;
  const lines = Array.isArray(v.lines)
    ? v.lines.filter(
        (l): l is CartLine =>
          !!l && typeof l.key === "string" && typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0,
      )
    : [];
  return { lines: lines.slice(0, 20), pickupWindowId: typeof v.pickupWindowId === "string" ? v.pickupWindowId : undefined };
}

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      emit();
    }
  });
}

function emit() {
  for (const l of listeners) l();
}

function commit(next: Cart) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full: the cart still works for this page view.
  }
  emit();
}

export const cartStore = {
  subscribe(listener: () => void) {
    ensureLoaded();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureLoaded();
    return state;
  },
  getServerSnapshot() {
    return EMPTY;
  },

  add(input: Omit<CartLine, "key">, opts: { unique?: boolean } = {}) {
    const key = lineKey(input.productId, input.cardMessage, opts.unique ?? !!input.gift);
    const existing = state.lines.find((l) => l.key === key);
    const lines = existing
      ? state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(24, l.quantity + input.quantity) } : l))
      : [...state.lines, { ...input, key }];
    commit({ ...state, lines });
    return key;
  },
  setQuantity(key: string, quantity: number) {
    const q = Math.max(1, Math.min(24, Math.floor(quantity)));
    commit({ ...state, lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: q } : l)) });
  },
  remove(key: string) {
    commit({ ...state, lines: state.lines.filter((l) => l.key !== key) });
  },
  /** Edits a gift line's card in place (recipient, sender, message, design). Its key stays the same. */
  updateGift(key: string, patch: Partial<NonNullable<CartLine["gift"]>>) {
    commit({
      ...state,
      lines: state.lines.map((l) => (l.key === key && l.gift ? { ...l, gift: { ...l.gift, ...patch } } : l)),
    });
  },
  setPickup(pickupWindowId: string | undefined) {
    commit({ ...state, pickupWindowId });
  },
  clear() {
    commit(EMPTY);
  },
};
