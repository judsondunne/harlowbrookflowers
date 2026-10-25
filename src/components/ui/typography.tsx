import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { site } from "@/lib/site";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("t-eyebrow", className)}>{children}</p>;
}

/** Centered section title, as in "Shop the garden". */
export function CenteredTitle({
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
    <Tag id={id} className={cn("t-h2 text-center", className)}>
      {children}
    </Tag>
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
      {eyebrow && <Eyebrow className="enter-rise mb-4">{eyebrow}</Eyebrow>}
      <h1 className="t-h1 enter-rise max-w-4xl" style={{ "--d": "80ms" } as React.CSSProperties}>
        {title}
      </h1>
      {children && (
        <div className="t-lead enter-rise mt-6 max-w-2xl" style={{ "--d": "180ms" } as React.CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}

/** A small, honest note on provisional stock photography (switch off in lib/site.ts). */
export function SampleTag({ className, label = "Sample photo" }: { className?: string; label?: string }) {
  if (!site.labelSamplePhotos) return null;
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-2.5 left-2.5 bg-paper/80 px-1.5 py-0.5 text-[0.625rem] leading-tight font-medium text-ink/65",
        className,
      )}
    >
      {label}
    </span>
  );
}
