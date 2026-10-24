import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";
import { IconArrowRight } from "./icons";

type Variant = "primary" | "secondary" | "light" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft active:bg-ink disabled:bg-ink/40 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-paper disabled:opacity-40",
  light: "bg-paper text-ink hover:bg-white disabled:opacity-50",
  ghost: "text-ink hover:bg-ink/5 disabled:opacity-40",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-7 text-[0.9375rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] whitespace-nowrap",
    "transition-[background-color,color,transform,box-shadow] duration-300 ease-(--ease-soft) active:scale-[0.98]",
    "disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode; arrow?: boolean };

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  arrow,
  ...rest
}: Common & { href: Route } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, size, cn("group", className))} {...rest}>
      {children}
      {arrow && <IconArrowRight size={18} className="transition-transform duration-500 ease-(--ease-out-quint) group-hover:translate-x-1" />}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  arrow,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, size, cn("group", className))} {...rest}>
      {children}
      {arrow && <IconArrowRight size={18} className="transition-transform duration-500 ease-(--ease-out-quint) group-hover:translate-x-1" />}
    </button>
  );
}

/** The circular arrow from the hero ("Add to cart →"), usable as a button or link adornment. */
export function ArrowCircle({ direction = "right", className }: { direction?: "left" | "right"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-11 place-items-center rounded-full border border-ink/70 text-ink transition-colors duration-300",
        className,
      )}
    >
      <IconArrowRight size={18} style={direction === "left" ? { transform: "scaleX(-1)" } : undefined} />
    </span>
  );
}
