import Image from "next/image";
import { asset } from "@/content/asset-manifest";
import { cn } from "@/lib/format";
import { SampleTag } from "./typography";

/** A cropped photograph from the asset manifest (alt text comes from the manifest). */
export function Photo({
  src,
  className,
  sizes,
  sample = true,
  priority,
  position,
}: {
  src: string;
  className?: string;
  sizes: string;
  sample?: boolean;
  priority?: boolean;
  /** CSS object-position, for crops that need to favor one side. */
  position?: string;
}) {
  const a = asset(src);
  return (
    <div className={cn("img-well relative overflow-hidden", className)}>
      <Image src={src} alt={a?.alt ?? ""} fill sizes={sizes} priority={priority} className="object-cover" style={position ? { objectPosition: position } : undefined} />
      {sample && a?.provisional && <SampleTag />}
    </div>
  );
}
