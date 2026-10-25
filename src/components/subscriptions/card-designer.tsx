"use client";

import type { ComponentProps } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { EASE } from "@/components/motion/reveal";
import { TextArea } from "@/components/ui/field";
import { CARD_STYLES, MESSAGE_STARTERS, cardStyles, type CardStyle } from "@/domain/gift-card";
import { cn } from "@/lib/format";
import { GiftCardFace } from "./gift-card";

const swatch: Record<CardStyle, { card: string; rule: string; ink: string }> = {
  letterpress: { card: "bg-paper", rule: "border-line-strong", ink: "bg-ink/70" },
  garden: { card: "bg-paper", rule: "border-line-strong", ink: "bg-ink/70" },
  evening: { card: "bg-ink", rule: "border-paper/25", ink: "bg-paper/80" },
  buttercup: { card: "bg-butter", rule: "border-ink/20", ink: "bg-ink/70" },
};

/** Four card designs as small swatches: a radio group, so arrow keys move between them. */
export function DesignPicker({ name, value, onChange }: { name: string; value: CardStyle; onChange: (v: CardStyle) => void }) {
  return (
    <div role="radiogroup" aria-label="Card design" className="grid grid-cols-4 gap-3 sm:gap-4">
      {CARD_STYLES.map((style) => {
        const s = swatch[style];
        const selected = value === style;
        return (
          <label key={style} className="group cursor-pointer text-center">
            <input
              type="radio"
              name={name}
              value={style}
              checked={selected}
              onChange={() => onChange(style)}
              className="peer sr-only"
            />
            <m.span
              aria-hidden
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={cn(
                "relative mx-auto flex aspect-[4/5] w-full max-w-[5.5rem] flex-col items-center justify-center gap-1.5 shadow-[0_10px_22px_-16px_rgba(42,34,29,0.5)] outline-offset-4 transition-[outline-color] peer-focus-visible:outline-[1.5px] peer-focus-visible:outline-ink",
                s.card,
                selected ? "outline-[1.5px] outline-ink" : "outline-[1.5px] outline-transparent",
              )}
            >
              <span className={cn("absolute inset-1 border", s.rule)} />
              {style === "garden" && <span className="mb-0.5 size-5 rounded-full bg-butter" />}
              <span className={cn("h-[3px] w-7 rounded-full", s.ink)} />
              <span className={cn("h-[2px] w-10 rounded-full opacity-50", s.ink)} />
              <span className={cn("h-[2px] w-8 rounded-full opacity-50", s.ink)} />
            </m.span>
            <span className={cn("mt-2 block text-[0.8125rem]", selected ? "font-medium text-ink" : "text-muted")}>
              {cardStyles[style].name}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** The message box, with a few first lines to borrow. */
export function MessageField({
  id,
  value,
  onChange,
  onBlur,
  max = 500,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  max?: number;
}) {
  return (
    <div>
      <TextArea
        id={id}
        label="Message"
        optional
        rows={4}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Write it the way you'd say it."
        hint={`${value.length}/${max}`}
      />
      <div className="mt-3">
        <p className="text-[0.8125rem] text-muted">Need a first line?</p>
        <ul className="mt-1.5 flex flex-col items-start gap-1">
          {MESSAGE_STARTERS.map((line) => (
            <li key={line}>
              <button
                type="button"
                onClick={() => {
                  onChange(line);
                  onBlur?.();
                }}
                className="text-left font-display text-[0.9688rem] text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
              >
                “{line}”
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Live preview: changing the design turns the card over gently. */
export function CardPreview(props: ComponentProps<typeof GiftCardFace>) {
  return (
    <div className="[perspective:1400px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={props.design}
          initial={{ opacity: 0, rotateY: -14, y: 10 }}
          animate={{ opacity: 1, rotateY: 0, y: 0, transition: { duration: 0.7, ease: EASE } }}
          exit={{ opacity: 0, rotateY: 10, transition: { duration: 0.25 } }}
        >
          <GiftCardFace {...props} />
        </m.div>
      </AnimatePresence>
    </div>
  );
}
