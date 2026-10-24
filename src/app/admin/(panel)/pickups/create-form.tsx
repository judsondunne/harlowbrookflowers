"use client";

import { useActionState, useState } from "react";
import { createPickupWindowsAction, type AdminFormState } from "../../actions";
import { adminButtonPrimary, adminInput } from "@/components/admin/ui";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CreatePickupForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createPickupWindowsAction, {});
  const [repeat, setRepeat] = useState(false);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" checked={!repeat} onChange={() => setRepeat(false)} /> One day
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={repeat} onChange={() => setRepeat(true)} /> Repeat weekly
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">
          {repeat ? "From" : "Date"}
          <input type="date" name="from" required className={`${adminInput} mt-1`} aria-invalid={!!e.from} />
        </label>
        {repeat && (
          <label className="text-xs font-semibold">
            Until
            <input type="date" name="to" required className={`${adminInput} mt-1`} aria-invalid={!!e.to} />
          </label>
        )}
      </div>
      {repeat && (
        <fieldset>
          <legend className="mb-1 text-xs font-semibold">On</legend>
          <div className="flex flex-wrap gap-2">
            {days.map((d, i) => (
              <label key={d} className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs">
                <input type="checkbox" name="weekday" value={i} defaultChecked={i === 3 || i === 6} /> {d}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs font-semibold">
          Start
          <input type="time" name="startTime" defaultValue="09:00" required className={`${adminInput} mt-1`} />
        </label>
        <label className="text-xs font-semibold">
          End
          <input type="time" name="endTime" defaultValue="12:00" required className={`${adminInput} mt-1`} aria-invalid={!!e.endTime} />
        </label>
        <label className="text-xs font-semibold">
          Bouquets
          <input type="number" name="capacity" min={1} max={500} defaultValue={20} required className={`${adminInput} mt-1`} />
        </label>
      </div>
      <label className="block text-xs font-semibold">
        Label (optional)
        <input name="label" maxLength={80} placeholder="Saturday morning pickup" className={`${adminInput} mt-1`} />
      </label>
      {state.message && (
        <p role="status" className={`text-sm ${state.ok ? "text-success" : "text-error"}`}>
          {state.message}
          {Object.values(e).length > 0 && ` ${Object.values(e).join(" ")}`}
        </p>
      )}
      <button className={adminButtonPrimary} disabled={pending}>
        {pending ? "Adding…" : "Add pickup days"}
      </button>
    </form>
  );
}
