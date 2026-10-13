import { z } from "zod";
import { adminRoute, ok, parseBody, revalidatePublic, validId } from "@/lib/admin-api";
import { GalleryItem } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { galleryItemSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ req }) => {
  const body = await parseBody(req, galleryItemSchema);
  if (body.error) return body.error;
  const last = await GalleryItem.findOne().sort({ order: -1 }).lean();
  const doc = await GalleryItem.create({ ...body.data, order: (last?.order ?? -1) + 1 });
  revalidatePublic();
  return ok({ id: String(doc._id) });
});

/** PATCH { ids } -> saves the display order. */
export const PATCH = adminRoute(async ({ req }) => {
  const body = await parseBody(req, z.object({ ids: z.array(z.string()).max(500) }));
  if (body.error) return body.error;
  if (!body.data.ids.every(validId)) return jsonError("Invalid gallery id.", 400);
  await GalleryItem.bulkWrite(
    body.data.ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })),
  );
  revalidatePublic();
  return ok();
});
