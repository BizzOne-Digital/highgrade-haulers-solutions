import "server-only";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/lib/db";
import { GalleryItem, PageContent, PricingSettings, Service, SiteSettings, StoredUpload } from "@/lib/models";
import {
  ALLOWED_MIME,
  MANAGED_PREFIX,
  MAX_UPLOAD_BYTES,
  parseManagedUrl,
  type AllowedMime,
  type UploadFolder,
} from "@/lib/upload-rules";

/** Detects the real image format from magic bytes. */
export function sniffImageType(buf: Buffer): AllowedMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  const head6 = buf.subarray(0, 6).toString("ascii");
  if (head6 === "GIF87a" || head6 === "GIF89a") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return null;
}

export class UploadError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Validates bytes against the declared type and stores them. Server-side validation is authoritative. */
export async function storeImage(folder: UploadFolder, declaredMime: string, data: Buffer) {
  if (data.length === 0) throw new UploadError("The file is empty.", 400);
  if (data.length > MAX_UPLOAD_BYTES) throw new UploadError("Images must be 8 MB or smaller.", 413);
  if (!(declaredMime in ALLOWED_MIME)) {
    throw new UploadError("Only PNG, JPEG, WebP, and GIF images are allowed.", 415);
  }
  const detected = sniffImageType(data);
  if (!detected) throw new UploadError("The file is not a valid PNG, JPEG, WebP, or GIF image.", 415);
  if (detected !== declaredMime) throw new UploadError("The file contents do not match its image type.", 415);

  const ext = ALLOWED_MIME[detected];
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  await connectDB();
  await StoredUpload.create({ folder, filename, mimeType: detected, size: data.length, data });
  return { url: `${MANAGED_PREFIX}${folder}/${filename}`, filename, size: data.length, folder };
}

/** Every managed upload URL found anywhere inside a value (deep scan). */
export function collectManagedUrls(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (parseManagedUrl(value)) out.add(value.split("?")[0]);
  } else if (value instanceof Map) {
    for (const v of value.values()) collectManagedUrls(v, out);
  } else if (Array.isArray(value)) {
    for (const v of value) collectManagedUrls(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectManagedUrls(v, out);
  }
  return out;
}

/** All managed URLs currently referenced by any saved content. */
export async function referencedUploadUrls(): Promise<Set<string>> {
  await connectDB();
  const [settings, pages, services, pricing, gallery] = await Promise.all([
    SiteSettings.find().lean(),
    PageContent.find().lean(),
    Service.find().lean(),
    PricingSettings.find().lean(),
    GalleryItem.find().lean(),
  ]);
  return collectManagedUrls([settings, pages, services, pricing, gallery]);
}

/**
 * Deletes a managed upload only if no saved content still references it.
 * Remote (e.g. Unsplash) and malformed URLs are ignored.
 */
export async function deleteUploadIfUnreferenced(url: string): Promise<"deleted" | "in-use" | "ignored" | "missing"> {
  const parsed = parseManagedUrl(url);
  if (!parsed) return "ignored";
  const refs = await referencedUploadUrls();
  if (refs.has(`${MANAGED_PREFIX}${parsed.folder}/${parsed.filename}`)) return "in-use";
  const res = await StoredUpload.deleteOne({ folder: parsed.folder, filename: parsed.filename });
  return res.deletedCount ? "deleted" : "missing";
}

/** After a document is saved, removes uploads that the old version used and the new one no longer does. */
export async function cleanupReplacedUploads(before: unknown, after: unknown) {
  const oldUrls = collectManagedUrls(before);
  const newUrls = collectManagedUrls(after);
  for (const url of oldUrls) {
    if (newUrls.has(url)) continue;
    try {
      await deleteUploadIfUnreferenced(url);
    } catch (err) {
      console.error("[uploads] cleanup failed for", url, (err as Error).message);
    }
  }
}
