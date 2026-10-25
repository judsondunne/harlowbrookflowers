import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutView } from "./checkout-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Guest checkout for Harlow Brook Flowers.",
  path: "/checkout",
  noindex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-page pt-12 pb-24 sm:pt-16">
      <h1 className="t-h1 mb-10">Checkout</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-linen/60" aria-hidden />}>
        <CheckoutView />
      </Suspense>
    </div>
  );
}
