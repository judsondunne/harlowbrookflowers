import { z } from "zod";

/** Store-wide settings Sarah can edit from /admin/settings. Defaults are PROVISIONAL. */
export const settingsSchema = z.object({
  announcement: z.string().max(160).default(""),
  /** Master switch for taking orders. When false, the shop is browsable but checkout is closed. */
  salesOpen: z.boolean().default(true),
  /** Must be switched on by Sarah before live (non-test) payments are accepted. */
  catalogApproved: z.boolean().default(false),
  closedMessage: z
    .string()
    .max(300)
    .default("Online ordering is paused for now. Join the list and we'll write when pickups open."),
  pickupLocationPublic: z.string().max(160).default("At the farm in Hartland, Vermont"),
  /** Sent only after purchase (confirmation page + email). Never shown publicly. */
  pickupInstructions: z
    .string()
    .max(1200)
    .default("[Sarah to add the pickup address, parking and what to look for when you arrive.]"),
  /** Orders for a pickup window close this many hours before it starts. */
  orderCutoffHours: z.number().int().min(0).max(168).default(36),
  /** Basis points, e.g. 600 = 6%. 0 hides the tax line. Confirm obligations before launch. */
  taxRateBps: z.number().int().min(0).max(2000).default(0),
  seasonNote: z
    .string()
    .max(400)
    .default(
      "Our flowers grow outdoors in Vermont, so the season runs from early summer until the first hard frost. Bouquets change week to week with whatever is blooming.",
    ),
  orderNotificationEmail: z.string().max(254).default(""),
});

export type StoreSettings = z.infer<typeof settingsSchema>;
export const DEFAULT_SETTINGS: StoreSettings = settingsSchema.parse({});
export type SettingsKey = keyof StoreSettings;
