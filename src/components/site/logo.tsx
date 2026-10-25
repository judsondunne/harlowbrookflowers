import Link from "next/link";
import { cn } from "@/lib/format";

/** The logo: "Harlow Brook Flowers" in Gloock, the same wordmark as the hero and the footer. */
export function Logo({ className, inverted = false, ...rest }: { className?: string; inverted?: boolean; tabIndex?: number }) {
  return (
    <Link
      href="/"
      aria-label="Harlow Brook Flowers, home"
      className={cn("inline-flex whitespace-nowrap", inverted ? "text-paper" : "text-ink", className)}
      {...rest}
    >
      <span className="font-wordmark text-[1.3125rem] leading-none tracking-[-0.03em] sm:text-[1.5rem] lg:text-[1.375rem] xl:text-[1.5rem]">Harlow Brook Flowers</span>
    </Link>
  );
}
