import { Suspense } from "react";
import { desc, ne } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { setWholesaleStatusAction } from "../../actions";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, adminButtonSecondary } from "@/components/admin/ui";

export const metadata = { title: "Wholesale inquiries" };

export default function WholesaleInquiriesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Inquiries />
    </Suspense>
  );
}

async function Inquiries() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(schema.wholesaleInquiries)
    .where(ne(schema.wholesaleInquiries.status, "archived"))
    .orderBy(desc(schema.wholesaleInquiries.createdAt))
    .limit(200);
  return (
    <>
      <AdminHeader
        title="Wholesale inquiries"
        description="Businesses asking about flowers through /wholesale. Reply by email, then mark them replied."
      />
      {rows.length === 0 ? (
        <EmptyState>No wholesale inquiries yet.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const details: [string, string][] = [
              ["Business type", r.businessType],
              ["Location", r.location],
              ["Use", r.intendedUse],
              ["Quantity / frequency", r.quantity],
              ["Start", r.startDate],
              ["Phone", r.phone],
            ];
            return (
              <li key={r.id} className="rounded-md bg-paper p-5 ring-1 ring-line">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.businessName} <span className="font-normal text-muted">· {r.contactName}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(r.createdAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <Badge tone={r.status === "new" ? "ink" : "neutral"}>{r.status}</Badge>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  {details
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="text-muted">{k}:</dt>
                        <dd className="text-ink-soft">{v}</dd>
                      </div>
                    ))}
                </dl>
                {r.details && <p className="mt-3 text-sm whitespace-pre-line text-ink-soft">{r.details}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent(`Harlow Brook wholesale flowers for ${r.businessName}`)}`}
                    className={adminButtonSecondary}
                  >
                    Reply to {r.email}
                  </a>
                  {r.status === "new" && (
                    <form action={setWholesaleStatusAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="replied" />
                      <button className={adminButtonSecondary}>Mark replied</button>
                    </form>
                  )}
                  <form action={setWholesaleStatusAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="archived" />
                    <button className={adminButtonSecondary}>Archive</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
