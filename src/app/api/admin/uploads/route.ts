import { z } from "zod";
import { adminRoute, ok, parseBody } from "@/lib/admin-api";
import { StoredUpload } from "@/lib/models";
import { referencedUploadUrls } from "@/lib/uploads";

export const runtime = "nodejs";

/** Lists stored uploads (metadata only, never binary data) with their in-use status. */
export const GET = adminRoute(async () => {
  const [docs, refs] = await Promise.all([
    StoredUpload.find().select("folder filename mimeType size createdAt").sort({ createdAt: -1 }).limit(500).lean(),
    referencedUploadUrls(),
  ]);
  return ok({
    uploads: docs.map((d) => {
      const url = `/api/uploads/${d.folder}/${d.filename}`;
      return { url, folder: d.folder, filename: d.filename, size: d.size, mimeType: d.mimeType, createdAt: d.createdAt, inUse: refs.has(url) };
    }),
  });
});

/** POST { olderThanHours } -> removes uploads that no saved content references (abandoned uploads). */
export const POST = adminRoute(async ({ req }) => {
  const body = await parseBody(req, z.object({ olderThanHours: z.number().min(1).max(24 * 365) }));
  if (body.error) return body.error;
  const cutoff = new Date(Date.now() - body.data.olderThanHours * 3600 * 1000);
  const [candidates, refs] = await Promise.all([
    StoredUpload.find({ createdAt: { $lt: cutoff } }).select("folder filename").lean(),
    referencedUploadUrls(),
  ]);
  const unused = candidates.filter((d) => !refs.has(`/api/uploads/${d.folder}/${d.filename}`));
  if (unused.length) await StoredUpload.deleteMany({ _id: { $in: unused.map((d) => d._id) } });
  return ok({ removed: unused.length });
});
