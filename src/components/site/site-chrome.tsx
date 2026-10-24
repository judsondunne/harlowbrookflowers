import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { LazyCartDrawer } from "@/components/cart/lazy-cart-drawer";
import { Header } from "./header";
import { Footer } from "./footer";
import { Announcement } from "./announcement";

/** Customer-facing frame shared by every storefront page, the 404 and error pages. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Announcement />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <LazyCartDrawer />
    </CartProvider>
  );
}
