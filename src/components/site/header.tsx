"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useCart } from "@/components/cart/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { mainNav, site } from "@/lib/site";
import { cn } from "@/lib/format";

// Desktop: the first three links sit left of the wordmark, the rest share the right side with the cart.
const leftNav = mainNav.slice(0, 3);
const rightNav = mainNav.slice(3);
const moreLinks = [
  { href: "/gift-flowers", label: "Gift flowers" },
  { href: "/how-it-works", label: "How pickup works" },
  { href: "/faq", label: "Questions" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (menuOpen && !el.open) el.showModal();
    if (!menuOpen && el.open) el.close();
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const scrolled = scrollY > 8;
  // On the homepage the giant wordmark is the logo; the small one arrives once it has scrolled away.
  const logoHidden = pathname === "/" && scrollY < 220;
  const cartLabel = count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart";

  const cartButton = (
    <button type="button" onClick={open} className="nav-link" aria-label={cartLabel}>
      Cart
      {count > 0 && <span className="ml-1 tabular-nums text-muted">({count})</span>}
    </button>
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow] duration-500",
          scrolled ? "bg-cream/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-cream",
        )}
      >
        <div className="container-page grid h-(--header-h) grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Left: menu on phones and tablets, the first links on desktop */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="nav-link -ml-1 px-1 lg:hidden"
              aria-haspopup="dialog"
            >
              Menu
            </button>
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7 xl:gap-9">
                {leftNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div
            className={cn(
              "justify-self-center transition-[opacity,translate] duration-500 ease-(--ease-out-quint)",
              logoHidden ? "pointer-events-none translate-y-1 opacity-0" : "opacity-100",
            )}
            aria-hidden={logoHidden || undefined}
          >
            <Logo tabIndex={logoHidden ? -1 : undefined} />
          </div>

          <div className="flex items-center justify-self-end gap-7 xl:gap-9">
            <nav aria-label="More" className="hidden lg:block">
              <ul className="flex items-center gap-7 xl:gap-9">
                {rightNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {cartButton}
          </div>
        </div>
      </header>

      <dialog
        ref={menuRef}
        onClose={() => setMenuOpen(false)}
        aria-label="Menu"
        className="menu-sheet m-0 h-dvh max-h-none w-full max-w-none bg-cream p-0 text-ink"
      >
        <div className="container-page flex h-full flex-col">
          <div className="grid h-(--header-h) grid-cols-[1fr_auto_1fr] items-center gap-6">
            <button type="button" onClick={() => setMenuOpen(false)} className="nav-link -ml-1 justify-self-start px-1">
              Close
            </button>
            <Logo />
            <span />
          </div>
          <nav aria-label="Mobile" className="mt-8 flex-1 overflow-y-auto">
            <ul>
              {mainNav.map((item, i) => (
                <li key={item.href} className="menu-item border-b border-line first:border-t" style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="block py-4 font-display text-[2rem] leading-tight font-light tracking-[-0.015em] aria-[current=page]:italic"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="menu-item mt-7 space-y-1" style={{ "--i": mainNav.length } as React.CSSProperties}>
              {moreLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href as Route} onClick={() => setMenuOpen(false)} className="link-rule text-ink-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <ButtonLink href="/shop" size="lg" className="w-full" onClick={() => setMenuOpen(false)}>
              Shop bouquets
            </ButtonLink>
            <p className="text-center text-[0.8125rem] text-muted">
              Grown in {site.location.locality}, {site.location.regionName}. Collected at the farm.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
