import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { db } from "@/server/db/client";
import { getOrderBySession, getOrderByToken, type OrderDetail } from "@/server/orders";
import { confirmPayment } from "@/server/order-events";
import { loadSettings } from "@/server/settings";
import { paymentMode } from "@/server/config";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";
import { buttonClass } from "@/components/ui/button";
import { SprigMark } from "@/components/ui/icons";
import { GiftCardFace } from "@/components/subscriptions/gift-card";
import { GiftSharePanel } from "@/components/subscriptions/gift-share-panel";
import { giftCardImagePath, giftPageUrl, giftPlanImages, giftSummary } from "@/server/gifts";
import { AwaitConfirmation, ClearCart, PrintButton } from "./clear-cart";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { addMonths, formatDateLong, formatMonth, formatTimeRange } from "@/lib/time";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Thank you",
  description: "Your Harlow Brook Flowers order.",
  path: "/order/success",
  noindex: true,
});

export default function SuccessPage({ searchParams }: PageProps<"/order/success">) {
  return (
    <div className="container-page pt-14 pb-24 sm:pt-20">
      <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-sm bg-linen/60" />}>
        <OrderConfirmation searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function resolveOrder(params: { session_id?: string | string[]; token?: string | string[] }): Promise<OrderDetail | null> {
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;
  const token = typeof params.token === "string" ? params.token : undefined;
  if (sessionId && paymentMode() !== "demo") {
    const detail = await getOrderBySession(db, sessionId);
    if (!detail) return null;
    if (detail.order.status === "pending_payment") {
      // Confirm directly with Stripe as well as via the webhook (Stripe's recommended pattern). Idempotent.
      const { getStripe } = await import("@/server/stripe");
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.orderId === detail.order.id) {
        await confirmPayment({
          orderId: detail.order.id,
          now: new Date(),
          sessionId,
          amountTotal: session.amount_total,
          paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        });
        return getOrderBySession(db, sessionId);
      }
    }
    return detail;
  }
  if (token) return getOrderByToken(db, token);
  return null;
}

async function OrderConfirmation({ searchParams }: { searchParams: PageProps<"/order/success">["searchParams"] }) {
  await connection();
  const detail = await resolveOrder(await searchParams);
  if (!detail) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="t-h1">We couldn&apos;t find that order.</h1>
        <p className="t-lead mt-5">
          If you just paid, your confirmation email has the details. Or write to{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>{" "}
          and we&apos;ll help.
        </p>
        <ButtonLink href="/shop" className="mt-8">
          Back to the shop
        </ButtonLink>
      </div>
    );
  }

  const { order, items, window, gifts } = detail;
  const [settings, planImages] = await Promise.all([loadSettings(), giftPlanImages(gifts)]);
  const paid = ["paid", "ready", "picked_up"].includes(order.status);
  const first = order.customerName.split(" ")[0];

  if (order.status === "pending_payment") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <AwaitConfirmation />
        <SprigMark size={40} className="mx-auto text-ink-soft" />
        <h1 className="t-h1 mt-6">Confirming your payment…</h1>
        <p className="t-lead mt-5">This usually takes a few seconds. The page will update by itself, and your confirmation email is on its way.</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="t-h1">This order wasn&apos;t completed.</h1>
        <p className="t-lead mt-5">No payment was taken. Your cart is still saved if you&apos;d like to try again.</p>
        <ButtonLink href="/cart" className="mt-8">
          Return to cart
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ClearCart />
      <div className="text-center print:hidden">
        <Eyebrow>
          Order {formatOrderNumber(order.number)}
          {order.isDemo ? " · Demo order, no payment taken" : ""}
        </Eyebrow>
        <h1 className="t-h1 mt-3">Thank you, {first}.</h1>
        <p className="t-lead mx-auto mt-5 max-w-xl">
          {window
            ? "Your flowers will be picked for your pickup day. A confirmation with directions is on its way to "
            : "Your gift is confirmed. A confirmation is on its way to "}
          <span className="font-semibold text-ink">{order.customerEmail}</span>.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2 print:hidden">
        {window && (
          <section aria-labelledby="pickup" className="bg-paper p-7 ring-1 ring-line">
            <h2 id="pickup" className="t-label">
              Your pickup
            </h2>
            <p className="mt-4 font-display text-3xl leading-tight font-medium">{formatDateLong(window.date)}</p>
            <p className="mt-1 text-ink-soft">{formatTimeRange(window.startTime, window.endTime)}</p>
            <p className="mt-5 text-sm">
              <span>
                <span className="block font-medium">{settings.pickupLocationPublic}</span>
                <span className="mt-1 block whitespace-pre-line text-ink-soft">{settings.pickupInstructions}</span>
              </span>
            </p>
            <a
              href={`/api/orders/${order.publicToken}/calendar`}
              className={buttonClass("secondary", "sm", "mt-6")}
            >
              Add to calendar
            </a>
          </section>
        )}

        <section aria-labelledby="items" className="bg-paper p-7 ring-1 ring-line">
          <h2 id="items" className="t-label">
            What you ordered
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="py-3">
                <p className="flex justify-between gap-4">
                  <span className="font-semibold">
                    {i.quantity} × {i.productName}
                  </span>
                  <span className="tabular-nums">{formatMoney(i.lineTotalCents)}</span>
                </p>
                {i.cardMessage && <p className="mt-1 text-sm text-ink-soft">Card: “{i.cardMessage}”</p>}
                {i.gift && (
                  <p className="mt-1 text-sm text-ink-soft">
                    For {i.gift.recipientName}, starting {formatMonth(i.gift.startMonth)}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
            <span>Total {order.isDemo ? "(demo)" : "paid"}</span>
            <span className="tabular-nums">{formatMoney(order.totalCents)}</span>
          </p>
        </section>
      </div>

      {gifts.length > 0 && (
        <section aria-labelledby="gift-cards" className="mt-14">
          <div className="mb-6 flex items-center justify-between print:hidden">
            <h2 id="gift-cards" className="t-h3">
              {gifts.length === 1 ? "Your gift card" : "Your gift cards"}
            </h2>
            <PrintButton />
          </div>
          <div className="space-y-12">
            {gifts.map((g) => {
              const { design } = giftSummary(g);
              return (
                <div key={g.id} className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
                  <article aria-label={`Gift card for ${g.recipientName}`} className="bg-linen p-6 sm:p-10 print:bg-transparent print:p-0">
                    <GiftCardFace
                      size="lg"
                      design={design}
                      image={planImages.get(g.productId)}
                      planName={g.planName}
                      detail={`${g.deliveriesTotal} Garden Bouquets · ${formatMonth(g.startMonth)}${
                        g.deliveriesTotal > 1 ? ` to ${formatMonth(addMonths(g.startMonth, g.deliveriesTotal - 1))}` : ""
                      }`}
                      recipient={g.recipientName}
                      message={g.message ? `“${g.message}”` : "A season of flowers, picked with care."}
                      sender={g.senderName}
                    />
                    <p className="mt-4 text-center text-xs text-muted">
                      Collected each month in Hartland, Vermont. Sarah will be in touch with pickup dates.
                    </p>
                  </article>
                  {g.shareToken && (
                    <div className="print:hidden">
                      <GiftSharePanel
                        url={giftPageUrl(g.shareToken)}
                        previewImage={giftCardImagePath(g.shareToken)}
                        recipientName={g.recipientName}
                        senderName={g.senderName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-line pt-10 print:hidden">
        <h2 className="t-h3">What happens next</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {(window
            ? [
                "You'll receive a confirmation email with the pickup address and directions.",
                "Your bouquet is picked and arranged for your pickup day.",
                "Collect it at the farm during your pickup time. Just give your name.",
              ]
            : [
                "You'll receive a confirmation email with the gift details.",
                "Before the season begins, Sarah writes with the pickup dates.",
                "Your recipient collects a fresh bouquet in Hartland each month.",
              ]
          ).map((t) => (
            <li key={t} className="border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted">
          Questions about your order? Write to{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>{" "}
          and mention {formatOrderNumber(order.number)}.{" "}
          <Link href={"/shop" as Route} className="font-semibold text-ink underline underline-offset-4">
            Back to the shop
          </Link>
        </p>
      </section>
    </div>
  );
}
