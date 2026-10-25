import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleForm } from "@/components/forms/wholesale-form";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal, RevealGroup, RevealImage, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/content/home";
import { wholesaleContent as c } from "@/content/wholesale";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, wholesaleServiceJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { disposableStorage } from "@/server/config";

export const metadata: Metadata = pageMetadata({
  title: "Wholesale Flowers in Vermont · Local Cut Flowers for Shops & Markets",
  absoluteTitle: true,
  description:
    "Locally grown, seasonal cut flowers from Harlow Brook Flowers in Hartland, Vermont, for farm stands, shops, farmers markets, cafés and inns across the Upper Valley. Ask about wrapped bouquets, bunches and bulk stems.",
  path: "/wholesale",
});

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function WholesalePage() {
  return (
    <>
      <JsonLd
        data={[
          wholesaleServiceJsonLd(c.offerings.items.map((o) => o.title)),
          faqJsonLd(c.questions),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Wholesale & markets", path: "/wholesale" },
          ]),
        ]}
      />

      <section className="container-page grid gap-12 pt-12 pb-14 sm:pt-16 lg:grid-cols-12 lg:items-end lg:gap-16 lg:pb-16">
        <div className="lg:col-span-7">
          {/* The kicker is part of the h1 so the page's main heading names what it offers. */}
          <h1>
            <span className="t-eyebrow enter-rise block">{c.hero.eyebrow}</span>
            <span className="t-h1 enter-rise mt-3 block" style={d(80)}>
              {c.hero.title}
            </span>
          </h1>
          <p className="t-lead enter-rise mt-6 max-w-xl" style={d(180)}>
            {c.hero.body}
          </p>
          <div className="enter-rise mt-8 flex flex-wrap items-center gap-x-7 gap-y-3" style={d(260)}>
            <ButtonLink href="/wholesale#inquiry" size="lg">
              Start a wholesale inquiry
            </ButtonLink>
            <Link href="/wholesale#offerings" className="link-rule">
              What we could grow for you
            </Link>
          </div>
        </div>
        <dl className="enter-rise lg:col-span-4 lg:col-start-9" style={d(340)}>
          {c.hero.facts.map(([term, detail]) => (
            <div
              key={term}
              className="flex items-baseline justify-between gap-6 border-t border-line py-3.5 last:border-b"
            >
              <dt className="text-sm text-muted">{term}</dt>
              <dd className="text-right font-display font-medium text-[1.0625rem]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-page">
        <div className="enter-unveil" style={d(300)}>
          <Photo
            src="/images/photos/wrapped-bouquets.webp"
            priority
            className="aspect-[4/3] sm:aspect-[21/9]"
            sizes="100vw"
          />
        </div>
      </div>

      <section
        aria-labelledby="partners-title"
        className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16"
      >
        <Reveal className="lg:col-span-4">
          <h2 id="partners-title" className="t-h2">
            {c.partners.title}
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{c.partners.body}</p>
          <RevealImage className="mt-10 hidden lg:block" delay={0.15}>
            <Photo src="/images/photos/zinnia-jug.webp" className="aspect-[4/5]" sizes="30vw" />
          </RevealImage>
        </Reveal>
        <RevealGroup as="ul" className="grid content-start gap-x-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {c.partners.items.map((p) => (
            <RevealItem as="li" key={p.title} className="border-t border-line py-6">
              <h3 className="t-h3">{p.title}</h3>
              <p className="mt-2.5 text-[0.9688rem] leading-relaxed text-ink-soft">{p.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section aria-labelledby="why-title" className="bg-ink text-paper">
        <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:items-center lg:gap-16">
          <RevealImage className="lg:col-span-6">
            <Photo
              src="/images/photos/dahlia-harvest-flatlay.webp"
              className="aspect-[4/3]"
              sizes="(max-width: 1024px) 90vw, 48vw"
            />
          </RevealImage>
          <Reveal className="lg:col-span-5 lg:col-start-8">
            <Eyebrow className="text-paper/60">{c.why.eyebrow}</Eyebrow>
            <h2 id="why-title" className="t-h2 mt-3 text-paper">
              {c.why.title}
            </h2>
            <RevealGroup as="dl" className="mt-9 border-t border-paper/15">
              {c.why.items.map((w) => (
                <RevealItem key={w.title} className="border-b border-paper/15 py-5">
                  <dt className="font-display font-medium text-[1.3125rem] leading-snug">{w.title}</dt>
                  <dd className="mt-1.5 text-[0.9688rem] leading-relaxed text-paper/70">{w.text}</dd>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>
        </div>
      </section>

      <section id="offerings" aria-labelledby="offerings-title" className="container-page scroll-mt-24 py-20 sm:py-28">
        <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <h2 id="offerings-title" className="t-h2 lg:col-span-6">
            {c.offerings.title}
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-ink-soft lg:col-span-5 lg:col-start-8">
            {c.offerings.note}
          </p>
        </Reveal>
        <RevealGroup as="ul" className="mt-12 border-t border-ink">
          {c.offerings.items.map((o) => (
            <RevealItem
              as="li"
              key={o.title}
              className="grid gap-2 border-b border-line py-6 sm:grid-cols-12 sm:items-baseline sm:gap-8"
            >
              <h3 className="font-display text-[1.5rem] leading-tight font-medium sm:col-span-5">{o.title}</h3>
              <p className="text-[0.9688rem] leading-relaxed text-ink-soft sm:col-span-6 sm:col-start-7">{o.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section aria-labelledby="season-title" className="bg-butter">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <Eyebrow>{c.season.eyebrow}</Eyebrow>
            <h2 id="season-title" className="t-h2 mt-3">
              {c.season.title}
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{c.season.body}</p>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <RevealGroup as="dl">
              {homeContent.season.months.map((m) => (
                <RevealItem
                  key={m.label}
                  className="grid gap-1 border-t border-ink/15 py-5 last:border-b sm:grid-cols-[10rem_1fr]"
                >
                  <dt className="font-display text-xl font-medium">{m.label}</dt>
                  <dd className="text-ink-soft">{m.flowers}</dd>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="t-meta mt-4">
              A typical Vermont season. Sarah will tell you what&apos;s coming before each order.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="buyer-faq"
        className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16"
      >
        <Reveal className="lg:col-span-4">
          <h2 id="buyer-faq" className="t-h2">
            Good questions to ask
          </h2>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">
            The practical answers, as they stand today. Anything else, just ask.
          </p>
        </Reveal>
        <Reveal className="border-t border-line lg:col-span-7 lg:col-start-6" delay={0.1}>
          {c.questions.map((f) => (
            <AccordionItem key={f.q} title={f.q}>
              <p>{f.a}</p>
            </AccordionItem>
          ))}
        </Reveal>
      </section>

      <section id="inquiry" aria-labelledby="inquiry-title" className="scroll-mt-20 border-t border-line bg-paper">
        <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Eyebrow>Wholesale inquiry</Eyebrow>
            <h2 id="inquiry-title" className="t-h2 mt-3">
              {c.inquiry.title}
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{c.inquiry.body}</p>
            <p className="mt-8 text-[0.9375rem] text-ink-soft">
              Prefer email?{" "}
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Wholesale flowers")}`}
                className="text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
              >
                {site.email}
              </a>
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <WholesaleForm previewNotice={disposableStorage()} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
