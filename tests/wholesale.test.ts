import { describe, expect, it } from "vitest";
import { wholesaleInquirySchema } from "@/domain/wholesale";

const valid = {
  contactName: "Ada Farmer",
  businessName: "Hartland General Store",
  email: "  Ada@Example.com ",
  phone: "",
  businessType: "Farm stand or general store",
  location: "Hartland, VT",
  intendedUse: "",
  quantity: "",
  startDate: "",
  details: "",
};

describe("wholesale inquiry validation", () => {
  it("accepts the required fields alone and normalizes the email", () => {
    const r = wholesaleInquirySchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.email).toBe("ada@example.com");
  });

  it("requires a name, business, valid email, business type and town", () => {
    const r = wholesaleInquirySchema.safeParse({ ...valid, contactName: "", businessName: " ", email: "nope", businessType: "Spaceport", location: "" });
    expect(r.success).toBe(false);
    const fields = new Set(r.error?.issues.map((i) => String(i.path[0])));
    expect([...fields].sort()).toEqual(["businessName", "businessType", "contactName", "email", "location"]);
  });

  it("keeps optional fields optional but bounded", () => {
    expect(wholesaleInquirySchema.safeParse({ ...valid, intendedUse: "Resale to customers", quantity: "12 bouquets every Friday" }).success).toBe(true);
    expect(wholesaleInquirySchema.safeParse({ ...valid, intendedUse: "Something invented" }).success).toBe(false);
    expect(wholesaleInquirySchema.safeParse({ ...valid, details: "x".repeat(3001) }).success).toBe(false);
  });
});
