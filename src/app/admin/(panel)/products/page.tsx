import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { db } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { listProducts } from "@/server/catalog";
import { AdminHeader, AdminSkeleton, Badge, adminButtonPrimary, td, th } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Products />
    </Suspense>
  );
}

const statusTone = { active: "good", hidden: "warn", draft: "neutral", archived: "neutral" } as const;

async function Products() {
  await requireAdmin();
  const products = await listProducts(db, ["active", "hidden", "draft", "archived"]);
  return (
    <>
      <AdminHeader
        title="Products"
        description="Bouquets and gift subscriptions. Changes appear in the shop as soon as you save."
        actions={
          <Link href="/admin/products/new" className={adminButtonPrimary}>
            New product
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
        <table className="w-full min-w-[44rem]">
          <thead>
            <tr className="border-b border-line">
              <th className={th}>Product</th>
              <th className={th}>Type</th>
              <th className={th}>Price</th>
              <th className={th}>Stock</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className={td}>
                  <Link href={`/admin/products/${p.id}` as Route} className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded bg-linen">
                      {p.images[0] && (
                        <Image src={p.images[0].src} alt="" fill sizes="48px" className={p.images[0].kind === "cutout" ? "object-contain p-0.5" : "object-cover"} />
                      )}
                    </span>
                    <span>
                      <span className="block font-semibold underline-offset-2 hover:underline">{p.name}</span>
                      <span className="block text-xs text-muted">/{p.kind === "bouquet" ? `shop/${p.slug}` : `subscriptions`}</span>
                    </span>
                  </Link>
                </td>
                <td className={td}>{p.kind === "bouquet" ? "Bouquet" : `Subscription · ${p.deliveries}`}</td>
                <td className={`${td} tabular-nums`}>{formatPrice(p.priceCents)}</td>
                <td className={`${td} tabular-nums`}>
                  {p.inventory === null ? <span className="text-muted">Pickup capacity only</span> : p.inventory === 0 ? <Badge tone="bad">Sold out</Badge> : p.inventory}
                </td>
                <td className={td}>
                  <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  {p.images.some((i) => i.provisional) && <div className="mt-1 text-xs text-muted">Sample photos</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        Active: listed and for sale. Hidden: reachable by link but not for sale. Draft: not visible. Archived: retired.
      </p>
    </>
  );
}
