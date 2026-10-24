import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Eyebrow } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/content/home";
import { getSettings } from "@/server/settings";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { DEFAULT_SETTINGS } from "@/domain/settings";

export const metadata: Metadata = pageMetadata({
  title: "About Harlow Brook Flowers · A Family Flower Farm in Hartland, VT",
  absoluteTitle: true,
  description:
    "Harlow Brook Flowers is a small family flower farm in Hartland, Vermont, grown by mystery novelist Sarah Stewart Taylor. How we grow, the Vermont season, and visiting on a pickup day.",
  path: "/about",
});

/*
 * Biographical facts are limited to what Sarah publishes on sarahstewarttaylor.com and the project brief:
 * former journalist and teacher; lives and writes with her family on a Vermont farm where they raise sheep and grow
 * blueberries; author of the Sweeney St. George and Maggie D'arcy series and of Agony Hill and Hunter's Heart Ridge;
 * nominated for the Agatha Award, the Dashiell Hammett Prize and the MWA Sue Grafton Memorial Award;
 * grows and hand-picks cut flowers in her farm garden in Hartland and sells bouquets at farmers markets.
 * No quotations are attributed to Sarah. Add her own words here once she has approved them.
 * The farm sections (formerly /our-farm, which now redirects here) are PROVISIONAL until Sarah confirms them.
 */
const books = [
  { series: "Historical Vermont mysteries", titles: "Agony Hill, Hunter's Heart Ridge", note: "Set in rural Vermont in the 1960s" },
  { series: "The Maggie D'arcy mysteries", titles: "A Stolen Child, The Mountains Wild, A Distant Grave, The Drowning Sea", note: "Set in Ireland and on Long Island" },
  { series: "The Sweeney St. George series", titles: "Mysteries set in New England", note: "" },
];

const principles = [
  ["Grown outdoors", "The flowers grow in the open garden, with the Vermont weather, so the season sets the pace."],
  ["Picked by hand", "Sarah cuts the stems herself for each pickup day, choosing what is at its best that week."],
  ["Never shipped", "Bouquets go straight from the garden to you, collected at the farm rather than boxed and trucked."],
  ["Limited by design", "Each pickup day has a set number of bouquets. When they're gone, they're gone until the next."],
] as const;

