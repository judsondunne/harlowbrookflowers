import { desc, isNull } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { getAdmin } from "@/server/auth";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Email list export with consent records. Admin session required. */
export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await db.select().from(schema.subscribers).where(isNull(schema.subscribers.unsubscribedAt)).orderBy(desc(schema.subscribers.consentedAt));
  const body = [
    ["Email", "Joined", "Source", "Consent wording"],
    ...rows.map((s) => [s.email, s.consentedAt, s.source, s.consentText]),
  ]
    .map((r) => r.map(csv).join(","))
    .join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="harlow-brook-email-list.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
