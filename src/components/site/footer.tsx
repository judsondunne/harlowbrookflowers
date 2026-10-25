import Link from "next/link";
import { cacheLife } from "next/cache";
import { ButtonLink } from "@/components/ui/button";
import { SprigMark } from "@/components/ui/icons";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { footerNav, site } from "@/lib/site";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <Reveal y={36} className="container-page border-b border-paper/12 py-20 text-center sm:py-28">
        <SprigMark size={34} className="mx-auto mb-6 text-butter" />
        <p className="mx-auto max-w-3xl font-wordmark text-[clamp(2.6rem,5.6vw,5rem)] leading-[1.02] tracking-[-0.025em] text-paper">
          Bring a little of the garden home.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop" variant="light" size="lg" className="max-sm:w-full max-sm:max-w-xs">
            Shop bouquets
          </ButtonLink>
          <ButtonLink href="/subscriptions" variant="outline-light" size="lg" className="max-sm:w-full max-sm:max-w-xs">
            Give a season of flowers
          </ButtonLink>
        </div>
      </Reveal>

      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-wordmark text-[2.75rem] leading-[0.95] tracking-[-0.03em]">Harlow Brook Flowers</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/65">
            Seasonal flowers grown and picked by hand on a family farm in {site.location.locality},{" "}
            {site.location.regionName}.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-5 inline-block text-sm underline decoration-paper/30 underline-offset-4 hover:decoration-paper"
          >
            {site.email}
          </a>
        </div>

        <nav aria-label="Shop" className="md:col-span-2">
          <p className="text-[0.8125rem] font-medium text-paper/50">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerNav.shop.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/80 hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="The farm" className="md:col-span-2">
          <p className="text-[0.8125rem] font-medium text-paper/50">The farm</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerNav.farm.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/80 hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative md:col-span-4">
          <p className="text-[0.8125rem] font-medium text-paper/50">Hear when pickups open</p>
          <p className="mt-4 mb-4 text-sm text-paper/70">
            A short note when new pickup dates are posted. Never more than a few a season.
          </p>
          <NewsletterForm source="footer" tone="dark" />
        </div>
      </div>

      <div className="container-page flex flex-col gap-4 border-t border-paper/12 py-7 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <CopyrightYear /> {site.name} · {site.location.locality}, {site.location.regionName}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {footerNav.legal.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-paper">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
