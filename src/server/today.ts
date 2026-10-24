import "server-only";
import { cacheLife } from "next/cache";
import { farmToday } from "@/lib/time";

/** The farm's current date, shared across requests and refreshed hourly (for seasonal display states). */
export async function getFarmToday() {
  "use cache";
  cacheLife("hours");
  return farmToday();
}
