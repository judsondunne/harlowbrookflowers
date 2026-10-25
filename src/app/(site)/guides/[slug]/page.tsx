import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { guideBySlug, guides, type GuideBlock } from "@/content/guides";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return { title: "Guide not found" };
  return pageMetadata({ title: guide.metaTitle, absoluteTitle: true, description: guide.description, path: `/guides/${guide.slug}` });
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export default function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  // Params stay inside Suspense so navigating between guides is instant (Cache Components).
  return (
    <Suspense fallback={<div className="container-page h-[80vh]" aria-hidden />}>
      <GuideContent params={params} />
    </Suspense>
  );
}

async function GuideContent({ params }: { params: PageProps<"/guides/[slug]">["params"] }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const others = guides.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({ title: guide.metaTitle, description: guide.description, path, image: guide.image, published: guide.published, modified: guide.modified }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path },
          ]),
        ]}
      />

      <article>
        <header className="container-page max-w-4xl pt-10 pb-12 text-center sm:pt-14">
          <nav aria-label="Breadcrumb" className="enter-rise text-[0.8125rem] text-muted">
            <Link href="/guides" className="hover:text-ink">
              Guides
            </Link>{" "}
            <span aria-hidden>/</span> {guide.kicker}
          </nav>
          <h1 className="t-h1 enter-rise mt-5" style={d(80)}>
            {guide.title}
          </h1>
          <p className="t-lead enter-rise mx-auto mt-6 max-w-2xl" style={d(180)}>
            {guide.intro}
          </p>
          <p className="t-meta enter-rise mt-5" style={d(240)}>
            Harlow Brook Flowers, Hartland, Vermont · Updated {formatDate(guide.modified)}
          </p>
        </header>

        <div className="container-page">
          <div className="enter-unveil" style={d(260)}>
            <Photo src={guide.image} priority className="aspect-[16/9] sm:aspect-[21/9]" sizes="100vw" />
          </div>
        </div>

        <div className="container-page max-w-[44rem] py-16 sm:py-20">
          {guide.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </article>

      <section aria-labelledby="more-guides" className="border-t border-line bg-paper">
        <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Eyebrow>Keep reading</Eyebrow>
            <h2 id="more-guides" className="t-h2 mt-3">
              More from the farm
            </h2>
          </Reveal>
          <ul className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            {others.map((g) => (
              <li key={g.slug} className="border-t border-ink pt-5">
                <p className="t-eyebrow">{g.kicker}</p>
                <Link href={`/guides/${g.slug}` as Route} className="mt-2 block font-display text-[1.375rem] leading-snug font-medium hover:underline hover:decoration-1 hover:underline-offset-[0.2em]">
                  {g.title}
                </Link>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{g.description}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 lg:col-span-8 lg:col-start-5">
            <ButtonLink href="/shop">Shop bouquets</ButtonLink>
            <Link href="/subscriptions" className="link-rule">
              Give a season of flowers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="t-h3 mt-12 mb-4 first:mt-0 sm:text-[1.875rem]">{block.text}</h2>;
    case "p":
      return <p className="mt-4 font-display text-[1.1875rem] leading-[1.7] text-ink-soft">{block.text}</p>;
    case "list":
      return (
        <ul className="prose-hb mt-4 font-display text-[1.125rem] leading-[1.65] text-ink-soft">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <figure className="mt-6">
          <dl className="border-t border-ink">
            {block.rows.map(([term, detail]) => (
              <div key={term} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-display text-[1.1875rem] font-medium">{term}</dt>
                <dd className="text-[0.9688rem] leading-relaxed text-ink-soft">{detail}</dd>
              </div>
            ))}
          </dl>
          <figcaption className="t-meta mt-3">{block.caption}</figcaption>
        </figure>
      );
    case "links":
      return (
        <ul className="mt-6 border-t border-line">
          {block.items.map((l) => (
            <li key={l.href} className="border-b border-line">
              <Link href={l.href as Route} className="group flex items-baseline justify-between gap-6 py-4">
                <span>
                  <span className="block font-display text-[1.1875rem] font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.2em]">
                    {l.label}
                  </span>
                  <span className="mt-0.5 block text-[0.9375rem] text-ink-soft">{l.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      );
  }
}
