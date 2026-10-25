import type { Metadata } from "next";
import Link from "next/link";
import { AccordionItem } from "@/components/ui/accordion";
import { PageIntro } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { faqGroups } from "@/content/faq";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Flower Pickup & Bouquet Questions · Harlow Brook Flowers",
  absoluteTitle: true,
  description:
    "Answers about local flower pickup in Hartland, VT, what's in each seasonal bouquet, gift subscriptions, changes, cancellations and payment.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(faqGroups.flatMap((g) => g.items)),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
      <PageIntro eyebrow="Questions" title="Good questions, honest answers.">
        <p>
          Everything about pickup, the flowers themselves, gifts and orders. Can&apos;t find what you need?{" "}
          <Link href="/contact" className="text-ink underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
            Ask Sarah
          </Link>
          .
        </p>
      </PageIntro>

      <div className="container-page grid gap-12 pb-24 lg:grid-cols-12">
        <nav aria-label="FAQ sections" className="lg:col-span-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:flex-col lg:gap-0 lg:border-l lg:border-line">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="link-rule lg:-ml-px lg:min-h-0 lg:border-l lg:border-transparent lg:px-5 lg:py-2 lg:no-underline lg:hover:border-ink"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16 lg:col-span-8 lg:col-start-5">
          {faqGroups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-28">
              <h2 id={`${g.id}-h`} className="t-h3 mb-4">
                {g.title}
              </h2>
              <div className="border-t border-line">
                {g.items.map((f) => (
                  <AccordionItem key={f.q} title={f.q}>
                    <p>{f.a}</p>
                  </AccordionItem>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
