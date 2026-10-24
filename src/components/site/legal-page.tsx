import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/typography";
import { IconInfo } from "@/components/ui/icons";

/** Shared frame for draft legal pages, with an unmissable "pending review" notice. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  reviewItems,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  reviewItems: string[];
  children: ReactNode;
}) {
  return (
    <div className="container-page grid gap-12 pt-14 pb-24 sm:pt-20 lg:grid-cols-12">
      <header className="lg:col-span-4">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="t-h1 mt-5 text-[clamp(2.4rem,4.2vw,3.5rem)]">{title}</h1>
        <p className="mt-4 text-sm text-muted">Draft dated {updated}</p>
        <aside className="mt-8 rounded-sm bg-butter/60 p-5 text-sm leading-relaxed" aria-label="Draft notice">
          <p className="flex items-center gap-2 font-semibold">
            <IconInfo size={18} className="text-olive" /> Draft, not yet reviewed
          </p>
          <p className="mt-2 text-ink-soft">
            This is an initial draft prepared for Harlow Brook Flowers. It has not been reviewed by a lawyer and will be
            finalized before online sales open. Items still to confirm:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
            {reviewItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </aside>
      </header>
      <article className="prose-hb text-[1rem] leading-relaxed text-ink-soft lg:col-span-7 lg:col-start-6 [&_h2]:text-ink [&_strong]:text-ink">
        {children}
      </article>
    </div>
  );
}
