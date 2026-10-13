/** Upload rules shared by the browser (for early feedback) and the server (authoritative). */

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Vercel Functions reject request bodies above 4.5 MB before our code runs.
 * Files above this threshold are sent with the chunked endpoint instead; each chunk
 * plus multipart overhead stays well below the platform limit.
 */
export const DIRECT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const CHUNK_BYTES = 3 * 1024 * 1024;

export const ALLOWED_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;
export type AllowedMime = keyof typeof ALLOWED_MIME;

export const MANAGED_PREFIX = "/api/uploads/";

/** `${Date.now()}-${16 hex}.${ext}` — the only filename shape the server ever creates. */
export const FILENAME_RE = /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;

export function isUploadFolder(v: unknown): v is UploadFolder {
  return typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);
}

export function isAllowedMime(v: unknown): v is AllowedMime {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(ALLOWED_MIME, v);
}

export function isValidFilename(name: string): boolean {
  if (!name || name.length > 64) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return false;
  return FILENAME_RE.test(name);
}

/** Parses a managed upload URL. Returns null for anything that is not ours (e.g. Unsplash). */
export function parseManagedUrl(url: unknown): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith(MANAGED_PREFIX)) return null;
  const rest = url.slice(MANAGED_PREFIX.length).split("?")[0];
  const parts = rest.split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isUploadFolder(folder) || !isValidFilename(filename)) return null;
  return { folder, filename };
}

/** Legacy disk-based paths from older builds that no longer exist on serverless hosts. */
export function isLegacyUploadUrl(url: string) {
  return url.startsWith("/uploads/");
}
