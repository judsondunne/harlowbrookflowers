import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { SprigMark } from "./icons";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("t-eyebrow", className)}>{children}</p>;
}

/** Centered section title with dotted rules and a sprig, as in the "Shop Fresh Flowers" header. */
export function OrnamentTitle({
  children,
  as: Tag = "h2",
  id,
  className,
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-4 sm:gap-6", className)}>
      <span aria-hidden className="hidden h-px flex-1 max-w-56 border-t border-dotted border-ink/35 sm:block" />
      <SprigMark size={18} className="hidden shrink-0 text-olive sm:block" />
      <Tag id={id} className="t-h2 text-center">
        {children}
      </Tag>
      <SprigMark size={18} className="hidden shrink-0 -scale-x-100 text-olive sm:block" />
      <span aria-hidden className="hidden h-px flex-1 max-w-56 border-t border-dotted border-ink/35 sm:block" />
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("container-page pt-14 pb-12 sm:pt-20 sm:pb-16", className)}>
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      <h1 className="t-h1 max-w-4xl">{title}</h1>
      {children && <div className="t-lead mt-6 max-w-2xl">{children}</div>}
    </header>
  );
}

/** Small caption laid over sample imagery, in the micro-label style. */
export function SampleTag({ className, label = "Sample photograph" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-3 left-3 rounded-full bg-paper/85 px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.16em] text-ink/70 uppercase backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
