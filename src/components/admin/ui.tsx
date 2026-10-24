import type { ReactNode } from "react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/domain/order";
import { cn } from "@/lib/format";

export function AdminHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.015em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-md bg-paper ring-1 ring-line", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[0.9375rem] font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const statusTone: Record<OrderStatus, string> = {
  pending_payment: "bg-butter text-ink",
  paid: "bg-ink text-paper",
  ready: "bg-moss text-paper",
  picked_up: "bg-linen text-ink-soft",
  cancelled: "bg-linen text-muted line-through",
  expired: "bg-linen text-muted",
  payment_failed: "bg-error/10 text-error",
  refunded: "bg-linen text-muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap", statusTone[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ink" | "good" | "warn" | "bad" }) {
  const tones = {
    neutral: "bg-linen text-ink-soft",
    ink: "bg-ink text-paper",
    good: "bg-success/15 text-success",
    warn: "bg-butter text-ink",
    bad: "bg-error/10 text-error",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-md bg-paper p-5 ring-1 ring-line">
      <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line-strong px-5 py-8 text-center text-sm text-muted">{children}</p>;
}

export const th = "px-3 py-2.5 text-left text-[0.6875rem] font-semibold tracking-[0.08em] text-muted uppercase";
export const td = "px-3 py-3 align-top text-sm";

export function AdminSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-9 w-64 rounded bg-linen" />
      <div className="h-4 w-96 rounded bg-linen/70" />
      <div className="mt-8 h-64 rounded-md bg-linen/50" />
    </div>
  );
}

export const adminButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors disabled:opacity-40";
export const adminButtonPrimary = `${adminButton} bg-ink text-paper hover:bg-ink-soft`;
export const adminButtonSecondary = `${adminButton} border border-ink/30 bg-paper hover:border-ink`;
export const adminInput =
  "h-10 w-full rounded-md border border-line-strong bg-paper px-3 text-sm outline-none focus:border-ink aria-invalid:border-error";
