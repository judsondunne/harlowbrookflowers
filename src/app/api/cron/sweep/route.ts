import { revalidateTag } from "next/cache";
import { db } from "@/server/db/client";
import { sweepExpiredOrders } from "@/server/orders";

/** Releases stock held by abandoned checkouts. Schedule it (e.g. Vercel Cron) with CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const released = await db.transaction((tx) => sweepExpiredOrders(tx, new Date()));
  if (released > 0) revalidateTag("catalog", "max");
  return Response.json({ released });
}
