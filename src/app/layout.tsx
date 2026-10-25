import type { Metadata, Viewport } from "next";
import { Gloock, Hanken_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Analytics } from "@/components/site/analytics";

// Gloock: the wordmark only (hero, logo, footer sign-off).
const gloock = Gloock({ weight: "400", subsets: ["latin"], variable: "--font-gloock", display: "swap" });
// Newsreader (with optical sizes): every heading, and book titles in italic. Hanken Grotesk: text and interface.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Harlow Brook Flowers · Seasonal Cut Flowers in Hartland, Vermont",
    template: "%s · Harlow Brook Flowers",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    images: [{ url: "/og/harlow-brook.jpg", width: 1200, height: 630, alt: "Harlow Brook Flowers, Hartland, Vermont" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, address: false, email: false },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  robots: site.indexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gloock.variable} ${newsreader.variable} ${hanken.variable}`}>
      <body className="min-h-dvh bg-cream antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
