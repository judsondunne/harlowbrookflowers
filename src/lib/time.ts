/** Date helpers pinned to the farm's time zone (America/New_York). Isomorphic and dependency-free. */

export const FARM_TZ = "America/New_York";

function partsIn(at: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute"), s: get("second") };
}

/** Today's date (YYYY-MM-DD) at the farm. */
export function farmToday(now = new Date(), tz = FARM_TZ): string {
  const { y, m, d } = partsIn(now, tz);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function offsetMinutes(at: Date, tz: string) {
  const p = partsIn(at, tz);
  return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - at.getTime()) / 60000);
}

/** Converts a farm-local wall time to the UTC instant. Handles DST transitions. */
export function farmTimeToUtc(date: string, time: string, tz = FARM_TZ): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = offsetMinutes(new Date(guess), tz);
  let utc = guess - first * 60000;
  const second = offsetMinutes(new Date(utc), tz);
  if (second !== first) utc = guess - second * 60000;
  return new Date(utc);
}

const DATE_LONG = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const DATE_SHORT = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

function isoDateToUtcNoon(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "Saturday, November 7" */
export function formatDateLong(date: string) {
  return DATE_LONG.format(isoDateToUtcNoon(date));
}

/** "Sat, Nov 7" */
export function formatDateShort(date: string) {
  return DATE_SHORT.format(isoDateToUtcNoon(date));
}

/** "June 2027" from "2027-06" */
export function formatMonth(month: string) {
  return MONTH_YEAR.format(isoDateToUtcNoon(`${month}-01`));
}

/** "9:00 am" from "09:00" */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "9:00 am – 12:00 pm" */
export function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Adds whole months to a YYYY-MM string. */
export function addMonths(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
