"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { AnimatePresence, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import * as m from "motion/react-m";
import { EASE } from "@/components/motion/reveal";
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

// The bouquet in view rises into place; the one leaving sinks and tips away.
const slideVariants: Variants = {
  active: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { duration: 1.05, ease: EASE } },
  idle: { opacity: 0, y: 36, scale: 0.93, rotate: -2.5, transition: { duration: 0.55, ease: EASE } },
};

export function Hero({ slides, copy }: { slides: HeroSlide[]; copy: HeroCopy }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));
  const { open, announce } = useCart();
  const swipeStart = useRef<number | null>(null);
  const slide = slides[index];

  // Scroll depth: the wordmark drifts back and fades, the butter circle swells, the bouquet lifts a touch.
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const wordY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 150]);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.85], reduce ? [1, 1] : [1, 0.1]);
  const stageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -50]);
  const circleScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.22]);

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
  const detailHref = (
    slide.kind === "subscription" ? `/subscriptions?plan=${slide.slug}#gift` : `/shop/${slide.slug}`
  ) as Route;

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="hero relative overflow-hidden">
      <div className="container-page hero-grid relative pt-2 pb-14 sm:pt-4 lg:pb-16">
        {/* Wordmark sits behind the bouquet, exactly as in the reference composition. */}
        <m.h1
          id="hero-title"
          className="hero-wordmark relative z-10 text-center text-ink select-none"
          style={{ y: wordY, opacity: wordOpacity }}
        >
          <span className="t-wordmark block whitespace-nowrap max-sm:whitespace-normal">
            <span className="hero-word">Harlow</span>{" "}
            <span className="hero-word max-sm:block" style={{ "--d": "140ms" } as React.CSSProperties}>
              Brook
            </span>
          </span>
          <span className="hero-flowers"> Flowers</span>
        </m.h1>

        <m.div
          className="hero-stage relative z-20"
          style={{ y: stageY }}
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
          <m.div aria-hidden className="hero-circle absolute left-1/2 -translate-x-1/2" style={{ scale: circleScale }}>
            <div className="hero-circle-in h-full w-full rounded-full bg-butter" />
          </m.div>
          <div aria-hidden className="hero-shadow hero-shadow-in absolute left-1/2 -translate-x-1/2" />
          <div className="hero-bouquets absolute inset-0">
            {slides.map((s, i) =>
              mounted.has(i) ? (
                <m.div
                  key={s.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${slides.length}: ${s.name}`}
                  aria-hidden={i !== index}
                  className="absolute inset-0"
                  style={{ transformOrigin: "50% 100%" }}
                  variants={slideVariants}
                  initial={false}
                  animate={i === index ? "active" : "idle"}
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
                </m.div>
              ) : null,
            )}
          </div>
        </m.div>

        <div
          className="hero-copy enter-rise relative z-30 max-md:text-center"
          style={{ "--d": "750ms" } as React.CSSProperties}
        >
          <h2 className="font-display text-[2rem] leading-[1.1] font-medium tracking-[-0.02em] sm:text-[2.375rem]">
            {copy.heading}
          </h2>
          <p className="mt-4 text-[0.9688rem] leading-relaxed text-ink-soft max-md:mx-auto max-md:max-w-[24rem]">
            {copy.body}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 max-md:justify-center">
            <ButtonLink href="/shop">Shop bouquets</ButtonLink>
            <Link href="/subscriptions" className="link-rule">
              Give a season of flowers
            </Link>
          </div>
          <p className="hero-note t-meta mt-6">{copy.note}</p>
        </div>

        <div
          className="hero-caption enter-rise relative z-30 max-md:text-center"
          style={{ "--d": "900ms" } as React.CSSProperties}
          onPointerEnter={loadAll}
          onFocusCapture={loadAll}
        >
          <div className="min-h-[7.5rem]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={slide.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.22 } }}
              >
                <p className="font-display font-medium text-[1.625rem] leading-tight">
                  <Link href={detailHref} className="decoration-1 underline-offset-[0.2em] hover:underline">
                    {slide.name}
                  </Link>
                </p>
                <p className="t-meta mt-1.5">
                  {slide.sizeLabel} <span aria-hidden>·</span>{" "}
                  <span className="text-ink tabular-nums">{formatPrice(slide.priceCents)}</span>
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
              </m.div>
            </AnimatePresence>
          </div>

          <ul
            className="mt-7 flex items-end gap-2 border-t border-line pt-4 max-md:justify-center"
            aria-label="Choose a bouquet"
          >
            {slides.map((s, i) => (
              <li key={s.id}>
                <m.button
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  onClick={() => show(i)}
                  aria-pressed={i === index}
                  aria-label={`Show ${s.name}`}
                  className={cn(
                    "group relative block h-[3.75rem] w-12 transition-opacity duration-500",
                    i === index ? "opacity-100" : "opacity-45 hover:opacity-90",
                  )}
                >
                  <Image
                    src={s.image.src}
                    alt=""
                    fill
                    sizes="48px"
                    quality={60}
                    className="object-contain object-bottom"
                    draggable={false}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-1.5 -bottom-2 h-px bg-ink transition-transform duration-500 ease-(--ease-out-quint)",
                      i === index ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </m.button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
