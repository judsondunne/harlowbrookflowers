"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/**
 * After checkout: an optional way to send the recipient their gift page. Shows how the link will look in a
 * message, then offers the phone's own share sheet, a copy button, and text or email shortcuts.
 */
const noop = () => () => {};

export function GiftSharePanel({
  url,
  previewImage,
  recipientName,
  senderName,
}: {
  url: string;
  previewImage: string;
  recipientName: string;
  senderName: string;
}) {
  // The native share sheet exists only in some browsers (mostly phones); the server render assumes it doesn't.
  const canShare = useSyncExternalStore(
    noop,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);

  const first = recipientName.split(/\s+/)[0];
  const note = `${first}, I've sent you a little something from Harlow Brook Flowers.`;
  const host = url.replace(/^https?:\/\//, "").split("/")[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title: `A gift for ${first}`, text: note, url });
    } catch {
      // Dismissed: nothing to do.
    }
  };

  return (
    <div className="bg-paper p-6 ring-1 ring-line sm:p-8">
      <h3 className="t-h3">Send {first} their gift</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
        If you&apos;d like, send {first} a link to their own gift page, with your card and what&apos;s coming. Or keep it a
        surprise and give them the printed card. It&apos;s entirely up to you.
      </p>

      <figure className="mt-6 max-w-sm overflow-hidden bg-cream shadow-[0_18px_40px_-26px_rgba(42,34,29,0.5)] ring-1 ring-line">
        {/* eslint-disable-next-line @next/next/no-img-element -- the generated preview image, shown at its own size */}
        <img src={previewImage} alt="" width={1200} height={630} className="block aspect-[1200/630] w-full bg-linen object-cover" />
        <figcaption className="px-4 py-3">
          <span className="block text-[0.9375rem] font-medium">A gift of flowers for {first}</span>
          <span className="block text-[0.8125rem] text-muted">{host}</span>
        </figcaption>
      </figure>
      <p className="mt-2 text-[0.8125rem] text-muted">How the link looks in a message.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canShare ? (
          <Button onClick={share}>Share their gift</Button>
        ) : (
          <Button onClick={copy}>{copied ? "Link copied" : "Copy their gift link"}</Button>
        )}
        {canShare && (
          <Button variant="secondary" onClick={copy}>
            {copied ? "Link copied" : "Copy link"}
          </Button>
        )}
      </div>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
        <a href={`sms:?&body=${encodeURIComponent(`${note} ${url}`)}`} className="link-rule">
          Send by text
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(`A gift for you from ${senderName}`)}&body=${encodeURIComponent(`${note}\n\n${url}`)}`}
          className="link-rule"
        >
          Send by email
        </a>
        <a href={url} target="_blank" rel="noopener" className="link-rule">
          Open their page
        </a>
      </p>
      <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
        Only people with the link can open it. It shows your card and the plan, never the price or your email address.
      </p>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
