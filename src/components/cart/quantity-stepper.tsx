"use client";

import { IconMinus, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "grid place-items-center rounded-full text-ink transition-colors hover:bg-ink/6 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border border-line-strong bg-paper", size === "sm" ? "h-9 px-0.5" : "h-11 px-0.5")}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <IconMinus size={16} />
      </button>
      <output aria-live="polite" className={cn("text-center font-semibold tabular-nums", size === "sm" ? "w-6 text-sm" : "w-8")}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <IconPlus size={16} />
      </button>
    </div>
  );
}
