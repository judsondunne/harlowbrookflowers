import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata = { title: "Page not found", robots: { index: false } };

/** notFound() inside the storefront: the (site) layout already provides the header, footer and <main>. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
