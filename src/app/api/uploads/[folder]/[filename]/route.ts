import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models";
import { isUploadFolder, isValidFilename } from "@/lib/upload-rules";

export const runtime = "nodejs";

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" } });

/** Public image serving for MongoDB-stored uploads. */
export async function GET(_req: Request, ctx: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename } = await ctx.params;
  if (!isUploadFolder(folder) || !isValidFilename(filename)) return notFound();

  try {
    await connectDB();
    // Hydrated (non-lean) document so Mongoose casts BSON Binary to a Buffer of the exact length.
    const doc = await StoredUpload.findOne({ folder, filename }).select("+data mimeType size");
    if (!doc || !doc.data) return notFound();

    // Copy into a standalone Uint8Array: a Buffer's underlying ArrayBuffer can be a shared pool,
    // and sending `buf.buffer` directly would leak unrelated bytes.
    const body = new Uint8Array(Buffer.from(doc.data as Buffer));

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch (err) {
    console.error("[uploads] serve failed:", (err as Error).message);
    return new Response("Temporarily unavailable", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}
