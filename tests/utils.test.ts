import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/password";
import { addMonths, farmTimeToUtc, farmToday, formatTimeRange } from "@/lib/time";
import { formatMoney, formatPrice } from "@/lib/format";
import { lineKey } from "@/domain/cart-keys";
import { cartSchema, checkoutContactSchema, giftDetailsSchema } from "@/domain/cart";
import { pickupIcs } from "@/lib/ics";

describe("passwords", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });
});

describe("farm time", () => {
  it("converts Vermont wall-clock times across daylight saving", () => {
    expect(farmTimeToUtc("2026-07-04", "09:00").toISOString()).toBe("2026-07-04T13:00:00.000Z");
    expect(farmTimeToUtc("2026-12-05", "09:00").toISOString()).toBe("2026-12-05T14:00:00.000Z");
    expect(farmTimeToUtc("2026-11-01", "12:00").toISOString()).toBe("2026-11-01T17:00:00.000Z");
  });
  it("uses the farm's date, not UTC's", () => {
    expect(farmToday(new Date("2026-10-25T02:30:00Z"))).toBe("2026-10-24");
  });
  it("formats ranges and months", () => {
    expect(formatTimeRange("16:00", "18:30")).toBe("4:00 pm – 6:30 pm");
    expect(addMonths("2027-11", 3)).toBe("2028-02");
  });
});

describe("formatting", () => {
  it("formats prices", () => {
    expect(formatPrice(3500)).toBe("$35");
    expect(formatPrice(3550)).toBe("$35.50");
    expect(formatMoney(3500)).toBe("$35.00");
  });
});

describe("cart validation", () => {
  it("groups identical lines and separates different card messages", () => {
    expect(lineKey("p1")).toBe("p1");
    expect(lineKey("p1", "Happy birthday")).toBe(lineKey("p1", " Happy birthday "));
    expect(lineKey("p1", "Happy birthday")).not.toBe(lineKey("p1", "Thank you"));
    expect(lineKey("p1", undefined, true)).not.toBe(lineKey("p1", undefined, true));
  });
  it("rejects tampered carts", () => {
    expect(cartSchema.safeParse({ lines: [{ key: "a", productId: "p", quantity: -2 }] }).success).toBe(false);
    expect(cartSchema.safeParse({ lines: [{ key: "a", productId: "p", quantity: 1.5 }] }).success).toBe(false);
    expect(cartSchema.safeParse({ lines: Array.from({ length: 21 }, (_, i) => ({ key: `${i}`, productId: "p", quantity: 1 })) }).success).toBe(false);
  });
  it("validates checkout contact and gift details", () => {
    expect(checkoutContactSchema.safeParse({ name: "A", email: "x@y.co" }).success).toBe(false);
    const ok = checkoutContactSchema.parse({ name: "Avery Test", email: " Avery@Example.com " });
    expect(ok.email).toBe("avery@example.com");
    expect(giftDetailsSchema.safeParse({ recipientName: "M", senderName: "A", startMonth: "2027-13" }).success).toBe(false);
    expect(giftDetailsSchema.parse({ recipientName: "M", senderName: "A", startMonth: "2027-06", recipientEmail: "" }).recipientEmail).toBeUndefined();
  });
});

describe("calendar file", () => {
  it("produces a valid single-event calendar with UTC times", () => {
    const ics = pickupIcs({ uid: "o1", date: "2026-10-31", startTime: "09:00", endTime: "12:00", summary: "Pick up, flowers; HB", description: "Line 1\nLine 2", location: "Hartland" });
    expect(ics).toContain("DTSTART:20261031T130000Z");
    expect(ics).toContain("SUMMARY:Pick up\\, flowers\\; HB");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
