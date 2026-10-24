import Link from "next/link";
import type { Route } from "next";
import { homeContent } from "@/content/home";
import type { Product } from "@/domain/catalog";
import { DEFAULT_SETTINGS } from "@/domain/settings";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { CenteredTitle, Eyebrow } from "@/components/ui/typography";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { ProductCard } from "@/components/shop/product-card";
import { formatPrice } from "@/lib/format";

export function ShopSection({ products, today }: { products: Product[]; today: string }) {
  return (
    <section aria-labelledby="shop-title" className="container-page py-20 sm:py-28">
      <div data-reveal>
        <CenteredTitle id="shop-title">{homeContent.shop.title}</CenteredTitle>
        <p className="mx-auto mt-5 max-w-xl text-center text-[0.9688rem] leading-relaxed text-ink-soft">{homeContent.shop.intro}</p>
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
        <Link href="/shop" className="font-medium text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
          See everything in the shop
        </Link>
      </p>
    </section>
  );
}

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
      <div className="lg:col-span-5 lg:pl-4" data-reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 id="story-title" className="t-h2 mt-3">
          {c.title}
        </h2>
        <div className="mt-7 space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
          {c.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8">
          <Link href="/about" className="link-rule">
            Our story
          </Link>
          <Link href="/how-it-works" className="link-rule">
            How pickup works
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Gift subscriptions, told as a gift rather than a process: who it's for, what it costs, one clear way in. */
export function SubscriptionBand({ plans }: { plans: Product[] }) {
  const c = homeContent.subscriptions;
  return (
    <section aria-labelledby="subs-title" className="bg-ink text-paper">
      <div className="container-page grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5" data-reveal>
          <Photo src="/images/photos/breakfast-table-flowers.webp" className="aspect-[4/5]" sizes="(max-width: 1024px) 90vw, 40vw" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7" data-reveal>
          <Eyebrow className="text-butter/80">{c.eyebrow}</Eyebrow>
          <h2 id="subs-title" className="t-h2 mt-3 text-paper">
            {c.title}
          </h2>
          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-paper/75">{c.body}</p>

          <ul className="mt-9 space-y-2 font-display text-[1.3125rem] leading-snug font-light text-paper/90 italic sm:text-[1.4375rem]">
            {c.forWhom.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <ul className="mt-10 border-t border-paper/15">
            {plans.map((plan) => (
              <li key={plan.id} className="border-b border-paper/15">
                <Link
                  href={`/subscriptions?plan=${plan.slug}#gift` as Route}
                  className="group flex items-baseline justify-between gap-6 py-4"
                >
                  <span>
                    <span className="block font-display text-[1.375rem] leading-tight decoration-1 underline-offset-[0.2em] group-hover:underline">
                      {plan.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-paper/60">
                      {plan.deliveries} monthly Garden Bouquets
                      {plan.deliveries ? `, ${formatPrice(Math.round(plan.priceCents / plan.deliveries))} each` : ""}
                    </span>
                  </span>
                  <span className="text-[1.0625rem] tabular-nums">{formatPrice(plan.priceCents)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <ButtonLink href="/subscriptions" variant="light" size="lg">
              Give a flower subscription
            </ButtonLink>
            <p className="text-sm text-paper/60">{c.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The season in four photographs: what the garden gives, month by month. */
export function SeasonSection({ seasonNote }: { seasonNote: string }) {
  const c = homeContent.season;
  return (
    <section aria-labelledby="season-title" className="overflow-hidden py-20 sm:py-28">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16" data-reveal>
          <div className="lg:col-span-6">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2 id="season-title" className="t-h2 mt-3 max-w-xl">
              {c.title}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            {/* Sarah's own season note (admin settings) replaces the default copy once she writes one. */}
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              {seasonNote && seasonNote !== DEFAULT_SETTINGS.seasonNote ? seasonNote : c.body}
            </p>
          </div>
        </div>

        <ol className="season-strip mt-14 sm:mt-16" aria-label="The Vermont flower season">
          {c.months.map((m) => (
            <li key={m.label}>
              <figure>
                <Photo src={m.image} className="aspect-[3/4]" sizes="(max-width: 768px) 72vw, 24vw" />
                <figcaption className="mt-4 pr-2">
                  <span className="block font-display text-[1.375rem] leading-tight italic">{m.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{m.flowers}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
        <p className="t-meta mt-10 sm:mt-14">{c.footnote}</p>
      </div>
    </section>
  );
}

/** A modest invitation for businesses, kept below the retail story so it never competes with it. */
export function WholesaleBand() {
  const c = homeContent.wholesale;
  return (
    <section aria-labelledby="wholesale-title" className="bg-linen">
      <div className="container-page grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7" data-reveal>
          <Photo src="/images/photos/buckets-of-flowers.webp" className="aspect-[4/3]" sizes="(max-width: 1024px) 90vw, 55vw" />
        </div>
        <div className="lg:col-span-5" data-reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 id="wholesale-title" className="t-h2 mt-3">
            {c.title}
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{c.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <ButtonLink href="/wholesale" variant="secondary">
              Wholesale &amp; markets
            </ButtonLink>
            <Link href="/wholesale#inquiry" className="link-rule">
              Start an inquiry
            </Link>
          </div>
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
        <h2 id="author-title" className="t-h2 mt-3">
          {c.title}
        </h2>
        <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-soft">
          {c.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8">
          <Link href="/about" className="link-rule">
            Read Sarah&apos;s story
          </Link>
        </div>
      </div>
      <figure className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8" data-reveal>
        <Photo src="/images/photos/sarah-stewart-taylor.webp" className="aspect-[4/5]" sizes="(max-width: 1024px) 90vw, 40vw" />
        <figcaption className="t-meta mt-3">{c.caption}</figcaption>
      </figure>
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
        <div className="relative lg:w-full lg:max-w-md lg:justify-self-end">
          <NewsletterForm source="home" />
        </div>
      </div>
    </section>
  );
}
