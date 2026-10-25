/** Designs for the gift card that goes with a flower subscription (printed, on the gift page, and in link previews). */
export const CARD_STYLES = ["letterpress", "garden", "evening", "buttercup"] as const;
export type CardStyle = (typeof CARD_STYLES)[number];
export const DEFAULT_CARD_STYLE: CardStyle = "letterpress";

export const cardStyles: Record<CardStyle, { name: string; description: string }> = {
  letterpress: { name: "Letterpress", description: "Cream card, a fine inset rule" },
  garden: { name: "Garden", description: "Their bouquet on a butter circle" },
  evening: { name: "Evening", description: "Deep ink with cream lettering" },
  buttercup: { name: "Buttercup", description: "Soft butter yellow, all sunshine" },
};

/** A few ways to begin, for people who freeze at a blank card. */
export const MESSAGE_STARTERS = [
  "For every month you've made brighter.",
  "Something to look forward to, all summer long.",
  "Because you deserve flowers, and not just once.",
  "A little of the garden, from me to you.",
] as const;

export const isCardStyle = (v: unknown): v is CardStyle => typeof v === "string" && (CARD_STYLES as readonly string[]).includes(v);
