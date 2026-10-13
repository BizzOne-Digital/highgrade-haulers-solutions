import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UploadChunk, UploadSession } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { CHUNK_BYTES, isUploadFolder } from "@/lib/upload-rules";
import { storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };
const ID_RE = /^[a-f0-9]{32}$/;

async function loadSession(id: string) {
  if (!ID_RE.test(id)) return null;
  await connectDB();
  return UploadSession.findOne({ uploadId: id }).lean();
}

async function discard(id: string) {
  await Promise.all([UploadChunk.deleteMany({ uploadId: id }), UploadSession.deleteOne({ uploadId: id })]);
}

/** PUT raw bytes for one part: /api/upload/chunked/{id}?index=N */
export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const session = await loadSession(id);
  if (!session) return jsonError("Upload session not found or expired.", 404);

  const index = Number(new URL(req.url).searchParams.get("index"));
  if (!Number.isInteger(index) || index < 0 || index >= session.totalChunks) return jsonError("Invalid part index.", 400);

  const data = Buffer.from(await req.arrayBuffer());
  const isLast = index === session.totalChunks - 1;
  const expected = isLast ? session.totalSize - CHUNK_BYTES * (session.totalChunks - 1) : CHUNK_BYTES;
  if (data.length !== expected) return jsonError("Part size does not match the upload.", 400);

  await UploadChunk.updateOne({ uploadId: id, index }, { $set: { data, createdAt: new Date() } }, { upsert: true });
  return NextResponse.json({ success: true, index });
}

/** POST: assemble all parts, validate as a whole image, store as a StoredUpload. */
export async function POST(req: Request, ctx: Ctx) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const session = await loadSession(id);
  if (!session) return jsonError("Upload session not found or expired.", 404);

  try {
    const parts = await UploadChunk.find({ uploadId: id }).sort({ index: 1 });
    if (parts.length !== session.totalChunks || parts.some((p, i) => p.index !== i)) {
      return jsonError("Upload is incomplete. Please try again.", 400);
    }
    const data = Buffer.concat(parts.map((p) => Buffer.from(p.data as Buffer)));
    if (data.length !== session.totalSize) return jsonError("Upload size mismatch. Please try again.", 400);
    if (!isUploadFolder(session.folder)) return jsonError("Invalid upload folder.", 400);

    const saved = await storeImage(session.folder, session.mimeType, data);
    return NextResponse.json({ success: true, ...saved }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return jsonError(err.message, err.status);
    console.error("[upload:chunked] failed:", (err as Error).message);
    return jsonError("The upload could not be saved. Please try again.", 500);
  } finally {
    await discard(id).catch(() => undefined);
  }
}

/** DELETE: abort and clean up an incomplete upload. */
export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  if (!ID_RE.test(id)) return jsonError("Invalid upload id.", 400);
  await connectDB();
  await discard(id);
  return NextResponse.json({ success: true });
}
