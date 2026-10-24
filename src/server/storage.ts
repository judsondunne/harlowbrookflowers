import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 15 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * Normalizes an uploaded product photo to WebP (max 2400px, alpha preserved) and stores it.
 * Production: Vercel Blob when BLOB_READ_WRITE_TOKEN is set. Development: /public/uploads.
 */
export async function storeProductImage(file: File): Promise<string> {
  if (!ACCEPTED.has(file.type)) throw new UploadError("Please upload a JPEG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) throw new UploadError("Images must be smaller than 15 MB.");

  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 100 })
    .toBuffer();
  const name = `products/${crypto.randomUUID()}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, output, { access: "public", contentType: "image/webp" });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new UploadError("Photo storage isn't configured. Set BLOB_READ_WRITE_TOKEN (see docs/SETUP.md).");
  }
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), output);
  return `/uploads/${name}`;
}
