import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Photo } from "@/components/ui/photo";
import { ProductCard } from "@/components/shop/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, CenteredTitle } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { getListedProducts } from "@/server/catalog";
import { getFarmToday } from "@/server/today";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Flower Gifts in the Upper Valley, VT · Fresh Local Bouquets",
  absoluteTitle: true,
  description:
    "Fresh, locally grown flower gifts from Hartland, Vermont: hand-tied bouquets with a free handwritten card, or a flower subscription for someone you love.",
  path: "/gift-flowers",
});

const occasions = [
  { title: "Birthdays", text: "The Harlow Brook Bunch, with a card tucked in.", href: "/shop/harlow-brook-bunch" },
  { title: "Thank you", text: "A Little Posy says it simply and beautifully.", href: "/shop/little-posy" },
  { title: "Dinner with friends", text: "A Garden Bouquet for the host's table.", href: "/shop/garden-bouquet" },
  { title: "Someone far away", text: "A Season of Flowers for a friend in the Upper Valley.", href: "/subscriptions?plan=season-of-flowers#gift" },
  { title: "New neighbors", text: "A small welcome from the garden down the road.", href: "/shop/little-posy" },
  { title: "Just because", text: "The best reason of all.", href: "/shop" },
] as const;

export default async function GiftFlowersPage() {
  const [products, today] = await Promise.all([getListedProducts(), getFarmToday()]);
  const featured = products.filter((p) => p.kind === "subscription").slice(0, 1).concat(products.filter((p) => p.slug === "harlow-brook-bunch"));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gift flowers", path: "/gift-flowers" },
        ])}
      />
      <section className="container-page grid items-end gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Eyebrow>Gift flowers</Eyebrow>
          <h1 className="t-h1 mt-3">The kind of gift people remember.</h1>
          <p className="t-lead mt-6">
            Flowers grown just down the road, picked for the day and given with a handwritten note. Choose a single bouquet
            for a moment, or a season of them for someone you love.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/subscriptions">Give a season of flowers</ButtonLink>
            <ButtonLink href="/shop" variant="secondary">
              Choose a bouquet
            </ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4 lg:col-span-6">
          <Photo src="/images/photos/zinnia-jug.webp" className="col-span-3 aspect-[4/5]" sizes="(max-width:1024px) 55vw, 28vw" priority />
          <Photo src="/images/photos/breakfast-table-flowers.webp" sample={false} className="col-span-2 mt-20 aspect-[3/4]" sizes="(max-width:1024px) 35vw, 18vw" />
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="container-page grid gap-10 py-16 sm:grid-cols-3">
          {[
            ["A handwritten card, free", "Add your message to any bouquet and Sarah writes it on a card tucked inside."],
            ["They can collect it", "Put the recipient's name in the checkout note and they can pick it up in Hartland."],
            ["A gift that keeps arriving", "Subscriptions send monthly bouquets with one payment and a printable gift card."],
          ].map(([t, d]) => (
            <div key={t}>
              <h2 className="t-h3">{t}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <CenteredTitle>For every occasion</CenteredTitle>
        <ul className="mx-auto mt-14 grid max-w-5xl gap-x-12 sm:grid-cols-2">
          {occasions.map((o) => (
            <li key={o.title} className="border-t border-line">
              <Link href={o.href as Route} className="group flex items-baseline justify-between gap-6 py-6">
                <span>
                  <span className="block font-display text-[1.5rem] leading-tight font-medium decoration-1 underline-offset-[0.2em] group-hover:underline">
                    {o.title}
                  </span>
                  <span className="mt-1.5 block text-[0.9375rem] text-ink-soft">{o.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-paper">
        <div className="container-page py-20">
          <h2 className="t-h2 mb-12">Two easy ways to give</h2>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} today={today} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
