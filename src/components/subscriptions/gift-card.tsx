import Image from "next/image";
import { DEFAULT_CARD_STYLE, type CardStyle } from "@/domain/gift-card";
import { cn } from "@/lib/format";

const designs: Record<CardStyle, { card: string; rule: string; muted: string; body: string }> = {
  letterpress: { card: "bg-paper text-ink", rule: "border-line", muted: "text-muted", body: "text-ink-soft" },
  garden: { card: "bg-paper text-ink", rule: "border-line", muted: "text-muted", body: "text-ink-soft" },
  evening: { card: "bg-ink text-paper", rule: "border-paper/20", muted: "text-paper/55", body: "text-paper/80" },
  buttercup: { card: "bg-butter text-ink", rule: "border-ink/15", muted: "text-ink/55", body: "text-ink-soft" },
};

/**
 * The gift card for a flower subscription, in one of four designs. Set in one serif family with an inset rule,
 * like a letterpress card. "Garden" adds the plan's bouquet on a butter circle.
 */
export function GiftCardFace({
  planName,
  detail,
  recipient,
  message,
  sender,
  design = DEFAULT_CARD_STYLE,
  image,
  size = "md",
  className,
}: {
  planName: string;
  detail?: string;
  recipient: string;
  message: string;
  sender: string;
  design?: CardStyle;
  image?: string | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const d = designs[design];
  const lg = size === "lg";
  return (
    <div
      className={cn(
        "relative px-8 text-center shadow-[0_24px_50px_-28px_rgba(42,34,29,0.45)] [print-color-adjust:exact] sm:px-10 print:shadow-none",
        lg ? "py-12 sm:px-14 sm:py-16" : "py-10",
        d.card,
        className,
      )}
    >
      <span aria-hidden className={cn("pointer-events-none absolute inset-2.5 border", d.rule)} />
      {design === "garden" && image && (
        <div className={cn("relative mx-auto -mt-2 mb-5", lg ? "h-44 w-44" : "h-32 w-32")}>
          <span aria-hidden className="absolute inset-[8%] rounded-full bg-butter" />
          <Image src={image} alt="" fill sizes="176px" className="object-contain object-bottom" />
        </div>
      )}
      <p className={cn("font-wordmark leading-none tracking-[-0.02em]", lg ? "text-[1.375rem]" : "text-[1.125rem]")}>Harlow Brook Flowers</p>
      <p className={cn("mt-6 font-display leading-tight font-medium", lg ? "text-[2.25rem]" : "text-[1.75rem]")}>{planName}</p>
      {detail && <p className={cn("mt-1 text-[0.8125rem]", d.muted)}>{detail}</p>}
      <p className={cn("mt-7 font-display leading-snug font-medium", lg ? "text-[1.75rem]" : "text-[1.375rem]")}>For {recipient}</p>
      <p
        className={cn(
          "mx-auto mt-3 min-h-12 font-display leading-relaxed whitespace-pre-line",
          lg ? "max-w-[24rem] text-[1.125rem]" : "max-w-[18rem] text-[1rem]",
          d.body,
        )}
      >
        {message}
      </p>
      <p className={cn("mt-4 font-display font-medium", lg ? "text-[1.25rem]" : "text-[1.125rem]")}>With love, {sender}</p>
    </div>
  );
}
