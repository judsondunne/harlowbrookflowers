import { connection } from "next/server";
import Link from "next/link";
import { db } from "@/server/db/client";
import { getUpcomingWindows } from "@/server/availability";
import { loadSettings } from "@/server/settings";
import { IconCalendar } from "@/components/ui/icons";
import { formatDateLong, formatTimeRange } from "@/lib/time";

/** Live "next pickup" line. Request-time data: render inside <Suspense>. */
export async function NextPickup() {
  await connection();
  const settings = await loadSettings();
  const windows = await getUpcomingWindows(db, { now: new Date(), cutoffHours: settings.orderCutoffHours, limit: 12 });
  const next = windows.find((w) => w.bookable);
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
      <IconCalendar size={18} className="text-olive" />
      {next ? (
        <>
          <span>
            Next open pickup: <span className="font-semibold text-ink">{formatDateLong(next.date)}</span>,{" "}
            {formatTimeRange(next.startTime, next.endTime)}
          </span>
          <Link href="/how-it-works" className="underline underline-offset-4 hover:text-ink">
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
  return <p className="h-5 w-72 animate-pulse rounded-full bg-linen" aria-hidden />;
}
