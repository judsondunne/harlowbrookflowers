import Image from "next/image";
import { SiteChrome } from "@/components/site/site-chrome";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="container-page grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-2">
        <div>
          <p className="t-eyebrow">404 · Off the garden path</p>
          <h1 className="t-h1 mt-5">This page seems to have gone to seed.</h1>
          <p className="t-lead mt-6 max-w-md">
            The link may be old, or the page may have moved. The flowers, happily, are right where we left them.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" arrow>
              Shop bouquets
            </ButtonLink>
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
    </SiteChrome>
  );
}
