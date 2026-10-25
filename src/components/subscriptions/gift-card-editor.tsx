"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cartStore } from "@/components/cart/cart-store";
import { TextField } from "@/components/ui/field";
import type { CartLine } from "@/domain/cart";
import { DEFAULT_CARD_STYLE, type CardStyle } from "@/domain/gift-card";
import { formatMonth } from "@/lib/time";
import { CardPreview, DesignPicker, MessageField } from "./card-designer";

type Draft = { recipientName: string; senderName: string; message: string; cardStyle: CardStyle };

/**
 * Checkout step for one gift subscription: write (or rewrite) the card that goes with it.
 * Edits stay local while typing and save to the cart after a pause or on leaving a field, so the
 * price check behind checkout isn't re-run on every keystroke.
 */
export function GiftCardEditor({
  line,
  planName,
  sizeLabel,
  image,
}: {
  line: CartLine & { gift: NonNullable<CartLine["gift"]> };
  planName: string;
  sizeLabel: string;
  image?: string | null;
}) {
  const id = useId();
  const [draft, setDraft] = useState<Draft>({
    recipientName: line.gift.recipientName,
    senderName: line.gift.senderName,
    message: line.gift.message ?? "",
    cardStyle: line.gift.cardStyle ?? DEFAULT_CARD_STYLE,
  });
  const latest = useRef(draft);
  const timer = useRef<number | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const save = (next: Draft) => {
    window.clearTimeout(timer.current);
    cartStore.updateGift(line.key, {
      recipientName: next.recipientName.trim(),
      senderName: next.senderName.trim(),
      message: next.message.trim(),
      cardStyle: next.cardStyle,
    });
  };
  const update = (patch: Partial<Draft>, immediate = false) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setDraft(next);
    window.clearTimeout(timer.current);
    if (immediate) save(next);
    else timer.current = window.setTimeout(() => save(next), 500);
  };
  const flush = () => {
    setTouched(true);
    save(latest.current);
  };
  // Never lose the last few keystrokes when the editor unmounts.
  useEffect(() => () => save(latest.current), []); // eslint-disable-line react-hooks/exhaustive-deps

  const detail = `${sizeLabel.split("·")[0].trim()} · from ${formatMonth(line.gift.startMonth)}`;
  const nameError = touched && !draft.recipientName.trim() ? "Add their name for the card." : undefined;
  const senderError = touched && !draft.senderName.trim() ? "Add your name as it should appear." : undefined;

  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-line pt-8">
      <h2 id={`${id}-title`} className="t-h3">
        A card for {draft.recipientName.trim() || "your recipient"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {planName}. Printed with the gift, and shown on their gift page if you send them the link.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_16.5rem] md:gap-10">
        <div className="space-y-6">
          <DesignPicker name={`${id}-design`} value={draft.cardStyle} onChange={(cardStyle) => update({ cardStyle }, true)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${id}-to`}
              label="To"
              value={draft.recipientName}
              maxLength={80}
              autoComplete="off"
              onChange={(e) => update({ recipientName: e.target.value })}
              onBlur={flush}
              error={nameError}
            />
            <TextField
              id={`${id}-from`}
              label="From"
              value={draft.senderName}
              maxLength={80}
              autoComplete="off"
              onChange={(e) => update({ senderName: e.target.value })}
              onBlur={flush}
              error={senderError}
            />
          </div>
          <MessageField id={`${id}-message`} value={draft.message} onChange={(message) => update({ message })} onBlur={flush} />
        </div>
        <div className="md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:self-start">
          <CardPreview
            design={draft.cardStyle}
            image={image}
            planName={planName}
            detail={detail}
            recipient={draft.recipientName.trim() || "someone lovely"}
            message={draft.message.trim() ? `“${draft.message.trim()}”` : "Your message will appear here."}
            sender={draft.senderName.trim() || "you"}
          />
        </div>
      </div>
    </section>
  );
}
