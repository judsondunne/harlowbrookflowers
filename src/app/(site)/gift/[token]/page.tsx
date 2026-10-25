import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { GiftCardFace } from "@/components/subscriptions/gift-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";
import { getGiftByShareToken, giftCardImagePath } from "@/server/gifts";
import { formatMonth } from "@/lib/time";
import { cn, numberWord } from "@/lib/format";
import { site } from "@/lib/site";

// Every gift page is private and per-person, so it renders on request; the shared header may block for it.
export const instant = false;

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
const firstName = (name: string) => name.trim().split(/\s+/)[0];

/** Private page: whoever holds the link sees it, search engines never do. */
export async function generateMetadata({ params }: PageProps<"/gift/[token]">): Promise<Metadata> {
  const { token } = await params;
  const found = await getGiftByShareToken(token);
  const robots = { index: false, follow: false };
  if (!found) return { title: "Gift not found", robots };
  const { gift } = found;
  const title = `A gift of flowers for ${firstName(gift.recipientName)}`;
  const description = `${gift.senderName} has given you ${gift.planName} from Harlow Brook Flowers in Hartland, Vermont.`;
  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.name,
      locale: site.locale,
      images: [{ url: giftCardImagePath(token), width: 1200, height: 630, alt: `${gift.planName}, a gift for ${firstName(gift.recipientName)}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [giftCardImagePath(token)] },
  };
}

export default function GiftPage({ params }: PageProps<"/gift/[token]">) {
  return (
    <Suspense fallback={<div className="container-page h-[80vh]" aria-hidden />}>
      <Gift params={params} />
    </Suspense>
  );
}

async function Gift({ params }: { params: PageProps<"/gift/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  const found = await getGiftByShareToken(token);
  if (!found) notFound();
  const { gift, image, endMonth, design } = found;
  const first = firstName(gift.recipientName);
  const from = gift.senderName;

  if (gift.status === "cancelled") {
    return (
      <section className="container-page max-w-2xl py-24 text-center">
        <h1 className="t-h2">This gift is no longer active.</h1>
        <p className="t-lead mt-5">
          If you think that&apos;s a mistake, write to{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>{" "}
          and we&apos;ll sort it out.
        </p>
      </section>
    );
  }

  const months = gift.deliveriesTotal > 1 ? `${formatMonth(gift.startMonth)} to ${formatMonth(endMonth)}` : formatMonth(gift.startMonth);
  const bouquets = `${numberWord(gift.deliveriesTotal)} Garden Bouquet${gift.deliveriesTotal === 1 ? "" : "s"}`;
  const dates = gift.recipientEmail
    ? "Before the season begins, Sarah will email you each month's pickup dates."
    : `Before the season begins, Sarah will send ${from} each month's pickup dates to pass on to you.`;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-16 pt-10 pb-20 sm:pt-14 lg:grid-cols-12 lg:gap-12 lg:pb-28">
          <div className="lg:order-2 lg:col-span-6 lg:col-start-7">
            <div className="relative mx-auto w-full max-w-[27rem] pt-10 sm:pt-6">
              <span aria-hidden className="gift-bloom absolute -top-6 -right-10 size-64 rounded-full bg-butter sm:size-80" />
              {image && design !== "garden" && (
                <div aria-hidden className="gift-float absolute -top-16 -right-4 z-10 h-56 w-44 sm:-right-14 sm:h-64 sm:w-52">
                  <Image src={image} alt="" fill sizes="208px" className="object-contain object-bottom" priority />
                </div>
              )}
              <div className="gift-card-arrive relative z-20">
                <GiftCardFace
                  size="lg"
                  design={design}
                  image={image}
                  planName={gift.planName}
                  detail={`${bouquets} · ${months}`}
                  recipient={gift.recipientName}
                  message={gift.message ? `“${gift.message}”` : "A season of flowers, picked with care."}
                  sender={from}
                />
              </div>
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-6">
            <Eyebrow className="enter-rise">A gift from {from}</Eyebrow>
            <h1 className="t-h1 enter-rise mt-3" style={d(80)}>
              {first}, a season of flowers is on its way.
            </h1>
            <p className="t-lead enter-rise mt-6 max-w-xl" style={d(180)}>
              {from} has given you {gift.planName}: {bouquets}, grown and picked by hand in our garden in Hartland,
              Vermont, one each month from {months}.
            </p>
            <dl className="enter-rise mt-10 grid max-w-xl gap-px bg-line sm:grid-cols-3" style={d(280)}>
              {[
                ["Your flowers", bouquets.charAt(0).toUpperCase() + bouquets.slice(1)],
                ["When", months],
                ["Where", "At the farm in Hartland, Vermont"],
              ].map(([term, value]) => (
                <div key={term} className="bg-cream py-4 sm:pr-5 sm:not-first:pl-5">
                  <dt className="t-eyebrow">{term}</dt>
                  <dd className="mt-1 font-display text-[1.1875rem] leading-snug font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-title" className="border-t border-line bg-paper">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h2 id="next-title" className="t-h2">
              What happens next
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="grid gap-x-10 sm:grid-cols-3 lg:col-span-8">
            {[
              ["The pickup dates", dates],
              ["Choose a day", "Each month, pick the pickup day that suits you. There's nothing to pay and nothing to sign up for."],
              ["Take your flowers home", "Stop by the farm, give your name, and take home a bouquet picked for that day."],
            ].map(([title, text]) => (
              <RevealItem as="li" key={title} className="border-t border-ink py-6">
                <h3 className="t-h3">{title}</h3>
                <p className="mt-3 text-[0.9688rem] leading-relaxed text-ink-soft">{text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="container-page py-20 text-center sm:py-24">
        <Reveal>
          <p className="font-wordmark text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.025em]">
            Grown slowly, given joyfully.
          </p>
          <p className="mx-auto mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-ink-soft">
            Harlow Brook is a small family flower farm in Hartland, run by Sarah Stewart Taylor. Everything in your
            bouquets grows in her garden, outdoors, in the Vermont season.
          </p>
          <div className={cn("mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3")}>
            <ButtonLink href="/about" variant="secondary">
              Meet the farm
            </ButtonLink>
            <Link href="/faq" className="link-rule">
              Questions about pickup
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
