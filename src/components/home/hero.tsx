"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/format";

export type HeroSlide = {
  id: string;
  slug: string;
  kind: "bouquet" | "subscription";
  name: string;
  tagline: string;
  sizeLabel: string;
  priceCents: number;
  purchasable: boolean;
  image: { src: string; alt: string; width: number; height: number };
};

type HeroCopy = { heading: string; body: string; note: string };

export function Hero({ slides, copy }: { slides: HeroSlide[]; copy: HeroCopy }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));
  const { open, announce } = useCart();
  const swipeStart = useRef<number | null>(null);
  const slide = slides[index];

  // Load the other bouquets well after the first paint (or as soon as someone reaches for them),
  // so they never compete with the hero image on a slow connection.
  const loadAll = () => setMounted((m) => (m.size === slides.length ? m : new Set(slides.map((_, i) => i))));
  useEffect(() => {
    let timer = 0;
    const schedule = () => (timer = window.setTimeout(() => setMounted(new Set(slides.map((_, i) => i))), 2500));
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
    };
  }, [slides]);

  const show = (next: number) => {
    const i = (next + slides.length) % slides.length;
    setMounted((m) => new Set(m).add(i));
    setIndex(i);
  };

  const add = () => {
    cartStore.add({ productId: slide.id, quantity: 1 });
    announce(`${slide.name} added to your cart.`);
    open();
  };

  if (!slide) return null;
  const detailHref = (slide.kind === "subscription" ? `/subscriptions?plan=${slide.slug}#gift` : `/shop/${slide.slug}`) as Route;

  return (
    <section aria-labelledby="hero-title" className="hero relative overflow-hidden">
      <div className="container-page hero-grid relative pt-2 pb-14 sm:pt-4 lg:pb-16">
        {/* Wordmark sits behind the bouquet, exactly as in the reference composition. */}
        <h1 id="hero-title" className="hero-wordmark relative z-10 text-center text-ink select-none">
          <span className="t-wordmark block whitespace-nowrap max-sm:whitespace-normal">
            Harlow <span className="max-sm:block">Brook</span>
          </span>
          <span className="hero-flowers font-accent italic tracking-[-0.01em]">Flowers</span>
        </h1>

        <div
          className="hero-stage relative z-20"
          aria-roledescription="carousel"
          aria-label="Bouquets from the garden"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") swipeStart.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeStart.current === null) return;
            const dx = e.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
          }}
        >
          <div aria-hidden className="hero-circle absolute left-1/2 -translate-x-1/2 rounded-full bg-butter" />
          <div aria-hidden className="hero-shadow absolute left-1/2 -translate-x-1/2" />
          {slides.map((s, i) =>
            mounted.has(i) ? (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}: ${s.name}`}
                aria-hidden={i !== index}
                className={cn("hero-slide absolute inset-0", i === index && "is-active")}
              >
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  width={s.image.width}
                  height={s.image.height}
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  quality={75}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 60vw, 520px"
                  className="h-full w-full object-contain object-bottom"
                  draggable={false}
                />
              </div>
            ) : null,
          )}
        </div>

        <div className="hero-copy relative z-30 max-md:text-center">
          <h2 className="font-display text-[2rem] leading-[1.1] font-light tracking-[-0.015em] sm:text-[2.375rem]">{copy.heading}</h2>
          <p className="mt-4 text-[0.9688rem] leading-relaxed text-ink-soft max-md:mx-auto max-md:max-w-[24rem]">{copy.body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 max-md:justify-center">
            <ButtonLink href="/shop">Shop bouquets</ButtonLink>
            <Link href="/subscriptions" className="link-rule">
              Give a season of flowers
            </Link>
          </div>
          <p className="hero-note t-meta mt-6">{copy.note}</p>
        </div>

        <div className="hero-caption relative z-30 max-md:text-center" onPointerEnter={loadAll} onFocusCapture={loadAll}>
          <div className="min-h-[7.5rem]" aria-live="polite">
            <p className="font-display text-[1.625rem] leading-tight">
              <Link href={detailHref} className="decoration-1 underline-offset-[0.2em] hover:underline">
                {slide.name}
              </Link>
            </p>
            <p className="t-meta mt-1.5">
              {slide.sizeLabel} <span aria-hidden>·</span> <span className="text-ink tabular-nums">{formatPrice(slide.priceCents)}</span>
            </p>
            <div className="mt-4">
              {slide.kind === "bouquet" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={add}
                  disabled={!slide.purchasable}
                  aria-label={`Add ${slide.name} to cart, ${formatPrice(slide.priceCents)}`}
                >
                  {slide.purchasable ? "Add to cart" : "Sold out"}
                </Button>
              ) : (
                <ButtonLink href={detailHref} variant="secondary" size="sm">
                  Give this gift
                </ButtonLink>
              )}
            </div>
          </div>

          <ul className="mt-7 flex items-end gap-2 border-t border-line pt-4 max-md:justify-center" aria-label="Choose a bouquet">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => show(i)}
                  aria-pressed={i === index}
                  aria-label={`Show ${s.name}`}
                  className={cn(
                    "group relative block h-[3.75rem] w-12 transition-opacity duration-500",
                    i === index ? "opacity-100" : "opacity-45 hover:opacity-90",
                  )}
                >
                  <Image src={s.image.src} alt="" fill sizes="48px" quality={60} className="object-contain object-bottom" draggable={false} />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-1.5 -bottom-2 h-px bg-ink transition-transform duration-500 ease-(--ease-out-quint)",
                      i === index ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
