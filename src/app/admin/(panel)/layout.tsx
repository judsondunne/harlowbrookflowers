import { Suspense } from "react";
import Link from "next/link";
import { AdminNav, AdminNavFallback } from "./admin-nav";
import { logoutAction } from "../actions";
import { getAdmin } from "@/server/auth";
import { paymentMode } from "@/server/config";
import { SprigMark } from "@/components/ui/icons";
import { Badge } from "@/components/admin/ui";

async function SignedIn() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <div className="border-t border-line pt-4 text-xs">
      <p className="font-semibold">{admin.name}</p>
      <p className="truncate text-muted">{admin.email}</p>
      <form action={logoutAction} className="mt-3">
        <button className="font-semibold text-muted underline underline-offset-2 hover:text-ink">Sign out</button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const mode = paymentMode();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-paper lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2">
            <SprigMark size={24} className="text-olive" />
            <span className="font-display text-lg">Harlow Brook</span>
          </Link>
          <div className="lg:mt-3">
            <Badge tone={mode === "stripe_live" ? "good" : mode === "stripe_test" ? "warn" : "neutral"}>
              {mode === "demo" ? "Demo mode" : mode === "stripe_test" ? "Stripe test mode" : "Live payments"}
            </Badge>
          </div>
        </div>
        <Suspense fallback={<AdminNavFallback />}>
          <AdminNav />
        </Suspense>
        <div className="hidden px-5 pb-5 lg:mt-auto lg:block">
          <Link href="/" className="mb-4 block text-xs font-semibold text-muted underline underline-offset-2 hover:text-ink">
            View the shop ↗
          </Link>
          <Suspense fallback={null}>
            <SignedIn />
          </Suspense>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
