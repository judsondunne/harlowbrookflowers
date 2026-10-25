import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { getUpcomingWindows } from "@/server/availability";
import { loadSettings } from "@/server/settings";
import { deletePickupWindowAction, updatePickupWindowAction } from "../../actions";
import { CreatePickupForm } from "./create-form";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, Panel, adminButtonSecondary, adminInput, td, th } from "@/components/admin/ui";
import { formatDateShort, formatTimeRange } from "@/lib/time";

export const metadata = { title: "Pickup days" };

export default function PickupsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Pickups />
    </Suspense>
  );
}

async function Pickups() {
  await requireAdmin();
  const settings = await loadSettings();
  const windows = await getUpcomingWindows(db, { now: new Date(), cutoffHours: settings.orderCutoffHours, includeClosed: true, limit: 120 });

  return (
    <>
      <AdminHeader
        title="Pickup days"
        description={`Customers choose from open days. Each day holds a set number of bouquets; orders close ${settings.orderCutoffHours} hours before it starts (change in Settings).`}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {windows.length === 0 ? (
            <EmptyState>No upcoming pickup days yet. Add your first one with the form.</EmptyState>
          ) : (
            <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
              <table className="w-full min-w-[44rem]">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Day</th>
                    <th className={th}>Booked / capacity</th>
                    <th className={th}>Status</th>
                    <th className={th}>Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {windows.map((w) => (
                    <tr key={w.id}>
                      <td className={td}>
                        <p className="font-semibold">{formatDateShort(w.date)}</p>
                        <p className="text-xs text-muted">
                          {formatTimeRange(w.startTime, w.endTime)}
                          {w.label ? ` · ${w.label}` : ""}
                        </p>
                        <Link href={`/admin/pickups/${w.id}` as Route} className="mt-1 inline-block text-xs font-semibold underline">
                          Picking list
                        </Link>
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {w.reserved} / {w.capacity}
                      </td>
                      <td className={td}>
                        {w.status === "closed" ? (
                          <Badge>Closed</Badge>
                        ) : w.reason === "full" ? (
                          <Badge tone="warn">Full</Badge>
                        ) : w.reason === "cutoff" ? (
                          <Badge>Orders closed</Badge>
                        ) : (
                          <Badge tone="good">Open</Badge>
                        )}
                      </td>
                      <td className={td}>
                        <form action={updatePickupWindowAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="id" value={w.id} />
                          <label className="sr-only" htmlFor={`cap-${w.id}`}>
                            Capacity
                          </label>
                          <input
                            id={`cap-${w.id}`}
                            name="capacity"
                            type="number"
                            min={0}
                            max={500}
                            defaultValue={w.capacity}
                            className={`${adminInput} h-9 w-20`}
                          />
                          <select name="status" defaultValue={w.status} className={`${adminInput} h-9 w-28`} aria-label="Status">
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                          </select>
                          <input type="hidden" name="notes" value={w.notes} />
                          <button className={adminButtonSecondary}>Save</button>
                        </form>
                        {w.reserved === 0 && (
                          <form action={deletePickupWindowAction} className="mt-2">
                            <input type="hidden" name="id" value={w.id} />
                            <button className="text-xs text-muted underline hover:text-error">Delete day</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Panel title="Add pickup days">
          <CreatePickupForm />
        </Panel>
      </div>
    </>
  );
}
