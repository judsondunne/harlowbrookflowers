import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { Photo } from "@/components/home/sections";
import { Eyebrow } from "@/components/ui/typography";
import { IconMail, IconPin } from "@/components/ui/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Harlow Brook Flowers · Hartland, Vermont",
  description:
    "Questions about an order, pickup in Hartland, gift subscriptions or flowers for an event? Send Sarah a note.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <div className="container-page grid gap-14 pt-14 pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="t-h1 mt-5">Write to the farm.</h1>
          <p className="t-lead mt-6">
            Questions about an order or pickup, a gift, or flowers for something special? Sarah reads every message herself.
          </p>
          <ul className="mt-10 space-y-5 border-t border-line pt-8 text-[0.9375rem]">
            <li className="flex items-start gap-3">
              <IconMail size={20} className="mt-0.5 text-olive" />
              <span>
                <span className="block font-semibold">Email</span>
                <a href={`mailto:${site.email}`} className="text-ink-soft underline underline-offset-4 hover:text-ink">
                  {site.email}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconPin size={20} className="mt-0.5 text-olive" />
              <span>
                <span className="block font-semibold">
                  {site.location.locality}, {site.location.regionName}
                </span>
                <span className="text-ink-soft">
                  Pickup by appointment only. The address is shared with your order confirmation.
                </span>
              </span>
            </li>
          </ul>
          <p className="mt-8 text-sm text-muted">
            Many answers are already in the{" "}
            <Link href="/faq" className="underline underline-offset-4">
              FAQ
            </Link>
            .
          </p>
          <Photo src="/images/photos/farmhouse-pond.webp" className="mt-12 hidden aspect-[4/3] lg:block" sizes="40vw" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
