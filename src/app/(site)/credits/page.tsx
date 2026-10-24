import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/ui/typography";
import { assetManifest } from "@/content/asset-manifest";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Photography Credits",
  description: "Credits for the sample photography used on the Harlow Brook Flowers website.",
  path: "/credits",
});

export default function CreditsPage() {
  const seen = new Set<string>();
  const unique = assetManifest.filter((a) => (seen.has(a.source) ? false : (seen.add(a.source), true)));
  return (
    <>
      <PageIntro eyebrow="Credits" title="Photography">
        <p>
          While Sarah&apos;s own photographs of the farm are on their way, this site uses sample photography from talented
          photographers on Unsplash, used under the Unsplash License. Thank you to each of them.
        </p>
      </PageIntro>
      <ul className="container-page grid gap-x-6 gap-y-8 pb-24 sm:grid-cols-3 lg:grid-cols-4">
        {unique.map((a) => (
          <li key={a.source}>
            <div className="img-well relative aspect-[4/3] overflow-hidden">
              <Image src={a.src} alt="" fill sizes="(max-width:640px) 90vw, 25vw" className="object-cover" />
            </div>
            <p className="mt-3 text-sm">
              Photo by <span className="font-semibold">{a.photographer}</span>
            </p>
            <a href={a.source} target="_blank" rel="noopener" className="text-xs text-muted underline underline-offset-2">
              View on Unsplash
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
