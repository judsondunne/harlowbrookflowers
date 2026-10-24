import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth";
import { getProductForAdmin } from "@/server/catalog";
import { ProductForm } from "../product-form";
import { AdminHeader, AdminSkeleton } from "@/components/admin/ui";

export const metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/products/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (id === "new") {
    return (
      <>
        <AdminHeader title="New product" description="Start as a draft; publish when the photos and price are ready." />
        <ProductForm />
      </>
    );
  }
  const product = await getProductForAdmin(id);
  if (!product) notFound();
  const href = (product.kind === "bouquet" ? `/shop/${product.slug}` : "/subscriptions") as Route;
  return (
    <>
      <AdminHeader
        title={product.name}
        description={`Last updated ${new Date(product.updatedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}`}
        actions={
          product.status !== "draft" ? (
            <Link href={href} className="text-sm font-semibold underline" target="_blank">
              View in shop ↗
            </Link>
          ) : undefined
        }
      />
      <Link href="/admin/products" className="mb-6 inline-block text-sm underline underline-offset-2">
        ← All products
      </Link>
      <ProductForm product={product} />
    </>
  );
}
