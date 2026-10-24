import { getSettings } from "@/server/settings";

/**
 * Sarah's own site-wide announcement, set in /admin/settings (empty by default, so nothing renders).
 * Demo and test payment modes are deliberately not announced here: they are disclosed in the cart and at
 * checkout, where they matter, and the payment safeguards themselves live in server/config.ts.
 */
export async function Announcement() {
  const { announcement } = await getSettings();
  if (!announcement) return null;
  return (
    <div className="bg-ink px-4 py-2.5 text-center text-[0.8125rem] leading-snug text-paper/85">
      <p className="mx-auto max-w-5xl">{announcement}</p>
    </div>
  );
}
