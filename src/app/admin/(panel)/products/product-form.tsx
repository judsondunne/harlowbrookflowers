"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { saveProductAction, type AdminFormState } from "../../actions";
import type { Product, ProductImage } from "@/domain/catalog";
import { adminButtonPrimary, adminButtonSecondary, adminInput } from "@/components/admin/ui";
import { cn } from "@/lib/format";

function Field({ label, name, error, hint, children }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-error">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveProductAction, {});
  const [kind, setKind] = useState(product?.kind ?? "bouquet");
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const e = state.errors ?? {};
  const textarea = "w-full rounded-md border border-line-strong bg-paper p-3 text-sm outline-none focus:border-ink";

  const move = (i: number, d: number) =>
    setImages((list) => {
      const next = [...list];
      const [x] = next.splice(i, 1);
      next.splice(Math.max(0, Math.min(next.length, i + d)), 0, x);
      return next;
    });
  const patch = (i: number, p: Partial<ProductImage>) => setImages((list) => list.map((img, j) => (j === i ? { ...img, ...p } : img)));

  return (
    <form action={action} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state.message && (
        <p role="status" className={cn("rounded-md p-3 text-sm font-medium", state.ok ? "bg-success/10 text-success" : "bg-error/5 text-error")}>
          {state.message}
        </p>
      )}

      <section className="grid gap-4 rounded-md bg-paper p-5 ring-1 ring-line sm:grid-cols-2">
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" defaultValue={product?.name} required className={adminInput} />
        </Field>
        <Field label="Web address" name="slug" error={e.slug} hint="Lowercase, dashes, e.g. garden-bouquet">
          <input id="slug" name="slug" defaultValue={product?.slug} required className={adminInput} />
        </Field>
        <Field label="Type" name="kind">
          <select id="kind" name="kind" value={kind} onChange={(ev) => setKind(ev.target.value as Product["kind"])} className={adminInput}>
            <option value="bouquet">Bouquet</option>
            <option value="subscription">Gift subscription</option>
          </select>
        </Field>
        <Field label="Status" name="status" error={e.status}>
          <select id="status" name="status" defaultValue={product?.status ?? "draft"} className={adminInput}>
            <option value="active">Active: for sale</option>
            <option value="hidden">Hidden: link only</option>
            <option value="draft">Draft: not visible</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Price (USD)" name="price" error={e.price}>
          <input id="price" name="price" type="number" step="0.01" min="1" defaultValue={product ? product.priceCents / 100 : ""} required className={adminInput} />
        </Field>
        <Field label="Size label" name="sizeLabel" hint="e.g. Medium · about 20 stems">
          <input id="sizeLabel" name="sizeLabel" defaultValue={product?.sizeLabel} className={adminInput} />
        </Field>
        <Field label="Stock available" name="inventory" error={e.inventory} hint="Leave blank to limit only by pickup-day capacity.">
          <input id="inventory" name="inventory" type="number" min="0" defaultValue={product?.inventory ?? ""} className={adminInput} />
        </Field>
        {kind === "bouquet" ? (
          <Field label="Max per order" name="maxPerOrder">
            <input id="maxPerOrder" name="maxPerOrder" type="number" min="1" max="24" defaultValue={product?.maxPerOrder ?? 6} className={adminInput} />
          </Field>
        ) : (
          <input type="hidden" name="maxPerOrder" value="1" />
        )}
      </section>

      {kind === "subscription" && (
        <section className="grid gap-4 rounded-md bg-paper p-5 ring-1 ring-line sm:grid-cols-2">
          <Field label="Number of monthly bouquets" name="deliveries" error={e.deliveries}>
            <input id="deliveries" name="deliveries" type="number" min="1" max="12" defaultValue={product?.deliveries ?? 3} className={adminInput} />
          </Field>
          <Field label="Start months (one per line, YYYY-MM)" name="startMonths">
            <textarea id="startMonths" name="startMonths" rows={3} defaultValue={product?.startMonths.join("\n")} className={textarea} />
          </Field>
        </section>
      )}
      {kind === "bouquet" && <input type="hidden" name="deliveries" value="" />}

      <section className="space-y-4 rounded-md bg-paper p-5 ring-1 ring-line">
        <Field label="Tagline (one line)" name="tagline">
          <input id="tagline" name="tagline" defaultValue={product?.tagline} maxLength={140} className={adminInput} />
        </Field>
        <Field label="Short summary (shop listing)" name="summary">
          <textarea id="summary" name="summary" rows={2} defaultValue={product?.summary} maxLength={400} className={textarea} />
        </Field>
        <Field label="Full description (blank line between paragraphs)" name="description">
          <textarea id="description" name="description" rows={6} defaultValue={product?.description} className={textarea} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="What's included (one per line)" name="details">
            <textarea id="details" name="details" rows={4} defaultValue={product?.details.join("\n")} className={textarea} />
          </Field>
          <Field label="Care notes (one per line)" name="care">
            <textarea id="care" name="care" rows={4} defaultValue={product?.care.join("\n")} className={textarea} />
          </Field>
        </div>
      </section>

      <section className="rounded-md bg-paper p-5 ring-1 ring-line">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">Photos</h2>
          {e.images && <p className="text-xs text-error">{e.images}</p>}
        </div>
        <p className="mb-4 text-xs text-muted">
          The first photo is the main image. Use a transparent-background (cutout) photo first for bouquets so the shop stays
          consistent. Untick “Sample” once a photo is Sarah&apos;s own.
        </p>
        <ul className="space-y-3">
          {images.map((img, i) => (
            <li key={`${img.src}-${i}`} className="flex flex-wrap items-center gap-3 rounded-md border border-line p-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded bg-linen">
                <Image src={img.src} alt="" fill sizes="64px" className={img.kind === "cutout" ? "object-contain p-1" : "object-cover"} />
              </span>
              <input
                aria-label={`Description of photo ${i + 1}`}
                value={img.alt}
                onChange={(ev) => patch(i, { alt: ev.target.value })}
                placeholder="Describe the photo (alt text)"
                className={`${adminInput} min-w-48 flex-1`}
              />
              <select aria-label="Photo type" value={img.kind} onChange={(ev) => patch(i, { kind: ev.target.value as ProductImage["kind"] })} className={`${adminInput} w-36`}>
                <option value="cutout">Cutout</option>
                <option value="photo">Photo</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={img.provisional} onChange={(ev) => patch(i, { provisional: ev.target.checked })} /> Sample
              </label>
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={adminButtonSecondary} aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className={adminButtonSecondary} aria-label="Move down">
                  ↓
                </button>
                <button type="button" onClick={() => setImages((l) => l.filter((_, j) => j !== i))} className={`${adminButtonSecondary} text-error`}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-line-strong p-4">
          <label className="text-xs font-semibold">
            Upload new photos
            <input name="newImages" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="mt-1 block text-sm" />
          </label>
          <label className="text-xs font-semibold">
            Type
            <select name="newImageKind" defaultValue="photo" className={`${adminInput} mt-1 w-36`}>
              <option value="photo">Photo</option>
              <option value="cutout">Cutout (transparent)</option>
            </select>
          </label>
          <p className="w-full text-xs text-muted">New photos are added after saving; then add a description for each.</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-md bg-paper p-5 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Available from" name="availableFrom" hint="Optional seasonal start">
          <input id="availableFrom" name="availableFrom" type="date" defaultValue={product?.availableFrom ?? ""} className={adminInput} />
        </Field>
        <Field label="Available until" name="availableUntil" hint="Optional seasonal end">
          <input id="availableUntil" name="availableUntil" type="date" defaultValue={product?.availableUntil ?? ""} className={adminInput} />
        </Field>
        <Field label="Sort order" name="sortOrder" hint="Lower shows first">
          <input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue={product?.sortOrder ?? 100} className={adminInput} />
        </Field>
        <Field label="Card image size (%)" name="displayScale" hint="Shows relative bouquet size">
          <input id="displayScale" name="displayScale" type="number" min="50" max="100" defaultValue={Math.round((product?.displayScale ?? 0.9) * 100)} className={adminInput} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured
        </label>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button className={`${adminButtonPrimary} h-11 px-6 shadow-lg`} disabled={pending}>
          {pending ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
}
