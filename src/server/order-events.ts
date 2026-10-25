import "server-only";
import { giftPageUrl } from "./gifts";
import { revalidateTag } from "next/cache";
import { db as defaultDb, schema, type Database } from "./db/client";
import { loadOrderDetail, markOrderPaid, type OrderRow } from "./orders";
import { loadSettings } from "./settings";
import { giftRecipientEmail, orderConfirmationEmail, orderNotificationEmail, sendEmail } from "./email";

/**
 * Confirms payment (idempotently) and, only on the first confirmation, sends emails.
 * Every payment path funnels through here: Stripe webhook, success-page verification and demo checkout.
 */
export async function confirmPayment(
  input: Parameters<typeof markOrderPaid>[1],
  db: Database = defaultDb,
): Promise<OrderRow | null> {
  const result = await markOrderPaid(db, input);
  if (!result.order) return null;
  if (result.changed) {
    await onFirstPaid(result.order, db);
    try {
      revalidateTag("catalog", "max");
    } catch {
      // Outside a request scope (tests/scripts) there is no cache to revalidate.
    }
  }
  return result.order;
}

async function onFirstPaid(order: OrderRow, db: Database) {
  const [detail, settings] = await Promise.all([loadOrderDetail(db, order), loadSettings(db)]);
  const jobs: Promise<unknown>[] = [sendEmail(orderConfirmationEmail(detail, settings), db)];
  const notify = settings.orderNotificationEmail || process.env.ORDER_NOTIFICATION_EMAIL;
  if (notify) jobs.push(sendEmail(orderNotificationEmail(detail, notify), db));
  for (const item of detail.items) {
    const gift = item.gift;
    if (item.kind === "subscription" && gift?.notifyRecipient && gift.recipientEmail) {
      const token = detail.gifts.find((g) => g.orderItemId === item.id)?.shareToken;
      jobs.push(
        sendEmail(
          giftRecipientEmail({
            recipientName: gift.recipientName,
            recipientEmail: gift.recipientEmail,
            senderName: gift.senderName,
            message: gift.message ?? "",
            planName: item.productName,
            startMonth: gift.startMonth,
            link: token ? giftPageUrl(token) : undefined,
          }),
          db,
        ),
      );
    }
  }
  if (order.marketingOptIn) {
    jobs.push(
      db
        .insert(schema.subscribers)
        .values({
          id: crypto.randomUUID(),
          email: order.customerEmail,
          source: "checkout",
          consentText: "Checkout opt-in: Email me occasionally when new pickup days are posted.",
          unsubscribeToken: crypto.randomUUID(),
        })
        .onConflictDoNothing(),
    );
  }
  // Email failures are recorded in the outbox and must never undo a confirmed payment.
  await Promise.allSettled(jobs);
}
