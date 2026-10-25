import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { primaryImage, productAvailability, type Product } from "@/domain/catalog";
import { formatPrice, cn } from "@/lib/format";
import { formatDateShort } from "@/lib/time";
import { QuickAdd } from "./quick-add";
import { buttonClass } from "@/components/ui/button";

export function availabilityLabel(product: Product, today: string) {
  const a = productAvailability(product, today);
  if (a.state === "sold_out") return { text: "Sold out", tone: "muted" as const };
  if (a.state === "out_of_season") return { text: a.opensOn ? `Available from ${formatDateShort(a.opensOn)}` : "Out of season", tone: "muted" as const };
  if (a.state === "available" && a.remaining !== null && a.remaining <= 5) return { text: `Only ${a.remaining} left`, tone: "ink" as const };
  return null;
}

/** Bouquet card: the transparent cutout stands in a cream well, scaled to communicate its real size. */
export function ProductCard({
  product,
  today,
  priority = false,
  className,
}: {
  product: Product;
  today: string;
  priority?: boolean;
  className?: string;
}) {
  const image = primaryImage(product, "cutout");
  const availability = productAvailability(product, today);
  const badge = availabilityLabel(product, today);
  const href = (product.kind === "subscription" ? `/subscriptions?plan=${product.slug}#gift` : `/shop/${product.slug}`) as Route;
  const perBouquet = product.deliveries ? Math.round(product.priceCents / product.deliveries) : null;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-paper" tabIndex={-1} aria-hidden>
        <span className="absolute inset-x-[14%] bottom-[9%] aspect-square rounded-full bg-linen transition-transform duration-[1.2s] ease-(--ease-out-quint) group-hover:scale-105" />
        <span className="absolute inset-x-[22%] bottom-[5%] h-4 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,34,29,.18),transparent)] blur-[3px]" />
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
            className={cn(
              "transition-transform duration-[1.1s] ease-(--ease-out-quint) group-hover:-translate-y-1.5",
              image.kind === "cutout" ? "object-contain object-bottom px-[8%] pt-[8%] pb-[6%]" : "object-cover",
            )}
            style={image.kind === "cutout" ? { scale: product.displayScale, transformOrigin: "50% 94%" } : undefined}
          />
        )}
        {badge && (
          <span
            className={cn(
              "absolute top-3 left-3 px-2 py-1 text-[0.75rem] leading-none font-medium",
              badge.tone === "ink" ? "bg-ink text-paper" : "bg-cream text-muted",
            )}
          >
            {badge.text}
          </span>
        )}
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display font-medium text-[1.5rem] leading-tight">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{product.tagline}</p>
        </div>
        <p className="shrink-0 pt-1 text-[1.0625rem] tabular-nums">{formatPrice(product.priceCents)}</p>
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
        <span className="text-[0.8125rem] text-muted">
          {perBouquet ? `${product.deliveries} bouquets · ${formatPrice(perBouquet)} each` : product.sizeLabel}
        </span>
        {product.kind === "bouquet" ? (
          <QuickAdd productId={product.id} name={product.name} disabled={availability.state !== "available"} />
        ) : (
          <Link href={href} className={buttonClass("secondary", "sm")}>
            Give as a gift
          </Link>
        )}
      </div>
    </article>
  );
}
