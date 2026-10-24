import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/home/sections";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";
import { IconBook, SprigMark } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Sarah Stewart Taylor · Mystery Novelist & Vermont Flower Grower",
  description:
    "Harlow Brook Flowers is grown by Sarah Stewart Taylor, the mystery novelist behind Agony Hill and the Maggie D'arcy series, on her family's farm in Hartland, Vermont.",
  path: "/about",
});

/*
 * Biographical facts are limited to what Sarah publishes on sarahstewarttaylor.com and the project brief:
 * former journalist and teacher; lives and writes with her family on a Vermont farm where they raise sheep and grow
 * blueberries; author of the Sweeney St. George and Maggie D'arcy series and of Agony Hill and Hunter's Heart Ridge;
 * nominated for the Agatha Award, the Dashiell Hammett Prize and the MWA Sue Grafton Memorial Award;
 * grows and hand-picks cut flowers in her farm garden in Hartland and sells bouquets at farmers markets.
 * No quotations are attributed to Sarah. Add her own words here once she has approved them.
 */
const books = [
  { series: "Historical Vermont mysteries", titles: "Agony Hill · Hunter's Heart Ridge", note: "Set in rural Vermont in the 1960s" },
  { series: "The Maggie D'arcy mysteries", titles: "A Stolen Child · The Mountains Wild · A Distant Grave · The Drowning Sea", note: "Set in Ireland and on Long Island" },
  { series: "The Sweeney St. George series", titles: "Mysteries set in New England", note: "" },
];

export default function AboutPage() {
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
            "@type": "Person",
            name: site.owner,
            jobTitle: "Novelist and flower grower",
            url: site.authorSite,
            worksFor: { "@id": `${site.url}/#business` },
          },
        ]}
      />

      <section className="container-page grid items-end gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Eyebrow>About Harlow Brook</Eyebrow>
          <h1 className="t-h1 mt-5">
            Stories at the desk. <span className="t-accent text-olive">Flowers</span> in the garden.
          </h1>
          <p className="t-lead mt-7 max-w-xl">
            Harlow Brook Flowers is the flower garden of Sarah Stewart Taylor, a novelist who lives and writes with her family
            on a farm in Hartland, Vermont.
          </p>
        </div>
        <div className="lg:col-span-5">
          {/* PLACEHOLDER: replace with an approved portrait of Sarah (e.g. /images/sarah-portrait.webp). Never use a photo of anyone else. */}
          <figure>
            <Photo src="/images/photos/flowers-with-open-book.webp" sample={false} priority className="aspect-[4/5]" sizes="(max-width:1024px) 90vw, 38vw" />
            <figcaption className="mt-3 flex items-center gap-2 text-xs text-muted">
              <SprigMark size={16} className="text-olive" /> Sample photograph. A portrait of Sarah in the garden is coming soon.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="container-page grid gap-12 border-t border-line py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Eyebrow>The grower</Eyebrow>
          <h2 className="t-h2 mt-5">A farm, a family, and a garden full of cut flowers.</h2>
        </div>
        <div className="prose-hb space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft lg:col-span-7 lg:col-start-6">
          <p>
            Sarah and her family live on a farm in Hartland, in Vermont&apos;s Upper Valley, where they raise sheep and grow
            blueberries. Alongside them is a cottage garden of cut flowers that Sarah plants, tends and picks by hand.
          </p>
          <p>
            For a while, the only way to bring those flowers home was to find Sarah&apos;s bouquets at a local farmers
            market. Harlow Brook Flowers is the next step: a way to order ahead, choose a pickup day, and collect your flowers
            at the farm, or to give someone a whole season of them.
          </p>
          <p>
            It is deliberately small. Each bouquet is picked for its pickup day from whatever is blooming, and there are only
            so many to go around each week. That is the point.
          </p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="grid grid-cols-5 gap-4">
              <Photo src="/images/photos/flowers-on-book.webp" className="col-span-3 aspect-[4/5]" sizes="(max-width:1024px) 55vw, 28vw" />
              <Photo src="/images/photos/white-flowers-on-books.webp" sample={false} className="col-span-2 mt-16 aspect-[3/4]" sizes="(max-width:1024px) 35vw, 18vw" />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Eyebrow>The writer</Eyebrow>
            <h2 className="t-h2 mt-5">A mystery novelist with dirt under her nails.</h2>
            <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft">
              <p>
                Sarah is a former journalist and teacher, and the author of several mystery series.
                Her novels have been nominated for the Agatha Award, the Dashiell Hammett Prize and the Mystery Writers of
                America Sue Grafton Memorial Award, and have appeared on many best-of-the-year lists.
              </p>
              <p>
                Her most recent novels, <em>Agony Hill</em> and <em>Hunter&apos;s Heart Ridge</em>, are historical mysteries
                set in rural Vermont in the 1960s.
              </p>
            </div>
            <ul className="mt-8 border-t border-line">
              {books.map((b) => (
                <li key={b.series} className="flex gap-4 border-b border-line py-4">
                  <IconBook size={20} className="mt-0.5 shrink-0 text-olive" />
                  <span>
                    <span className="block font-semibold">{b.series}</span>
                    <span className="block text-sm text-ink-soft">{b.titles}</span>
                    {b.note && <span className="block text-xs text-muted">{b.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={site.authorSite}
              target="_blank"
              rel="noopener"
              className="link-rule mt-8"
            >
              Sarah&apos;s author website
            </a>
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Photo src="/images/photos/dahlia-bouquet-in-hand.webp" className="aspect-[4/5]" sizes="(max-width:1024px) 90vw, 45vw" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Eyebrow>Why flowers</Eyebrow>
          <h2 className="t-h2 mt-5">A little beauty, grown close to home.</h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
            Flowers grown in your own corner of Vermont, picked the week you collect them, are a different thing from flowers
            that have travelled. They are looser, more fragrant, more particular to their week. Harlow Brook exists to share
            that with neighbors across the Upper Valley.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" arrow>
              Shop bouquets
            </ButtonLink>
            <ButtonLink href="/our-farm" variant="secondary">
              About the farm
            </ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">
            Questions for Sarah? <Link href="/contact" className="underline underline-offset-4">Get in touch</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
