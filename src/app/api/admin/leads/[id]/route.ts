import { z } from "zod";
import { adminRoute, ok, parseBody, validId } from "@/lib/admin-api";
import { ContactLead, LEAD_STATUSES } from "@/lib/models";
import { jsonError } from "@/lib/security";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  adminNotes: z.string().trim().max(3000).optional(),
});

export const PATCH = adminRoute(async ({ req, params }) => {
  if (!validId(params.id)) return jsonError("Invalid lead id.", 400);
  const body = await parseBody(req, patchSchema);
  if (body.error) return body.error;
  const doc = await ContactLead.findByIdAndUpdate(params.id, { $set: body.data }, { new: true }).lean();
  if (!doc) return jsonError("Lead not found.", 404);
  return ok({ status: doc.status });
});

export const DELETE = adminRoute(async ({ params }) => {
  if (!validId(params.id)) return jsonError("Invalid lead id.", 400);
  const res = await ContactLead.deleteOne({ _id: params.id });
  if (!res.deletedCount) return jsonError("Lead not found.", 404);
  return ok();
});
