import { getSettings } from "@/server/settings";
import { paymentMode } from "@/server/config";

/** Honest site-wide notice: demo/test mode and provisional catalog, or Sarah's own announcement. */
export async function PreviewBanner() {
  const [settings, mode] = [await getSettings(), paymentMode()];
  let text = settings.announcement;
  if (mode === "demo") {
    text = "Preview site · Products, prices and pickup dates are provisional, and checkout is a demonstration. No payment is taken.";
  } else if (mode === "stripe_test") {
    text = "Test mode · Payments use Stripe test cards only. No real charges are made.";
  }
  if (!text) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-[0.75rem] leading-snug text-paper/85">
      <p className="mx-auto max-w-5xl">{text}</p>
    </div>
  );
}
