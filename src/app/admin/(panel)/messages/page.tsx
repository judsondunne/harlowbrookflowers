import { Suspense } from "react";
import { desc, ne } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { requireAdmin } from "@/server/auth";
import { setMessageStatusAction } from "../../actions";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, adminButtonSecondary } from "@/components/admin/ui";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Messages />
    </Suspense>
  );
}

async function Messages() {
  await requireAdmin();
  const rows = await db.select().from(schema.contactMessages).where(ne(schema.contactMessages.status, "archived")).orderBy(desc(schema.contactMessages.createdAt)).limit(200);
  return (
    <>
      <AdminHeader title="Messages" description="Notes sent through the contact form. Reply by email, then mark them replied." />
      {rows.length === 0 ? (
        <EmptyState>No messages. Nice and quiet.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {rows.map((m) => (
            <li key={m.id} className="rounded-md bg-paper p-5 ring-1 ring-line">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name} <span className="font-normal text-muted">· {m.topic}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(m.createdAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <Badge tone={m.status === "new" ? "ink" : "neutral"}>{m.status}</Badge>
              </div>
              <p className="mt-3 text-sm whitespace-pre-line text-ink-soft">{m.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`} className={adminButtonSecondary}>
                  Reply to {m.email}
                </a>
                {m.status === "new" && (
                  <form action={setMessageStatusAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="replied" />
                    <button className={adminButtonSecondary}>Mark replied</button>
                  </form>
                )}
                <form action={setMessageStatusAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button className={adminButtonSecondary}>Archive</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
