import { z } from "zod";
import { WHOLESALE_BUSINESS_TYPES, WHOLESALE_USES } from "@/content/wholesale";

const optional = (max: number) => z.string().trim().max(max).default("");

/** A wholesale inquiry from /wholesale. Only who, where and what kind of business are required. */
export const wholesaleInquirySchema = z.object({
  contactName: z.string().trim().min(2, "Please tell us your name.").max(100),
  businessName: z.string().trim().min(2, "Please add your business name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  phone: optional(40),
  businessType: z.enum(WHOLESALE_BUSINESS_TYPES, { message: "Choose the closest match." }),
  location: z.string().trim().min(2, "Which town is your business in?").max(120),
  intendedUse: z.union([z.enum(WHOLESALE_USES), z.literal("")]).default(""),
  quantity: optional(300),
  startDate: optional(80),
  details: optional(3000),
});

export type WholesaleInquiry = z.infer<typeof wholesaleInquirySchema>;

export const WHOLESALE_FIELDS = Object.keys(wholesaleInquirySchema.shape) as (keyof WholesaleInquiry)[];
