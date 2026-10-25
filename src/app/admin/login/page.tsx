import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { SprigMark } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <SprigMark size={40} className="mx-auto text-ink-soft" />
          <h1 className="mt-5 font-display text-3xl">Harlow Brook admin</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage bouquets, pickup days and orders.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
