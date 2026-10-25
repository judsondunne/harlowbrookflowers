"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/domain/catalog";
import { cn } from "@/lib/format";
import { SampleTag } from "@/components/ui/typography";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  if (!current) return null;
  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        {images.map((img, i) => (
          <div
            key={img.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-(--ease-out-quint)",
              i === active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== active}
          >
            {img.kind === "cutout" && (
              <>
                <span className="absolute inset-x-[14%] bottom-[9%] aspect-square rounded-full bg-linen" />
                <span className="absolute inset-x-[24%] bottom-[5%] h-5 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,34,29,.18),transparent)] blur-[3px]" />
              </>
            )}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={img.kind === "cutout" ? "object-contain object-bottom px-[10%] pt-[8%] pb-[6%]" : "object-cover"}
            />
          </div>
        ))}
        {current.provisional && <SampleTag label="Sample photo · yours will vary" />}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label={`${name} photos`}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className={cn(
                  "relative block size-20 overflow-hidden bg-paper ring-1 transition sm:size-24",
                  i === active ? "ring-ink" : "ring-line hover:ring-ink/40",
                )}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="96px"
                  className={img.kind === "cutout" ? "object-contain p-1.5" : "object-cover"}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
