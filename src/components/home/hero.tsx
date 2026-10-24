"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/components/cart/cart-store";
import { IconArrowLeft, IconArrowRight, IconPin } from "@/components/ui/icons";
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

const pad = (n: number) => String(n).padStart(2, "0");

export function Hero({ slides, copy }: { slides: HeroSlide[]; copy: { heading: string; body: string; trust: string } }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));
  const { open, announce } = useCart();
  const slide = slides[index];

  // Load the other bouquets well after the first paint (or as soon as someone reaches for the controls),
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

  const go = (delta: number) => {
    const next = (index + delta + slides.length) % slides.length;
    setMounted((m) => new Set(m).add(next));
    setIndex(next);
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
      <div className="container-page hero-grid relative pt-4 pb-12 sm:pt-6 lg:pb-16">
        {/* Wordmark sits behind the bouquet, exactly as in the reference composition. */}
        <h1 id="hero-title" className="hero-wordmark relative z-10 text-center text-ink select-none">
          <span className="t-wordmark block whitespace-nowrap max-sm:whitespace-normal">
            Harlow <span className="max-sm:block">Brook</span>
          </span>
          <span className="hero-flowers t-accent block">Flowers</span>
        </h1>

        <div className="hero-stage relative z-20" aria-roledescription="carousel" aria-label="Featured flowers">
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
                />
              </div>
            ) : null,
          )}
        </div>

        <div className="hero-copy relative z-30">
          <h2 className="font-display text-[1.75rem] leading-[1.12] tracking-[-0.015em] sm:text-[2rem]">{copy.heading}</h2>
          <p className="mt-3 max-w-[26rem] text-[0.9375rem] leading-relaxed text-ink-soft">{copy.body}</p>
          <p className="mt-4 flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-olive uppercase">
            <IconPin size={15} /> {copy.trust}
          </p>

          <div className="mt-7 border-t border-line pt-5" aria-live="polite">
            <p className="t-eyebrow">
              {pad(index + 1)} · {slide.kind === "subscription" ? "Gift subscription" : "Bouquet"}
            </p>
            <p className="mt-1.5 font-display text-[1.35rem] leading-tight">
              <Link href={detailHref} className="hover:underline hover:underline-offset-4">
                {slide.name}
              </Link>
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-muted">{slide.sizeLabel}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            {slide.kind === "bouquet" ? (
              <button
                type="button"
                onClick={add}
                disabled={!slide.purchasable}
                className="group inline-flex items-center gap-3 rounded-full disabled:opacity-50"
                aria-label={`Add ${slide.name} to cart, ${formatPrice(slide.priceCents)}`}
              >
                <span className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper tabular-nums transition-colors group-hover:bg-ink-soft">
                  {formatPrice(slide.priceCents)}
                </span>
                <span className="text-sm font-semibold">{slide.purchasable ? "Add to cart" : "Sold out"}</span>
                <span className="grid size-11 place-items-center rounded-full border border-ink/70 transition-[background-color,color,transform] duration-500 ease-(--ease-out-quint) group-hover:translate-x-1 group-hover:bg-ink group-hover:text-paper">
                  <IconArrowRight size={18} />
                </span>
              </button>
            ) : (
              <Link href={detailHref} className="group inline-flex items-center gap-3">
                <span className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper tabular-nums transition-colors group-hover:bg-ink-soft">
                  {formatPrice(slide.priceCents)}
                </span>
                <span className="text-sm font-semibold">Give this gift</span>
                <span className="grid size-11 place-items-center rounded-full border border-ink/70 transition-[background-color,color,transform] duration-500 ease-(--ease-out-quint) group-hover:translate-x-1 group-hover:bg-ink group-hover:text-paper">
                  <IconArrowRight size={18} />
                </span>
              </Link>
            )}
          </div>
        </div>

        <div className="hero-controls relative z-30 flex items-center gap-3" onPointerEnter={loadAll} onFocusCapture={loadAll}>
          <button
            type="button"
            onClick={() => go(-1)}
            className="grid size-11 place-items-center rounded-full border border-ink/30 text-ink transition-colors hover:border-ink hover:bg-paper"
            aria-label="Previous flowers"
          >
            <IconArrowLeft size={18} />
          </button>
          <p className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">
            <span className="text-ink">{pad(index + 1)}</span>
            <span className="text-muted">/{pad(slides.length)}</span>
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            className="grid size-11 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-ink-soft"
            aria-label="Next flowers"
          >
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
