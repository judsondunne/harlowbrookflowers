import { Suspense } from "react";
import { desc, isNull } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { AdminHeader, AdminSkeleton, EmptyState, adminButtonSecondary, td, th } from "@/components/admin/ui";

export const metadata = { title: "Email list" };

export default function SubscribersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Subscribers />
    </Suspense>
  );
}

async function Subscribers() {
  await requireAdmin();
  const rows = await db.select().from(schema.subscribers).where(isNull(schema.subscribers.unsubscribedAt)).orderBy(desc(schema.subscribers.consentedAt));
  return (
    <>
      <AdminHeader
        title="Email list"
        description="People who asked to hear when pickups open. Each signup records the exact consent wording they agreed to."
        actions={
          <a href="/api/admin/subscribers.csv" className={adminButtonSecondary}>
            Export CSV
          </a>
        }
      />
      {rows.length === 0 ? (
        <EmptyState>No one on the list yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md bg-paper ring-1 ring-line">
          <table className="w-full min-w-[36rem]">
            <thead>
              <tr className="border-b border-line">
                <th className={th}>Email</th>
                <th className={th}>Joined</th>
                <th className={th}>From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className={td}>{s.email}</td>
                  <td className={`${td} text-muted`}>{s.consentedAt.slice(0, 10)}</td>
                  <td className={`${td} text-muted`}>{s.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
