import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { primaryImage, productAvailability, type Product } from "@/domain/catalog";
import { formatPrice, cn } from "@/lib/format";
import { formatDateShort } from "@/lib/time";
import { QuickAdd } from "./quick-add";

export function availabilityLabel(product: Product, today: string) {
  const a = productAvailability(product, today);
  if (a.state === "sold_out") return { text: "Sold out", tone: "muted" as const };
  if (a.state === "out_of_season") return { text: a.opensOn ? `Available from ${formatDateShort(a.opensOn)}` : "Out of season", tone: "muted" as const };
  if (a.state === "available" && a.remaining !== null && a.remaining <= 5) return { text: `Only ${a.remaining} left`, tone: "ink" as const };
  return null;
}

/** "Medium · about 20 stems" → ["Medium", "About 20 stems"]. */
function splitSize(label: string): [string, string] {
  const [size, ...rest] = label.split("·").map((s) => s.trim());
  const detail = rest.join(" · ");
  return [size, detail ? detail.charAt(0).toUpperCase() + detail.slice(1) : ""];
}

/**
 * Bouquet card. The cutout stands on the butter circle, scaled to its real size against the others; on devices
 * with hover, the styled photograph fades in and an add-to-cart bar rises from the bottom of the frame. Touch
 * devices get the button beside the details instead.
 */
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
  const cutout = primaryImage(product, "cutout");
  const photo = product.images.find((i) => i.kind === "photo") ?? null;
  const availability = productAvailability(product, today);
  const purchasable = availability.state === "available";
  const badge = availabilityLabel(product, today);
  const isGift = product.kind === "subscription";
  const href = (isGift ? `/subscriptions?plan=${product.slug}#gift` : `/shop/${product.slug}`) as Route;
  const perBouquet = product.deliveries ? Math.round(product.priceCents / product.deliveries) : null;
  const [size, stems] = splitSize(product.sizeLabel);
  const detail = perBouquet ? `${formatPrice(perBouquet)} a bouquet, paid once` : stems;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-linen/60">
        <Link href={href} className="absolute inset-0 block" tabIndex={-1} aria-hidden>
          <span className="absolute inset-x-[13%] bottom-[10%] aspect-square rounded-full bg-butter transition-transform duration-[1.2s] ease-(--ease-out-quint) group-hover:scale-[1.04]" />
          <span className="absolute inset-x-[22%] bottom-[6%] h-4 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,34,29,.2),transparent)] blur-[3px]" />
          {cutout && (
            <Image
              src={cutout.src}
              alt={cutout.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
              className={cn(
                "transition-transform duration-[1.1s] ease-(--ease-out-quint) group-hover:-translate-y-1.5",
                cutout.kind === "cutout" ? "object-contain object-bottom px-[8%] pt-[10%] pb-[7%]" : "object-cover",
              )}
              style={cutout.kind === "cutout" ? { scale: product.displayScale, transformOrigin: "50% 93%" } : undefined}
            />
          )}
          {photo && cutout?.kind === "cutout" && (
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
              className="scale-[1.06] object-cover opacity-0 transition-[opacity,scale] duration-700 ease-(--ease-out-quint) [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </Link>

        <span className="pointer-events-none absolute top-4 left-4 text-[0.8125rem] font-medium text-ink/75 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-0">
          {size}
        </span>
        {badge && (
          <span
            className={cn(
              "pointer-events-none absolute top-3.5 right-3.5 px-2 py-1 text-[0.75rem] leading-none font-medium",
              badge.tone === "ink" ? "bg-ink text-paper" : "bg-cream text-muted",
            )}
          >
            {badge.text}
          </span>
        )}

        {!isGift && (
          <div className="absolute inset-x-3 bottom-3 z-20 hidden translate-y-[calc(100%+0.75rem)] transition-transform duration-500 ease-(--ease-out-quint) group-focus-within:translate-y-0 group-hover:translate-y-0 [@media(hover:hover)]:block">
            <QuickAdd variant="bar" productId={product.id} name={product.name} priceCents={product.priceCents} disabled={!purchasable} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.5rem] leading-tight font-medium">
          <Link href={href} className="decoration-1 underline-offset-[0.2em] after:absolute after:inset-0 after:content-[''] hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 font-display text-[1.25rem] font-medium tabular-nums">{formatPrice(product.priceCents)}</p>
      </div>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{product.tagline}</p>
      <div className="relative z-10 mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-[0.8125rem] text-muted">{detail}</span>
        {isGift ? (
          <Link href={href} className="link-rule min-h-0">
            Give as a gift
          </Link>
        ) : (
          <QuickAdd productId={product.id} name={product.name} disabled={!purchasable} className="[@media(hover:hover)]:hidden" />
        )}
      </div>
    </article>
  );
}
