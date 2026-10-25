import { z } from "zod";
import { CARD_STYLES } from "./gift-card";

/** Cart shapes shared by the client cart store and the server, which re-validates everything. */

const trimmed = (max: number) => z.string().trim().max(max);

export const giftDetailsSchema = z.object({
  recipientName: trimmed(80).min(1, "Add the recipient's name."),
  recipientEmail: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().toLowerCase().email("Enter a valid email address.").max(254).optional(),
  ),
  senderName: trimmed(80).min(1, "Add your name as it should appear on the card."),
  message: trimmed(500).optional().default(""),
  startMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a starting month."),
  notifyRecipient: z.boolean().default(false),
  /** Optional: older carts and orders predate card designs, and get the classic Letterpress card. */
  cardStyle: z.enum(CARD_STYLES).optional(),
});
export type GiftDetails = z.infer<typeof giftDetailsSchema>;

export const cartLineSchema = z.object({
  key: z.string().min(1).max(64),
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(24),
  cardMessage: trimmed(300).optional(),
  gift: giftDetailsSchema.optional(),
});
export type CartLine = z.infer<typeof cartLineSchema>;

export const cartSchema = z.object({
  lines: z.array(cartLineSchema).max(20),
  pickupWindowId: z.string().max(64).optional(),
});
export type Cart = z.infer<typeof cartSchema>;

export const checkoutContactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(32)
    .regex(/^[0-9+().\-\s]*$/, "Use digits, spaces and + ( ) - only.")
    .optional()
    .default(""),
  note: trimmed(500).optional().default(""),
  marketingOptIn: z.boolean().default(false),
});
export type CheckoutContact = z.infer<typeof checkoutContactSchema>;

export { lineKey } from "./cart-keys";
