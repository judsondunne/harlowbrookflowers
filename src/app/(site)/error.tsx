"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { SprigMark } from "@/components/ui/icons";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <SprigMark size={40} className="text-olive" />
      <h1 className="t-h1 mt-6 max-w-2xl">Something went wrong on our end.</h1>
      <p className="t-lead mt-5 max-w-lg">
        Sorry about that. Nothing in your cart has been lost and no payment was taken. Please try again in a moment.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className={buttonClass("primary")}
        >
          Try again
        </button>
        <Link href="/" className={buttonClass("secondary")}>
          Go to the homepage
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Reference: {error.digest}</p>}
    </section>
  );
}
