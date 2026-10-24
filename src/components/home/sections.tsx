import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ComponentType } from "react";
import { homeContent } from "@/content/home";
import { asset } from "@/content/asset-manifest";
import type { Product } from "@/domain/catalog";
import { primaryImage } from "@/domain/catalog";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, OrnamentTitle, SampleTag } from "@/components/ui/typography";
import { IconCalendar, IconGift, IconHand, IconScissors, IconSprout } from "@/components/ui/icons";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { ProductCard } from "@/components/shop/product-card";
import { formatPrice } from "@/lib/format";

const featureIcons: Record<string, ComponentType<{ size?: number }>> = {
  sprout: IconSprout,
  scissors: IconScissors,
  hand: IconHand,
  gift: IconGift,
  calendar: IconCalendar,
};

export function FeatureStrip() {
  return (
    <section aria-label="Why Harlow Brook" className="bg-linen">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-5 lg:py-9">
        {homeContent.features.map((f) => {
          const Icon = featureIcons[f.icon];
          return (
            <li key={f.title} className="flex items-start gap-3.5" data-reveal>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-olive">
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-[0.875rem] font-semibold leading-snug">{f.title}</span>
                <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted">{f.text}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ShopSection({ products, today }: { products: Product[]; today: string }) {
  return (
    <section aria-labelledby="shop-title" className="container-page py-20 sm:py-28">
      <div data-reveal>
        <OrnamentTitle id="shop-title">{homeContent.shop.title}</OrnamentTitle>
        <p className="mx-auto mt-5 max-w-xl text-center text-[0.9375rem] leading-relaxed text-ink-soft">{homeContent.shop.intro}</p>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <div key={p.id} data-reveal className={i === 1 ? "lg:translate-y-10" : undefined}>
            <ProductCard product={p} today={today} />
          </div>
        ))}
      </div>
      <p className="mt-20 text-center text-sm text-muted">
        Every bouquet is made from what&apos;s blooming that week. Photos show the style, not the exact flowers.{" "}
        <Link href="/shop" className="font-semibold text-ink underline underline-offset-4">
          See everything in the shop
        </Link>
      </p>
    </section>
  );
}

function Photo({
  src,
  className,
  sizes,
  sample = true,
  priority,
}: {
  src: string;
  className?: string;
  sizes: string;
  sample?: boolean;
  priority?: boolean;
}) {
  const a = asset(src);
  return (
    <div className={`img-well relative overflow-hidden ${className ?? ""}`}>
      <Image src={src} alt={a?.alt ?? ""} fill sizes={sizes} priority={priority} className="object-cover" />
      {sample && a?.provisional && <SampleTag />}
    </div>
  );
}
export { Photo };

export function StorySection() {
  const c = homeContent.story;
  return (
    <section aria-labelledby="story-title" className="container-page grid items-center gap-16 pb-28 sm:pb-36 lg:grid-cols-12 lg:gap-16">
      <div className="relative lg:col-span-7" data-reveal>
        <Photo src="/images/photos/dahlia-bouquet-in-hand.webp" className="aspect-[4/5] w-[82%] sm:w-[78%]" sizes="(max-width: 1024px) 80vw, 50vw" />
        <div className="absolute right-0 -bottom-10 w-[48%] border-[6px] border-cream bg-cream sm:border-8">
          <Photo src="/images/photos/dahlia-rows.webp" sample={false} className="aspect-[4/3]" sizes="(max-width: 1024px) 45vw, 28vw" />
        </div>
      </div>
      <div className="lg:col-span-5" data-reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 id="story-title" className="t-h2 mt-5">
          {c.title}
        </h2>
        <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
          {c.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/our-farm" className="link-rule">
            Visit the farm
          </Link>
          <Link href="/about" className="link-rule">
            Meet Sarah
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SubscriptionBand({ plans }: { plans: Product[] }) {
  const c = homeContent.subscriptions;
  return (
    <section aria-labelledby="subs-title" className="bg-ink text-paper">
      <div className="container-page py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <Eyebrow className="text-butter/80">{c.eyebrow}</Eyebrow>
            <h2 id="subs-title" className="t-h2 mt-5 text-paper">
              {c.title}
            </h2>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-paper/75">{c.body}</p>
            <ButtonLink href="/subscriptions" variant="light" size="lg" className="mt-9" arrow>
              Choose a subscription
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {plans.map((plan) => {
              const img = primaryImage(plan, "cutout");
              return (
                <Link
                  key={plan.id}
                  href={`/subscriptions?plan=${plan.slug}#gift` as Route}
                  data-reveal
                  className="group relative flex flex-col overflow-hidden bg-paper/[0.06] p-6 ring-1 ring-paper/12 transition-colors duration-500 hover:bg-paper/[0.1]"
                >
                  <div className="relative mx-auto aspect-square w-full max-w-[15rem]">
                    <span className="absolute inset-[12%] rounded-full bg-paper/8" />
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="240px"
                        className="object-contain object-bottom transition-transform duration-[1.1s] ease-(--ease-out-quint) group-hover:-translate-y-1.5"
                      />
                    )}
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-paper/15 pt-5">
                    <div>
                      <p className="font-display text-2xl leading-tight">{plan.name}</p>
                      <p className="mt-1 text-sm text-paper/65">
                        {plan.deliveries} monthly bouquets
                        {plan.deliveries ? ` · ${formatPrice(Math.round(plan.priceCents / plan.deliveries))} each` : ""}
                      </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums">{formatPrice(plan.priceCents)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <ol className="mt-20 grid gap-8 border-t border-paper/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => (
            <li key={s.title} data-reveal>
              <p className="font-display text-[1.5rem] leading-tight">
                <span className="mr-2 text-butter/70">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </p>
              <p className="mt-3 text-sm text-paper/65">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PickupSteps({ pickupLocation }: { pickupLocation: string }) {
  const c = homeContent.pickup;
  return (
    <section aria-labelledby="pickup-title" className="container-page py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4" data-reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 id="pickup-title" className="t-h2 mt-5">
            {c.title}
          </h2>
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-soft">
            {pickupLocation}. The exact address and directions come with your confirmation.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/how-it-works" className="link-rule">
              How pickup works
            </Link>
            <Link href="/faq" className="link-rule">
              Questions
            </Link>
          </div>
        </div>
        <ol className="lg:col-span-8">
          {c.steps.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-line py-7 last:border-b sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline"
            >
              <span className="text-[0.8125rem] font-semibold tabular-nums text-olive">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="t-h3">{s.title}</h3>
              <p className="col-start-2 text-[0.9375rem] leading-relaxed text-ink-soft sm:col-start-3">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SeasonBand({ seasonNote }: { seasonNote: string }) {
  const c = homeContent.season;
  return (
    <section aria-labelledby="season-title" className="bg-butter">
      <div className="container-page grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6" data-reveal>
          <Photo src="/images/photos/dahlia-harvest-flatlay.webp" className="aspect-[4/3]" sizes="(max-width: 1024px) 90vw, 45vw" />
        </div>
        <div className="lg:col-span-6" data-reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 id="season-title" className="t-h2 mt-5">
            {c.title}
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{seasonNote}</p>
          <dl className="mt-8">
            {c.months.map((m, i) => (
              <div key={m.label} className="grid grid-cols-[2.5rem_8.5rem_1fr] items-baseline gap-3 border-t border-ink/15 py-3.5 text-sm last:border-b">
                <dt className="contents">
                  <span className="text-xs font-semibold tabular-nums text-olive">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold">{m.label}</span>
                </dt>
                <dd className="text-ink-soft">{m.flowers}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted">A typical Vermont season. What&apos;s in your bouquet depends on the weather and the week.</p>
        </div>
      </div>
    </section>
  );
}

export function AuthorNote() {
  const c = homeContent.author;
  return (
    <section aria-labelledby="author-title" className="container-page grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
      <div className="order-2 lg:order-1 lg:col-span-5 lg:col-start-2" data-reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 id="author-title" className="t-h2 mt-5">
          {c.title}
        </h2>
        <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{c.body}</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/about" className="link-rule">
            Read Sarah&apos;s story
          </Link>
        </div>
      </div>
      <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8" data-reveal>
        <Photo src="/images/photos/flowers-with-open-book.webp" className="aspect-[5/4]" sizes="(max-width: 1024px) 90vw, 40vw" />
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section aria-labelledby="news-title" className="border-t border-line bg-paper">
      <div className="container-page grid items-center gap-8 py-16 lg:grid-cols-2">
        <div>
          <h2 id="news-title" className="t-h3 sm:text-[2rem]">
            Hear when new pickup days open.
          </h2>
          <p className="mt-3 text-[0.9375rem] text-ink-soft">
            A short note from the farm when dates are posted and when the season turns. That&apos;s all.
          </p>
        </div>
        <div className="relative lg:justify-self-end lg:w-full lg:max-w-md">
          <NewsletterForm source="home" />
        </div>
      </div>
    </section>
  );
}
