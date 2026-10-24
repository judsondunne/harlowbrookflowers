import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

const control =
  "w-full rounded-[2px] border bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted/75 focus:border-ink focus-visible:shadow-[0_0_0_1px_var(--color-ink)] aria-invalid:border-error";

type FieldShell = { label: ReactNode; hint?: ReactNode; error?: string; id: string; optional?: boolean; className?: string };

function Shell({ label, hint, error, id, optional, className, children }: FieldShell & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

export function TextField({ label, hint, error, id, optional, className, ...input }: FieldShell & ComponentProps<"input">) {
  return (
    <Shell {...{ label, hint, error, id, optional, className }}>
      <input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-12", error ? "border-error" : "border-line-strong")}
        {...input}
      />
    </Shell>
  );
}

export function TextArea({ label, hint, error, id, optional, className, ...input }: FieldShell & ComponentProps<"textarea">) {
  return (
    <Shell {...{ label, hint, error, id, optional, className }}>
      <textarea
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "resize-y py-3", error ? "border-error" : "border-line-strong")}
        {...input}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  id,
  optional,
  className,
  children,
  ...input
}: FieldShell & ComponentProps<"select">) {
  return (
    <Shell {...{ label, hint, error, id, optional, className }}>
      <select
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10", error ? "border-error" : "border-line-strong")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%232a221d' stroke-width='1.4'/%3E%3C/svg%3E\")",
        }}
        {...input}
      >
        {children}
      </select>
    </Shell>
  );
}
