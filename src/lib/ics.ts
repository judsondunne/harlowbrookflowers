import { farmTimeToUtc } from "./time";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** A single-event iCalendar file for a pickup window. */
export function pickupIcs(input: { uid: string; date: string; startTime: string; endTime: string; summary: string; description: string; location: string }) {
  const start = farmTimeToUtc(input.date, input.startTime);
  const end = farmTimeToUtc(input.date, input.endTime);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Harlow Brook Flowers//Pickup//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.uid}@harlowbrookflowers.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(input.summary)}`,
    `DESCRIPTION:${escape(input.description)}`,
    `LOCATION:${escape(input.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
