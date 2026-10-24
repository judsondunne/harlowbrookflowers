"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartSnapshot } from "@/components/cart/cart-provider";
import { OrderSummary } from "@/components/cart/order-summary";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { TextArea, TextField } from "@/components/ui/field";
import { checkoutAction, releaseCheckoutAction, type CheckoutFormState } from "@/app/actions/checkout";
import { formatMoney } from "@/lib/format";

const CONTACT_KEY = "hb-checkout-contact";
const CONTACT_FIELDS = ["name", "email", "phone", "note"] as const;

export function CheckoutView() {
  const { cart, snapshot, loading } = useCartSnapshot();
  const [state, action, pending] = useActionState<CheckoutFormState, FormData>(checkoutAction, {});
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const failed = params.get("failed");
  const released = useRef(false);

  // Returning from a cancelled payment: free the held stock straight away.
  useEffect(() => {
    const token = canceled ?? failed;
    if (token && !released.current) {
      released.current = true;
      void releaseCheckoutAction(token);
    }
  }, [canceled, failed]);

  // Remember contact details for this tab only, so returning from a cancelled payment needs no retyping.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(CONTACT_KEY) ?? "{}") as Record<string, string>;
      for (const field of CONTACT_FIELDS) {
        const el = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
        if (el && !el.value && saved[field]) el.value = saved[field];
      }
    } catch {
      // Storage unavailable: nothing to restore.
    }
  }, [cart.lines.length]);
  const remember = () => {
    const form = formRef.current;
    if (!form) return;
    const data = Object.fromEntries(CONTACT_FIELDS.map((f) => [f, (form.elements.namedItem(f) as HTMLInputElement | null)?.value ?? ""]));
    try {
      sessionStorage.setItem(CONTACT_KEY, JSON.stringify(data));
    } catch {
      // Ignore: private mode or storage full.
    }
  };

  const quote = snapshot?.quote;
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.message) errorRef.current?.focus();
  }, [state]);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-display text-4xl">Your cart is empty.</p>
        <p className="mt-4 text-ink-soft">Add a bouquet or a gift subscription to check out.</p>
        <ButtonLink href="/shop" className="mt-8">
          Shop bouquets
        </ButtonLink>
      </div>
    );
  }

  const needsPickupChoice = quote?.needsPickup && !quote.pickup;
  const blocking = quote && !quote.ok;
  const closed = snapshot && !snapshot.checkout.open;
  const v = state.values ?? {};

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        {(canceled || failed) && (
          <div role="status" className="mb-8 border-l-2 border-olive bg-butter/50 px-4 py-3 text-sm">
            <p>
              <span className="font-semibold">{failed ? "Your payment didn't go through." : "Payment cancelled."}</span> Nothing
              was charged and your cart is just as you left it.
            </p>
          </div>
        )}

        <form ref={formRef} action={action} onInput={remember} noValidate className="space-y-10">
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />

          <fieldset className="space-y-5">
            <legend className="t-h3 mb-2">Your details</legend>
            <p className="-mt-1 text-sm text-muted">
              Guest checkout. We only ask for what we need to confirm your order and reach you about pickup.
            </p>
            <TextField
              id="name"
              name="name"
              label="Full name"
              autoComplete="name"
              required
              defaultValue={v.name}
              error={state.fieldErrors?.name}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email"
                autoComplete="email"
                inputMode="email"
                required
                defaultValue={v.email}
                error={state.fieldErrors?.email}
                hint="For your confirmation and pickup details."
              />
              <TextField
                id="phone"
                name="phone"
                type="tel"
                label="Phone"
                optional
                autoComplete="tel"
                defaultValue={v.phone}
                error={state.fieldErrors?.phone}
                hint="Only used if we need to reach you on pickup day."
              />
            </div>
            <TextArea
              id="note"
              name="note"
              label="Anything we should know?"
              optional
              rows={3}
              maxLength={500}
              defaultValue={v.note}
              error={state.fieldErrors?.note}
              placeholder="Color preferences, or the name of whoever is collecting the flowers."
            />
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" name="marketingOptIn" className="mt-0.5 size-4 accent-[var(--color-ink)]" />
            <span className="text-ink-soft">Email me occasionally when new pickup days are posted. (Optional, unsubscribe any time.)</span>
          </label>

          <div ref={errorRef} tabIndex={-1} className="outline-none">
            {state.message && (
              <div role="alert" className="rounded-sm border border-error/40 bg-error/5 p-4 text-sm">
                <p className="font-semibold text-error">{state.message}</p>
                {state.issues && state.issues.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
                    {state.issues.map((i) => (
                      <li key={i.message}>{i.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {needsPickupChoice && (
              <p role="alert" className="text-sm font-medium text-error">
                Choose a pickup day in your <Link href="/cart" className="underline underline-offset-4">cart</Link> before paying.
              </p>
            )}
            {closed && <p className="text-sm text-ink-soft">{snapshot.checkout.reason}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={pending || loading || !!blocking || !!closed || !quote}
              className={buttonClass("primary", "lg", "h-14 w-full gap-3 disabled:opacity-45")}
            >
              {pending ? (
                "Opening secure payment…"
              ) : (
                <>
                  {snapshot?.checkout.demo ? "Continue to demo payment" : "Continue to secure payment"}
                  {quote && <span className="tabular-nums opacity-80">· {formatMoney(quote.totalCents)}</span>}
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-muted">
              {snapshot?.checkout.demo && snapshot.checkout.open
                ? "Preview mode: the next step simulates payment. No card is needed and nothing is charged."
                : "Payment is handled by Stripe. Pay by card, or with Apple Pay or Google Pay where available."}
            </p>
            <p className="mt-2 text-center text-xs text-muted">
              By placing an order you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <OrderSummary cart={cart} snapshot={snapshot} />
          <Link href="/cart" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
            Edit cart or pickup day
          </Link>
        </div>
      </aside>
    </div>
  );
}
