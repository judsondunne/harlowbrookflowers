import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

/** The 404 page body, shared by the root boundary (with site chrome) and the storefront group (inside it). */
export function NotFoundContent() {
  return (
    <section className="container-page grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-2">
      <div>
        <p className="t-eyebrow">Page not found</p>
        <h1 className="t-h1 mt-3">This page seems to have gone to seed.</h1>
        <p className="t-lead mt-6 max-w-md">
          The link may be old, or the page may have moved. The flowers, happily, are right where we left them.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
          <ButtonLink href="/shop">Shop bouquets</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back to the homepage
          </ButtonLink>
        </div>
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
        <span className="absolute inset-x-[10%] bottom-[8%] aspect-square rounded-full bg-butter" />
        <Image
          src="/images/bouquets/season-of-flowers.webp"
          alt="An airy cottage bouquet of snapdragons, scabiosa and chamomile"
          fill
          sizes="384px"
          className="object-contain object-bottom"
        />
      </div>
    </section>
  );
}
