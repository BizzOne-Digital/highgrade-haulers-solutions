import { adminRoute, ok, parseBody, revalidatePublic } from "@/lib/admin-api";
import { PricingSettings } from "@/lib/models";
import { pricingSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const PUT = adminRoute(async ({ req }) => {
  const body = await parseBody(req, pricingSchema);
  if (body.error) return body.error;
  await PricingSettings.findOneAndUpdate({ key: "main" }, { $set: body.data }, { upsert: true });
  revalidatePublic();
  return ok();
});
