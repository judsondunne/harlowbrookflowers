import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { db, schema } from "@/server/db/client";
import { databaseEnv } from "@/server/db/env";
import { requireAdmin } from "@/server/auth";
import { loadSettings } from "@/server/settings";
import { paymentMode, siteOrigin } from "@/server/config";
import { SettingsForm } from "./settings-form";
import { AdminHeader, AdminSkeleton, Badge, EmptyState, Panel } from "@/components/admin/ui";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  const [settings, outbox] = await Promise.all([
    loadSettings(),
    db.select().from(schema.emailOutbox).orderBy(desc(schema.emailOutbox.createdAt)).limit(25),
  ]);
  const mode = paymentMode();
  const integrations = [
    {
      name: "Payments (Stripe)",
      ok: mode !== "demo",
      detail: mode === "demo" ? "Not connected: demo checkout only" : mode === "stripe_test" ? "Test mode" : process.env.ALLOW_LIVE_PAYMENTS === "true" ? "Live" : "Live keys present but ALLOW_LIVE_PAYMENTS is off",
    },
    { name: "Stripe webhook", ok: !!process.env.STRIPE_WEBHOOK_SECRET, detail: `${siteOrigin()}/api/webhooks/stripe` },
    { name: "Email delivery", ok: !!process.env.RESEND_API_KEY, detail: process.env.RESEND_API_KEY ? "Resend" : "Not connected: emails are saved to the outbox below" },
    { name: "Photo storage", ok: !!process.env.BLOB_READ_WRITE_TOKEN, detail: process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "Local files (development only)" },
    { name: "Database", ok: databaseEnv().hosted, detail: databaseEnv().hosted ? "Hosted libSQL (Turso)" : "Local SQLite file (development or disposable preview)" },
    { name: "Analytics", ok: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, detail: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "Google Analytics 4" : "Off" },
  ];
  return (
    <>
      <AdminHeader title="Settings" description="Store controls and the words customers see around pickup." />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SettingsForm settings={settings} />
        </div>
        <div className="space-y-6">
          <Panel title="Connections">
            <ul className="space-y-3 text-sm">
              {integrations.map((i) => (
                <li key={i.name}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{i.name}</span>
                    <Badge tone={i.ok ? "good" : "warn"}>{i.ok ? "Ready" : "Setup needed"}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs break-all text-muted">{i.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">Connections are configured with environment variables. See docs/SETUP.md.</p>
          </Panel>
          <Panel title="Email outbox">
            {outbox.length === 0 ? (
              <EmptyState>No emails yet.</EmptyState>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {outbox.map((m) => (
                  <li key={m.id} className="py-2.5">
                    <details>
                      <summary className="cursor-pointer">
                        <span className="font-semibold">{m.subject}</span>
                        <span className="block text-xs text-muted">
                          to {m.to} · {m.status}
                          {m.error ? ` · ${m.error}` : ""}
                        </span>
                      </summary>
                      <pre className="mt-2 max-h-64 overflow-auto rounded bg-linen/60 p-3 text-xs whitespace-pre-wrap">{m.text}</pre>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
