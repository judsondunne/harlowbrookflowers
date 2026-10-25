import type { ReactNode } from "react";
import { IconPlus } from "./icons";

/** Native <details> accordion: accessible, works without JavaScript. */
export function AccordionItem({ title, children, defaultOpen }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="font-display font-medium text-[1.25rem] leading-snug">{title}</span>
        <IconPlus size={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-[0.9375rem] leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
