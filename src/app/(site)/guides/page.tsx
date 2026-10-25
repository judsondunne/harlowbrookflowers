import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Photo } from "@/components/ui/photo";
import { PageIntro } from "@/components/ui/typography";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { guides } from "@/content/guides";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Flower Guides from a Vermont Flower Farm · Harlow Brook Flowers",
  absoluteTitle: true,
  description:
    "Practical guides from a family flower farm in Hartland, Vermont: what blooms when in Vermont, how to keep cut flowers fresh, and where to find local flowers in the Upper Valley.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <PageIntro eyebrow="Guides" title="Notes from a Vermont flower farm">
        <p>Practical, seasonal advice for anyone who loves fresh flowers: what blooms when, how to make them last, and how to find them close to home.</p>
      </PageIntro>
      <RevealGroup as="ul" className="container-page grid gap-x-8 gap-y-16 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <RevealItem as="li" key={g.slug}>
            <article className="group relative">
              <div className="overflow-hidden">
                <Photo
                  src={g.image}
                  className="aspect-[4/3] transition-transform duration-[1.4s] ease-(--ease-out-quint) group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                />
              </div>
              <p className="t-eyebrow mt-5">{g.kicker}</p>
              <h2 className="t-h3 mt-2">
                <Link href={`/guides/${g.slug}` as Route} className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.2em]">
                  {g.title}
                </Link>
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{g.description}</p>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}
