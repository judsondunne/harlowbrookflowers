import Link from "next/link";
import { SprigMark } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Harlow Brook Flowers, home"
      className={cn("group inline-flex items-center gap-2.5", inverted ? "text-paper" : "text-ink", className)}
    >
      <SprigMark size={30} className={cn("transition-transform duration-700 ease-(--ease-out-quint) group-hover:-rotate-6", inverted ? "text-butter" : "text-olive")} />
      <span className="leading-none">
        <span className="block font-display text-[1.375rem] tracking-[-0.02em] whitespace-nowrap">Harlow Brook</span>
        <span className={cn("mt-1 block text-[0.5625rem] font-semibold tracking-[0.22em] whitespace-nowrap uppercase", inverted ? "text-paper/60" : "text-olive")}>
          Flowers · Hartland, VT
        </span>
      </span>
    </Link>
  );
}
