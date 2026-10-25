/** Order lifecycle. Transitions are enforced server-side in src/server/orders.ts. */

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "ready",
  "picked_up",
  "cancelled",
  "expired",
  "payment_failed",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses that hold stock and pickup capacity. */
export const RESERVING_STATUSES: readonly OrderStatus[] = ["pending_payment", "paid", "ready", "picked_up"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  ready: "Ready for pickup",
  picked_up: "Picked up",
  cancelled: "Cancelled",
  expired: "Checkout expired",
  payment_failed: "Payment failed",
  refunded: "Refunded",
};

/** Allowed manual/admin transitions. Payment transitions are driven by Stripe events. */
export const ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["ready", "picked_up", "cancelled", "refunded"],
  ready: ["picked_up", "paid", "cancelled", "refunded"],
  picked_up: ["ready", "refunded"],
  pending_payment: ["cancelled"],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}