export default async function AboutPage() {
  const settings = await getSettings();
  const seasonNote = settings.seasonNote || DEFAULT_SETTINGS.seasonNote;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Harlow Brook Flowers",
            url: `${site.url}/about`,
            about: { "@id": `${site.url}/#business` },
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: site.owner,
            jobTitle: "Novelist and flower grower",
            url: site.authorSite,
            image: `${site.url}/images/photos/sarah-stewart-taylor.webp`,
            worksFor: { "@id": `${site.url}/#business` },
          },
        ]}
      />

      <section className="container-page grid gap-12 pt-12 pb-20 sm:pt-16 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-6">
          <Eyebrow>About Harlow Brook</Eyebrow>
          <h1 className="t-h1 mt-3">Stories at the desk, flowers in the garden.</h1>
          <p className="t-lead mt-7 max-w-xl">
            Harlow Brook Flowers is the cut-flower garden of Sarah Stewart Taylor, a mystery novelist who lives and writes
            with her family on a farm in Hartland, in Vermont&apos;s Upper Valley.
          </p>
        </div>
        <figure className="lg:col-span-5 lg:col-start-8">
          <Photo src="/images/photos/sarah-stewart-taylor.webp" priority className="aspect-[4/5]" sizes="(max-width:1024px) 90vw, 38vw" />
          <figcaption className="t-meta mt-3">{homeContent.author.caption}</figcaption>
        </figure>
      </section>

      <section aria-labelledby="farm-title" className="container-page grid gap-12 border-t border-line py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Eyebrow>The farm</Eyebrow>
          <h2 id="farm-title" className="t-h2 mt-3">
            A family farm, and a garden full of cut flowers.
          </h2>
        </div>
        <div className="space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft lg:col-span-6 lg:col-start-7">
          <p>
            The farm sits in Hartland, a small town on the Connecticut River in Vermont&apos;s Upper Valley. Sarah and her family
            raise sheep and grow blueberries here, and alongside them is a cottage garden of cut flowers that Sarah plants,
            tends and picks by hand.
          </p>
          <p>
            For a while, the only way to bring those flowers home was to find Sarah&apos;s bouquets at a local farmers market.
            Harlow Brook Flowers is the next step: a way to order ahead, choose a pickup day and collect your flowers at the
            farm, or to give someone a whole season of them.
          </p>
          <p>
            It is deliberately small. Each bouquet is picked for its pickup day from whatever is blooming, and there are only
            so many to go around each week. That is the point.
          </p>
        </div>
      </section>

      <div className="container-page">
        <Photo src="/images/photos/dahlia-rows.webp" className="aspect-[16/10] sm:aspect-[21/9]" sizes="100vw" />
      </div>

      <section aria-labelledby="grow-title" className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Eyebrow>How we grow</Eyebrow>
          <h2 id="grow-title" className="t-h2 mt-3">
            Small on purpose.
          </h2>
        </div>
        <dl className="grid gap-x-12 sm:grid-cols-2 lg:col-span-8">
          {principles.map(([t, d]) => (
            <div key={t} className="border-t border-line py-6">
              <dt className="t-h3">{t}</dt>
              <dd className="mt-3 text-[0.9688rem] leading-relaxed text-ink-soft">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="In the garden" className="container-page grid grid-cols-12 gap-3 pb-20 sm:gap-6 sm:pb-28">
        <Photo src="/images/photos/dahlia-basket.webp" className="col-span-7 aspect-[4/5]" sizes="55vw" />
        <div className="col-span-5 flex flex-col gap-3 sm:gap-6">
          <Photo src="/images/photos/zinnias-in-hand.webp" sample={false} className="aspect-square" sizes="40vw" />
          <Photo src="/images/photos/buckets-of-flowers.webp" sample={false} className="aspect-[4/3]" sizes="40vw" />
        </div>
      </section>

      <section aria-labelledby="season-title" className="bg-butter">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>The season</Eyebrow>
            <h2 id="season-title" className="t-h2 mt-3">
              Early summer to the first hard frost.
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{seasonNote}</p>
          </div>
          <dl className="lg:col-span-6 lg:col-start-7">
            {homeContent.season.months.map((m) => (
              <div key={m.label} className="grid gap-1 border-t border-ink/15 py-5 last:border-b sm:grid-cols-[10rem_1fr]">
                <dt className="font-display text-xl italic">{m.label}</dt>
                <dd className="text-ink-soft">{m.flowers}</dd>
              </div>
            ))}
            <p className="t-meta mt-4">A typical Vermont season; every year is a little different.</p>
          </dl>
        </div>
      </section>

      <section aria-labelledby="writer-title" className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="grid grid-cols-5 gap-4">
            <Photo src="/images/photos/flowers-on-book.webp" className="col-span-3 aspect-[4/5]" sizes="(max-width:1024px) 55vw, 28vw" />
            <Photo src="/images/photos/white-flowers-on-books.webp" sample={false} className="col-span-2 mt-16 aspect-[3/4]" sizes="(max-width:1024px) 35vw, 18vw" />
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Eyebrow>The writer</Eyebrow>
          <h2 id="writer-title" className="t-h2 mt-3">
            A mystery novelist with dirt under her nails.
          </h2>
          <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft">
            <p>
              Sarah is a former journalist and teacher, and the author of several mystery series. Her novels have been
              nominated for the Agatha Award, the Dashiell Hammett Prize and the Mystery Writers of America Sue Grafton
              Memorial Award, and have appeared on many best-of-the-year lists.
            </p>
            <p>
              Her most recent novels, <em>Agony Hill</em> and <em>Hunter&apos;s Heart Ridge</em>, are historical mysteries set
              in rural Vermont in the 1960s.
            </p>
          </div>
          <ul className="mt-8 border-t border-line">
            {books.map((b) => (
              <li key={b.series} className="border-b border-line py-4">
                <span className="block font-display text-[1.1875rem]">{b.series}</span>
                <span className="mt-0.5 block text-sm text-ink-soft italic">{b.titles}</span>
                {b.note && <span className="block text-[0.8125rem] text-muted">{b.note}</span>}
              </li>
            ))}
          </ul>
          <a href={site.authorSite} target="_blank" rel="noopener" className="link-rule mt-6">
            Sarah&apos;s author website
          </a>
        </div>
      </section>

      <section aria-labelledby="visit-title" className="border-t border-line bg-paper">
        <div className="container-page grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Photo src="/images/photos/mountain-valley.webp" className="aspect-[4/3]" sizes="(max-width:1024px) 90vw, 45vw" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Eyebrow>Visiting</Eyebrow>
            <h2 id="visit-title" className="t-h2 mt-3">
              Come by on a pickup day.
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
              The farm is a family home, so it isn&apos;t open for drop-in visits. Instead, every order comes with a pickup
              time: stop by, give your name, and take your flowers home. Directions arrive with your confirmation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <ButtonLink href="/shop">Shop bouquets</ButtonLink>
              <Link href="/how-it-works" className="link-rule">
                How pickup works
              </Link>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Serving neighbors across the Upper Valley, including Windsor, Woodstock, Quechee, White River Junction and
              Hanover, with pickup in Hartland. Run a shop, café or market stall?{" "}
              <Link href="/wholesale" className="text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
                See wholesale &amp; markets
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
