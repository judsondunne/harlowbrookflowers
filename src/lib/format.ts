const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const USD_WHOLE = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** "$35" for whole dollars, "$35.50" otherwise. */
export function formatPrice(cents: number) {
  return cents % 100 === 0 ? USD_WHOLE.format(cents / 100) : USD.format(cents / 100);
}

/** Always two decimals, for receipts and totals. */
export function formatMoney(cents: number) {
  return USD.format(cents / 100);
}

export function formatOrderNumber(n: number) {
  return `HB-${String(n).padStart(4, "0")}`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
