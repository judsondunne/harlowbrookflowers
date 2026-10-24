"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { cartStore } from "./cart-store";
import { QuantityStepper } from "./quantity-stepper";
import type { CartSnapshot } from "@/app/actions/cart";
import type { Cart } from "@/domain/cart";
import { formatPrice, cn } from "@/lib/format";
import { formatMonth } from "@/lib/time";

/** Line items rendered from the local cart (instant edits) priced by the server snapshot. */
export function CartLines({
  cart,
  snapshot,
  onNavigate,
  dense = false,
}: {
  cart: Cart;
  snapshot: CartSnapshot | null;
  onNavigate?: () => void;
  dense?: boolean;
}) {
  const quoted = new Map(snapshot?.quote.lines.map((l) => [l.key, l]) ?? []);
  const issuesByLine = new Map<string, string[]>();
  for (const issue of snapshot?.quote.issues ?? []) {
    if (!issue.lineKey) continue;
    issuesByLine.set(issue.lineKey, [...(issuesByLine.get(issue.lineKey) ?? []), issue.message]);
  }

  return (
    <ul className="divide-y divide-line">
      {cart.lines.map((line) => {
        const q = quoted.get(line.key);
        const issues = issuesByLine.get(line.key) ?? [];
        const missing = snapshot && !q;
        return (
          <li key={line.key} className={cn("flex gap-4", dense ? "py-4" : "py-6")}>
            <div className={cn("relative shrink-0 overflow-hidden bg-linen", dense ? "size-20" : "size-24 sm:size-28")}>
              {q?.image && (
                <Image
                  src={q.image.src}
                  alt=""
                  fill
                  sizes="112px"
                  className={cn(q.image.kind === "cutout" ? "object-contain p-1.5" : "object-cover")}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {q ? (
                    <Link
                      href={(q.kind === "subscription" ? `/subscriptions#${q.slug}` : `/shop/${q.slug}`) as Route}
                      onClick={onNavigate}
                      className="font-display text-lg leading-tight hover:underline hover:underline-offset-4"
                    >
                      {q.name}
                    </Link>
                  ) : (
                    <span className="font-display text-lg leading-tight text-muted">{missing ? "Unavailable item" : "Loading…"}</span>
                  )}
                  {q?.sizeLabel && <p className="mt-0.5 text-[0.8125rem] text-muted">{q.sizeLabel}</p>}
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  {q ? formatPrice(q.unitPriceCents * (q.kind === "subscription" ? 1 : line.quantity)) : ""}
                </p>
              </div>

              {line.cardMessage && (
                <p className="mt-2 text-[0.8125rem] text-ink-soft">
                  <span className="font-semibold">Card:</span> <span className="t-accent text-[0.95rem]">“{line.cardMessage}”</span>
                </p>
              )}
              {line.gift && (
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                  Gift for <span className="font-semibold">{line.gift.recipientName}</span> from {line.gift.senderName}
                  <br />
                  Starts {formatMonth(line.gift.startMonth)}
                </p>
              )}
              {issues.map((msg) => (
                <p key={msg} role="alert" className="mt-2 text-[0.8125rem] font-medium text-error">
                  {msg}
                </p>
              ))}

              <div className="mt-3 flex items-center justify-between gap-3">
                {q?.kind === "subscription" || !q ? (
                  <span className="text-[0.8125rem] text-muted">{q ? "Prepaid gift" : ""}</span>
                ) : (
                  <QuantityStepper
                    size="sm"
                    label={`Quantity of ${q.name}`}
                    value={line.quantity}
                    max={q.maxQuantity}
                    onChange={(n) => cartStore.setQuantity(line.key, n)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => cartStore.remove(line.key)}
                  className="text-[0.8125rem] font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Remove<span className="sr-only"> {q?.name ?? "item"}</span>
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
