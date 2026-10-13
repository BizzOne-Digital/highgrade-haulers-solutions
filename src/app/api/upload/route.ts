import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/security";
import { isUploadFolder, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";
import { deleteUploadIfUnreferenced, storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";

/** POST multipart/form-data { file, folder } -> stores the image in MongoDB. */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_UPLOAD_BYTES + 256 * 1024) return jsonError("Images must be 8 MB or smaller.", 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Expected multipart form data with a file and folder.", 400);
  }

  const folder = form.get("folder");
  const file = form.get("file");
  if (!isUploadFolder(folder)) return jsonError("Invalid upload folder.", 400);
  if (!(file instanceof File)) return jsonError("No file was provided.", 400);
  if (file.size > MAX_UPLOAD_BYTES) return jsonError("Images must be 8 MB or smaller.", 413);

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const saved = await storeImage(folder, file.type, data);
    return NextResponse.json({ success: true, ...saved }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return jsonError(err.message, err.status);
    console.error("[upload] failed:", (err as Error).message);
    return jsonError("The upload could not be saved. Please try again.", 500);
  }
}

/**
 * DELETE { url } -> removes a managed upload only when no saved content references it.
 * Used to discard abandoned uploads (e.g. an unsaved preview that was replaced).
 */
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  let url: unknown;
  try {
    url = ((await req.json()) as { url?: unknown }).url;
  } catch {
    return jsonError("Invalid request.", 400);
  }
  if (typeof url !== "string" || !url.startsWith("/api/uploads/")) {
    return jsonError("Only managed upload URLs can be deleted.", 400);
  }
  try {
    const result = await deleteUploadIfUnreferenced(url);
    if (result === "ignored") return jsonError("Invalid upload URL.", 400);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("[upload] delete failed:", (err as Error).message);
    return jsonError("The image could not be deleted.", 500);
  }
}
