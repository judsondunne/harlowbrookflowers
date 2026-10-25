import { connection } from "next/server";
import Link from "next/link";
import { db } from "@/server/db/client";
import { getUpcomingWindows } from "@/server/availability";
import { loadSettings } from "@/server/settings";
import { formatDateLong, formatTimeRange } from "@/lib/time";

/** Live "next pickup" line. Request-time data: render inside <Suspense>. `compact` is the hero's one-liner. */
export async function NextPickup({ compact = false }: { compact?: boolean }) {
  await connection();
  const settings = await loadSettings();
  const windows = await getUpcomingWindows(db, { now: new Date(), cutoffHours: settings.orderCutoffHours, limit: 12 });
  const next = windows.find((w) => w.bookable);
  if (compact) {
    return (
      <p className="text-[0.875rem] text-ink-soft">
        {next ? (
          <>
            Next pickup: <span className="font-medium text-ink">{formatDateLong(next.date)}</span>,{" "}
            {formatTimeRange(next.startTime, next.endTime)}
          </>
        ) : (
          "New pickup days are posted as the garden blooms."
        )}
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
      {next ? (
        <>
          <span>
            Next open pickup: <span className="font-semibold text-ink">{formatDateLong(next.date)}</span>,{" "}
            {formatTimeRange(next.startTime, next.endTime)}
          </span>
          <Link href="/how-it-works" className="underline decoration-ink/35 underline-offset-4 hover:text-ink hover:decoration-ink">
            How pickup works
          </Link>
        </>
      ) : (
        <span>No pickup days are open right now. New dates are posted as the garden blooms.</span>
      )}
    </p>
  );
}

export function NextPickupFallback() {
  return <p className="h-5 w-72 animate-pulse bg-linen" aria-hidden />;
}
