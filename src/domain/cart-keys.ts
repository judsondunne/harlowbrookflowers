/** Line keys group identical selections; gift lines are always unique. Client-safe (no zod). */
export function lineKey(productId: string, cardMessage?: string, unique = false) {
  if (unique) return `${productId}:${Math.random().toString(36).slice(2, 10)}`;
  const msg = (cardMessage ?? "").trim();
  if (!msg) return productId;
  let h = 0;
  for (let i = 0; i < msg.length; i++) h = (h * 31 + msg.charCodeAt(i)) | 0;
  return `${productId}:c${(h >>> 0).toString(36)}`;
}
