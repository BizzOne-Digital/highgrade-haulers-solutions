import { adminRoute, ok, parseBody, revalidatePublic } from "@/lib/admin-api";
import { SiteSettings } from "@/lib/models";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { settingsSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const PUT = adminRoute(async ({ req }) => {
  const body = await parseBody(req, settingsSchema);
  if (body.error) return body.error;

  const before = await SiteSettings.findOne({ key: "main" }).lean();
  const saved = await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: body.data }, { upsert: true, new: true }).lean();
  await cleanupReplacedUploads(before, saved);
  revalidatePublic();
  return ok();
});
