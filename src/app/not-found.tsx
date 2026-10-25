import { SiteChrome } from "@/components/site/site-chrome";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Unmatched URLs: rendered outside the storefront layout, so it brings its own header and footer. */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
