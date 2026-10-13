import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UploadSession } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { CHUNK_BYTES, isAllowedMime, isUploadFolder, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";

export const runtime = "nodejs";

/**
 * Starts a chunked upload for files too large for the host's request-body limit.
 * Body: { folder, mimeType, totalSize }. Parts are staged in MongoDB, never on disk.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  let body: { folder?: unknown; mimeType?: unknown; totalSize?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }
  const { folder, mimeType } = body;
  const totalSize = Number(body.totalSize);
  if (!isUploadFolder(folder)) return jsonError("Invalid upload folder.", 400);
  if (!isAllowedMime(mimeType)) return jsonError("Only PNG, JPEG, WebP, and GIF images are allowed.", 415);
  if (!Number.isInteger(totalSize) || totalSize <= 0) return jsonError("Invalid file size.", 400);
  if (totalSize > MAX_UPLOAD_BYTES) return jsonError("Images must be 8 MB or smaller.", 413);

  await connectDB();
  const uploadId = randomBytes(16).toString("hex");
  const totalChunks = Math.ceil(totalSize / CHUNK_BYTES);
  await UploadSession.create({ uploadId, folder, mimeType, totalSize, totalChunks });
  return NextResponse.json({ success: true, uploadId, chunkSize: CHUNK_BYTES, totalChunks }, { status: 201 });
}
