import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

/*
 * One button system for the whole storefront:
 * primary   – solid ink. The single most important action in a view.
 * secondary – hairline ink outline. The alternative next to a primary.
 * light     – solid paper, for the dark ink bands.
 * outline-light – hairline paper outline, the secondary on dark bands.
 * Text links use the `.link-rule` class instead of a button.
 */
type Variant = "primary" | "secondary" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft disabled:bg-ink/35",
  secondary: "text-ink shadow-[inset_0_0_0_1px_var(--color-ink)] hover:bg-ink/[0.045] disabled:opacity-40",
  light: "bg-paper text-ink hover:bg-white disabled:opacity-50",
  "outline-light": "text-paper shadow-[inset_0_0_0_1px_rgba(250,248,243,0.45)] hover:shadow-[inset_0_0_0_1px_rgba(250,248,243,0.9)] disabled:opacity-40",
};
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.8125rem]",
  md: "h-12 px-6 text-[0.875rem]",
  lg: "h-[3.25rem] px-8 text-[0.9375rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-[2px] font-medium tracking-[0.01em] whitespace-nowrap",
    "transition-[background-color,color,box-shadow] duration-300 ease-(--ease-soft)",
    "disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: Common & { href: Route } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
