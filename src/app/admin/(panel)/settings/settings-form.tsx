"use client";

import { useActionState } from "react";
import { saveSettingsAction, type AdminFormState } from "../../actions";
import type { StoreSettings } from "@/domain/settings";
import { adminButtonPrimary, adminInput } from "@/components/admin/ui";
import { cn } from "@/lib/format";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveSettingsAction, {});
  const e = state.errors ?? {};
  const textarea = "w-full rounded-md border border-line-strong bg-paper p-3 text-sm outline-none focus:border-ink";
  return (
    <form action={action} className="space-y-6">
      {state.message && (
        <p role="status" className={cn("rounded-md p-3 text-sm font-medium", state.ok ? "bg-success/10 text-success" : "bg-error/5 text-error")}>
          {state.message}
        </p>
      )}
      <section className="space-y-4 rounded-md bg-paper p-5 ring-1 ring-line">
        <h2 className="font-semibold">Selling</h2>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="salesOpen" defaultChecked={settings.salesOpen} className="mt-0.5" />
          <span>
            <span className="font-semibold">Online ordering is open</span>
            <span className="block text-muted">Turn off to pause checkout. The shop stays visible.</span>
          </span>
        </label>
        <label className="block text-xs font-semibold">
          Message shown while ordering is paused
          <input name="closedMessage" defaultValue={settings.closedMessage} maxLength={300} className={`${adminInput} mt-1`} />
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="catalogApproved" defaultChecked={settings.catalogApproved} className="mt-0.5" />
          <span>
            <span className="font-semibold">Products, prices and photos are approved for real sales</span>
            <span className="block text-muted">Required before live Stripe payments are accepted.</span>
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold">
            Orders close this many hours before a pickup
            <input name="orderCutoffHours" type="number" min={0} max={168} defaultValue={settings.orderCutoffHours} className={`${adminInput} mt-1`} aria-invalid={!!e.orderCutoffHours} />
          </label>
          <label className="block text-xs font-semibold">
            Sales tax rate (%)
            <input name="taxRatePercent" type="number" min={0} max={20} step="0.01" defaultValue={settings.taxRateBps / 100} className={`${adminInput} mt-1`} />
            <span className="mt-1 block font-normal text-muted">0 hides the tax line. Confirm Vermont requirements first.</span>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-md bg-paper p-5 ring-1 ring-line">
        <h2 className="font-semibold">Pickup</h2>
        <label className="block text-xs font-semibold">
          Public pickup location (shown on the site)
          <input name="pickupLocationPublic" defaultValue={settings.pickupLocationPublic} maxLength={160} className={`${adminInput} mt-1`} />
        </label>
        <label className="block text-xs font-semibold">
          Private pickup instructions (only shown after purchase)
          <textarea name="pickupInstructions" rows={4} defaultValue={settings.pickupInstructions} maxLength={1200} className={`${textarea} mt-1`} />
          <span className="mt-1 block font-normal text-muted">The street address, parking, and where to find the flowers.</span>
        </label>
      </section>

      <section className="space-y-4 rounded-md bg-paper p-5 ring-1 ring-line">
        <h2 className="font-semibold">Site content</h2>
        <label className="block text-xs font-semibold">
          Announcement bar (leave blank for none)
          <input name="announcement" defaultValue={settings.announcement} maxLength={160} className={`${adminInput} mt-1`} />
          <span className="mt-1 block font-normal text-muted">Shown once payments leave demo/test mode.</span>
        </label>
        <label className="block text-xs font-semibold">
          Season note (homepage and farm page)
          <textarea name="seasonNote" rows={3} defaultValue={settings.seasonNote} maxLength={400} className={`${textarea} mt-1`} />
        </label>
        <label className="block text-xs font-semibold">
          Send new-order and message notifications to
          <input name="orderNotificationEmail" type="email" defaultValue={settings.orderNotificationEmail} className={`${adminInput} mt-1`} />
        </label>
      </section>

      <button className={`${adminButtonPrimary} h-11 px-6`} disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
