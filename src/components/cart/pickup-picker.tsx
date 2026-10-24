"use client";

import { useState } from "react";
import type { PickupWindowAvailability } from "@/domain/catalog";
import { cn } from "@/lib/format";
import { formatDateLong, formatTimeRange } from "@/lib/time";
import { IconCheck } from "@/components/ui/icons";

/** Radio-card list of pickup windows. Capacity is shown only when it's genuinely limited. */
export function PickupPicker({
  windows,
  value,
  onChange,
  bouquetCount = 1,
  name = "pickup",
  compact = false,
  limit,
}: {
  windows: PickupWindowAvailability[];
  value?: string;
  onChange: (id: string) => void;
  bouquetCount?: number;
  name?: string;
  compact?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedIndex = windows.findIndex((w) => w.id === value);
  const visibleCount = expanded || !limit ? windows.length : Math.max(limit, selectedIndex + 1);
  const shown = windows.slice(0, visibleCount);

  if (windows.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-line-strong bg-paper/60 p-4 text-sm text-muted">
        No pickup days are open right now. New dates are posted as the garden comes into bloom; join the list below and
        we&apos;ll let you know.
      </p>
    );
  }
  return (
    <fieldset>
      <legend className="sr-only">Choose a pickup day</legend>
      <ul className={cn("grid gap-2", !compact && "sm:grid-cols-2")}>
        {shown.map((w) => {
          const fits = w.bookable && w.remaining >= bouquetCount;
          const selected = value === w.id;
          const status = !w.bookable
            ? w.reason === "full"
              ? "Fully booked"
              : "Orders closed"
            : w.remaining < bouquetCount
              ? `Only ${w.remaining} left`
              : w.remaining <= 5
                ? `${w.remaining} left`
                : null;
          return (
            <li key={w.id}>
              <label
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-colors",
                  selected ? "border-ink bg-paper" : "border-line-strong bg-paper/50 hover:border-ink/60",
                  !fits && "cursor-not-allowed opacity-55 hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={w.id}
                  checked={selected}
                  disabled={!fits}
                  onChange={() => onChange(w.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                    selected ? "border-ink bg-ink text-paper" : "border-ink/40",
                  )}
                >
                  {selected && <IconCheck size={13} strokeWidth={2} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] leading-snug font-semibold">{formatDateLong(w.date)}</span>
                  <span className="block text-sm text-muted">{formatTimeRange(w.startTime, w.endTime)}</span>
                </span>
                {status && (
                  <span className={cn("shrink-0 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase", fits ? "text-ink" : "text-muted")}>
                    {status}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
      {visibleCount < windows.length && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 text-sm font-semibold underline underline-offset-4 hover:text-ink-soft"
        >
          More dates ({windows.length - visibleCount})
        </button>
      )}
    </fieldset>
  );
}
