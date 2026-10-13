import { z } from "zod";
import { adminRoute, ok, parseBody, revalidatePublic, validId } from "@/lib/admin-api";
import { Service } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ req }) => {
  const body = await parseBody(req, serviceSchema);
  if (body.error) return body.error;
  if (await Service.exists({ slug: body.data.slug })) return jsonError("Another service already uses this slug.", 409);
  const last = await Service.findOne().sort({ order: -1 }).lean();
  const doc = await Service.create({ ...body.data, order: (last?.order ?? -1) + 1 });
  revalidatePublic();
  return ok({ id: String(doc._id) });
});

/** PATCH { ids: string[] } -> saves the display order. */
export const PATCH = adminRoute(async ({ req }) => {
  const body = await parseBody(req, z.object({ ids: z.array(z.string()).max(200) }));
  if (body.error) return body.error;
  if (!body.data.ids.every(validId)) return jsonError("Invalid service id.", 400);
  await Service.bulkWrite(
    body.data.ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })),
  );
  revalidatePublic();
  return ok();
});
