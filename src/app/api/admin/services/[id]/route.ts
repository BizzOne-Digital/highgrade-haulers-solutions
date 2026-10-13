import { adminRoute, ok, parseBody, revalidatePublic, validId } from "@/lib/admin-api";
import { Service } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const PUT = adminRoute(async ({ req, params }) => {
  if (!validId(params.id)) return jsonError("Invalid service id.", 400);
  const body = await parseBody(req, serviceSchema);
  if (body.error) return body.error;
  if (await Service.exists({ slug: body.data.slug, _id: { $ne: params.id } })) {
    return jsonError("Another service already uses this slug.", 409);
  }
  const before = await Service.findById(params.id).lean();
  if (!before) return jsonError("Service not found.", 404);
  const saved = await Service.findByIdAndUpdate(params.id, { $set: body.data }, { new: true }).lean();
  await cleanupReplacedUploads(before, saved);
  revalidatePublic();
  return ok();
});

export const DELETE = adminRoute(async ({ params }) => {
  if (!validId(params.id)) return jsonError("Invalid service id.", 400);
  const before = await Service.findByIdAndDelete(params.id).lean();
  if (!before) return jsonError("Service not found.", 404);
  await cleanupReplacedUploads(before, null);
  revalidatePublic();
  return ok();
});
