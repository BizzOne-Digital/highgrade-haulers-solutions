import { adminRoute, ok, parseBody, revalidatePublic, validId } from "@/lib/admin-api";
import { GalleryItem } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { galleryItemSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const PUT = adminRoute(async ({ req, params }) => {
  if (!validId(params.id)) return jsonError("Invalid gallery id.", 400);
  const body = await parseBody(req, galleryItemSchema);
  if (body.error) return body.error;
  const before = await GalleryItem.findById(params.id).lean();
  if (!before) return jsonError("Gallery item not found.", 404);
  const saved = await GalleryItem.findByIdAndUpdate(params.id, { $set: body.data }, { new: true }).lean();
  await cleanupReplacedUploads(before, saved);
  revalidatePublic();
  return ok();
});

export const DELETE = adminRoute(async ({ params }) => {
  if (!validId(params.id)) return jsonError("Invalid gallery id.", 400);
  const before = await GalleryItem.findByIdAndDelete(params.id).lean();
  if (!before) return jsonError("Gallery item not found.", 404);
  await cleanupReplacedUploads(before, null);
  revalidatePublic();
  return ok();
});
