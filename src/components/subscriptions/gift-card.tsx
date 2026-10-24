import { cn } from "@/lib/format";

/** The printable gift card, set like a letterpress card: one serif family, an inset rule, generous margins. */
export function GiftCardFace({
  planName,
  detail,
  recipient,
  message,
  sender,
  className,
}: {
  planName: string;
  detail?: string;
  recipient: string;
  message: string;
  sender: string;
  className?: string;
}) {
  return (
    <div className={cn("relative bg-paper px-8 py-10 text-center text-ink shadow-[0_24px_50px_-28px_rgba(42,34,29,0.45)] sm:px-10", className)}>
      <span aria-hidden className="pointer-events-none absolute inset-2.5 border border-line" />
      <p className="font-wordmark text-[1.125rem] leading-none tracking-[-0.02em]">
        Harlow Brook <span className="font-accent text-olive italic">Flowers</span>
      </p>
      <p className="mt-6 font-display text-[1.75rem] leading-tight font-light">{planName}</p>
      {detail && <p className="mt-1 text-[0.8125rem] text-muted">{detail}</p>}
      <p className="mt-7 font-display text-[1.375rem] leading-snug italic">For {recipient}</p>
      <p className="mx-auto mt-3 min-h-12 max-w-[18rem] font-display text-[1rem] leading-relaxed whitespace-pre-line text-ink-soft">
        {message}
      </p>
      <p className="mt-4 font-display text-[1.125rem] italic">with love, {sender}</p>
    </div>
  );
}
