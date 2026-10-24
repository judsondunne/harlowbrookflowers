import type { Metadata } from "next";
import { CartView } from "./cart-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your cart",
  description: "Review your bouquets and choose a pickup day in Hartland, Vermont.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="container-page pt-12 pb-24 sm:pt-16">
      <h1 className="t-h1 mb-10">Your cart</h1>
      <CartView />
    </div>
  );
}
