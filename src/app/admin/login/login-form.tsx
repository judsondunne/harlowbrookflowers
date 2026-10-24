"use client";

import { useActionState } from "react";
import { loginAction, type AdminFormState } from "../actions";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-10 space-y-5 rounded-md bg-paper p-6 ring-1 ring-line">
      {state.message && (
        <p role="alert" className="rounded-sm bg-error/5 p-3 text-sm font-medium text-error">
          {state.message}
        </p>
      )}
      <TextField id="email" name="email" type="email" label="Email" autoComplete="username" required />
      <TextField id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted">Forgot your password? Run `npm run admin:create` to reset it.</p>
    </form>
  );
}
