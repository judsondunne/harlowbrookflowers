import Link from "next/link";
import { cn } from "@/lib/format";

/** The wordmark lockup in miniature: "Harlow Brook" in Gloock with an italic "Flowers", as in the hero. */
export function Logo({ className, inverted = false, ...rest }: { className?: string; inverted?: boolean; tabIndex?: number }) {
  return (
    <Link
      href="/"
      aria-label="Harlow Brook Flowers, home"
      className={cn("inline-flex items-baseline gap-1.5 whitespace-nowrap", inverted ? "text-paper" : "text-ink", className)}
      {...rest}
    >
      <span className="font-wordmark text-[1.5rem] leading-none tracking-[-0.03em] sm:text-[1.625rem]">Harlow Brook</span>
      <span className={cn("font-accent text-[1.0625rem] leading-none italic sm:text-[1.125rem]", inverted ? "text-butter" : "text-olive")}>
        Flowers
      </span>
    </Link>
  );
}
