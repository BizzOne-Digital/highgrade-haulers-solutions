import { adminRoute, ok, parseBody, revalidatePublic } from "@/lib/admin-api";
import { PAGE_FIELDS } from "@/lib/defaults";
import { PAGE_SLUGS, PageContent, type PageSlug } from "@/lib/models";
import { jsonError } from "@/lib/security";
import { cleanupReplacedUploads } from "@/lib/uploads";
import { pageSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const PUT = adminRoute(async ({ req, params }) => {
  const slug = params.slug as PageSlug;
  if (!PAGE_SLUGS.includes(slug)) return jsonError("Unknown page.", 404);

  const body = await parseBody(req, pageSchema);
  if (body.error) return body.error;

  // Only known field keys are stored; image/link fields must be safe URLs.
  const defs = new Map(PAGE_FIELDS[slug].map((d) => [d.key, d]));
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body.data.fields)) {
    const def = defs.get(key);
    if (!def) continue;
    const v = value.trim();
    if ((def.type === "image" || def.type === "link") && v && !(v.startsWith("/") || v.startsWith("https://"))) {
      return jsonError(`${def.label}: use a relative path or an https:// URL.`, 422);
    }
    if (v.startsWith("//")) return jsonError(`${def.label}: invalid URL.`, 422);
    fields[key] = v;
  }

  const before = await PageContent.findOne({ slug }).lean();
  const saved = await PageContent.findOneAndUpdate(
    { slug },
    { $set: { seoTitle: body.data.seoTitle, seoDescription: body.data.seoDescription, ogImage: body.data.ogImage, fields } },
    { upsert: true, new: true },
  ).lean();
  await cleanupReplacedUploads(before, saved);
  revalidatePublic();
  return ok();
});
