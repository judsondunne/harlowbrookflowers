import { getGiftByShareToken } from "@/server/gifts";
import { cutoutFor, shareCard } from "@/lib/og";

/** The recipient's link preview: their card, in the design the giver chose. Served at /gift/[token]/card. */
export async function GET(_request: Request, { params }: RouteContext<"/gift/[token]/card">) {
  const found = await getGiftByShareToken((await params).token);
  if (!found) return shareCard({ title: "Harlow Brook", visual: { kind: "hero", bouquet: "garden-bouquet.png" } });
  const { gift, image, design } = found;
  const first = gift.recipientName.trim().split(/\s+/)[0];
  return shareCard({
    kicker: `A gift from ${gift.senderName}`,
    title: `${first}, a season of flowers is on its way.`,
    subtitle: `${gift.planName} from a family flower farm in Hartland, Vermont.`,
    visual: {
      kind: "gift",
      gift: {
        design,
        planName: gift.planName,
        recipient: gift.recipientName,
        sender: gift.senderName,
        message: gift.message,
        bouquet: cutoutFor(image),
      },
    },
  });
}
