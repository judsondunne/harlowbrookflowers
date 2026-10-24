"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useCart } from "@/components/cart/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { IconBag, IconClose, IconMenu, VineFlourish } from "@/components/ui/icons";
import { mainNav, site } from "@/lib/site";
import { cn } from "@/lib/format";

export function Header() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled ? "bg-cream/88 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="container-page grid h-(--header-h) grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Logo />

          <nav aria-label="Main" className="relative hidden lg:block">
            <VineFlourish className="pointer-events-none absolute -top-[1.05rem] -left-10 w-28 text-olive/75" />
            <VineFlourish flip className="pointer-events-none absolute -top-[1.05rem] -right-10 w-28 text-olive/75" />
            <ul className="flex items-center gap-0.5 rounded-full border border-ink/20 bg-paper/55 p-1 backdrop-blur-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.01em] transition-colors duration-300",
                      isActive(item.href) ? "bg-ink text-paper" : "text-ink hover:bg-ink/6",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={open}
              className="relative grid size-11 place-items-center rounded-full border border-ink/20 bg-paper/55 transition-colors hover:bg-paper"
              aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
            >
              <IconBag size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.625rem] leading-5 font-bold text-paper tabular-nums">
                  {count}
                </span>
              )}
            </button>
            <ButtonLink href="/shop" size="sm" className="h-11 px-5 max-sm:hidden">
              Shop bouquets
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-ink/20 bg-paper/55 lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <IconMenu size={20} />
            </button>
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
          <div className="flex h-(--header-h) items-center justify-between" onClickCapture={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}>
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid size-11 place-items-center rounded-full border border-ink/20"
              aria-label="Close menu"
            >
              <IconClose size={20} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-6 flex-1">
            <ul className="space-y-1">
              {[{ href: "/", label: "Home" }, ...mainNav, { href: "/how-it-works", label: "How pickup works" }, { href: "/contact", label: "Contact" }].map(
                (item, i) => (
                  <li key={item.href} className="menu-item" style={{ "--i": i } as React.CSSProperties}>
                    <Link
                      href={item.href as "/"}
                      onClick={() => setMenuOpen(false)}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="flex items-baseline justify-between border-b border-line py-3.5 font-display text-[2rem] leading-none tracking-[-0.02em]"
                    >
                      {item.label}
                      <span aria-hidden className="font-sans text-xs text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="space-y-3 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <ButtonLink href="/shop" size="lg" className="w-full" arrow onClick={() => setMenuOpen(false)}>
              Shop bouquets
            </ButtonLink>
            <p className="text-center text-xs text-muted">
              Grown in {site.location.locality}, {site.location.regionName} · Local pickup
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
