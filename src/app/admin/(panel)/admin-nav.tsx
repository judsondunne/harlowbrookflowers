"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const items: { href: Route; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pickups", label: "Pickup days" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/subscriptions", label: "Gift subscriptions" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/subscribers", label: "Email list" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  return <NavList pathname={usePathname()} />;
}

/** Same links without the active state, shown while the current path streams in. */
export function AdminNavFallback() {
  return <NavList pathname="" />;
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((i) => {
          const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                )}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
