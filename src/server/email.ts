import "server-only";
import { db as defaultDb, schema, type Database } from "./db/client";
import { siteOrigin } from "./config";
import { giftPageUrl } from "./gifts";
import type { OrderDetail } from "./orders";
import type { StoreSettings } from "@/domain/settings";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { formatDateLong, formatMonth, formatTimeRange } from "@/lib/time";
import { site } from "@/lib/site";

type Email = { to: string; subject: string; text: string; replyTo?: string };

/**
 * Sends through Resend when RESEND_API_KEY is set. Every message is also written to the outbox
 * (visible in /admin/settings) so nothing is silently lost while email isn't configured.
 */
export async function sendEmail(email: Email, db: Database = defaultDb) {
  const key = process.env.RESEND_API_KEY?.trim();
  const id = crypto.randomUUID();
  let status: "logged" | "sent" | "failed" = "logged";
  let error = "";
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? `${site.name} <orders@harlowbrookflowers.com>`,
          to: [email.to],
          subject: email.subject,
          text: email.text,
          ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        }),
      });
      status = res.ok ? "sent" : "failed";
      if (!res.ok) error = `${res.status} ${(await res.text()).slice(0, 300)}`;
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
    }
  } else if (process.env.NODE_ENV !== "test") {
    console.info(`[email:logged] to=${email.to} subject="${email.subject}"`);
  }
  await db.insert(schema.emailOutbox).values({
    id,
    to: email.to,
    subject: email.subject,
    text: email.text,
    status,
    provider: key ? "resend" : "outbox",
    error,
  });
  return status;
}

function itemLines(detail: OrderDetail) {
  return detail.items
    .map((i) => {
      const base = `• ${i.quantity} × ${i.productName} — ${formatMoney(i.lineTotalCents)}`;
      const extras = [
        i.cardMessage ? `  Card: "${i.cardMessage}"` : "",
        i.gift ? `  Gift for ${i.gift.recipientName}, from ${i.gift.senderName}, starting ${formatMonth(i.gift.startMonth)}` : "",
      ].filter(Boolean);
      return [base, ...extras].join("\n");
    })
    .join("\n");
}

export function orderConfirmationEmail(detail: OrderDetail, settings: StoreSettings): Email {
  const { order, window } = detail;
  const number = formatOrderNumber(order.number);
  const link = `${siteOrigin()}/order/success?token=${order.publicToken}`;
  const pickup = window
    ? `PICKUP\n${formatDateLong(window.date)}, ${formatTimeRange(window.startTime, window.endTime)}\n${settings.pickupLocationPublic}\n\n${settings.pickupInstructions}`
    : "";
  const giftLinks = detail.gifts
    .filter((g) => g.shareToken)
    .map((g) => `${g.recipientName}'s gift page, to send them if you'd like: ${giftPageUrl(g.shareToken!)}`);
  const gifts = detail.items.some((i) => i.kind === "subscription")
    ? [
        "GIFT SUBSCRIPTIONS",
        "Sarah will email each month's pickup dates before the season begins. Recipients collect their bouquets in Hartland.",
        ...giftLinks,
      ].join("\n")
    : "";
  return {
    to: order.customerEmail,
    subject: `Your Harlow Brook order ${number}`,
    replyTo: site.email,
    text: [
      `Hi ${order.customerName.split(" ")[0]},`,
      "",
      `Thank you for your order. Here are the details for ${number}.`,
      "",
      itemLines(detail),
      order.taxCents ? `Tax: ${formatMoney(order.taxCents)}` : "",
      `Total paid: ${formatMoney(order.totalCents)}`,
      "",
      pickup,
      gifts,
      "",
      "Bouquets are made from whatever is blooming that week, so yours will be one of a kind.",
      `View your order: ${link}`,
      "",
      `Questions? Reply to this email or write to ${site.email}.`,
      "",
      "Harlow Brook Flowers · Hartland, Vermont",
    ]
      .filter((l) => l !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n"),
  };
}

export function orderNotificationEmail(detail: OrderDetail, to: string): Email {
  const { order, window } = detail;
  return {
    to,
    subject: `New order ${formatOrderNumber(order.number)} — ${formatMoney(order.totalCents)}${order.isDemo ? " (DEMO)" : ""}`,
    text: [
      `${order.customerName} <${order.customerEmail}> ${order.customerPhone}`,
      window ? `Pickup: ${formatDateLong(window.date)}, ${formatTimeRange(window.startTime, window.endTime)}` : "No pickup (gift subscription only)",
      "",
      itemLines(detail),
      order.customerNote ? `\nCustomer note: ${order.customerNote}` : "",
      order.needsAttention ? `\nNEEDS ATTENTION: ${order.attentionNote}` : "",
      `\nManage: ${siteOrigin()}/admin/orders/${order.id}`,
    ].join("\n"),
  };
}

export function giftRecipientEmail(gift: {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  planName: string;
  startMonth: string;
  /** The recipient's gift page, when one exists. */
  link?: string;
}): Email {
  return {
    to: gift.recipientEmail,
    subject: `${gift.senderName} has given you a season of flowers`,
    replyTo: site.email,
    text: [
      `Dear ${gift.recipientName},`,
      "",
      `${gift.senderName} has given you ${gift.planName} from Harlow Brook Flowers, a small family flower farm in Hartland, Vermont.`,
      "",
      gift.message ? `Their note:\n"${gift.message}"\n` : "",
      `Your first bouquet will be ready in ${formatMonth(gift.startMonth)}. Sarah will write before then with pickup dates in Hartland so you can choose one that suits you.`,
      "",
      gift.link ? `See your gift and your card: ${gift.link}\n` : "",
      "With warm wishes from the garden,",
      "Harlow Brook Flowers",
    ].join("\n"),
  };
}
