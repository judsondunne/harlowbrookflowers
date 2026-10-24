import { db } from "@/server/db/client";
import { getOrderByToken } from "@/server/orders";
import { loadSettings } from "@/server/settings";
import { pickupIcs } from "@/lib/ics";
import { formatOrderNumber } from "@/lib/format";

/** Calendar file for a paid order's pickup. The unguessable order token is the only key. */
export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[token]/calendar">) {
  const { token } = await ctx.params;
  const detail = await getOrderByToken(db, token);
  if (!detail?.window || !["paid", "ready", "picked_up"].includes(detail.order.status)) {
    return new Response("Not found", { status: 404 });
  }
  const settings = await loadSettings();
  const body = pickupIcs({
    uid: detail.order.id,
    date: detail.window.date,
    startTime: detail.window.startTime,
    endTime: detail.window.endTime,
    summary: `Pick up flowers · Harlow Brook (${formatOrderNumber(detail.order.number)})`,
    description: `${settings.pickupLocationPublic}\n${settings.pickupInstructions}`,
    location: settings.pickupLocationPublic,
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="harlow-brook-pickup-${detail.order.number}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
