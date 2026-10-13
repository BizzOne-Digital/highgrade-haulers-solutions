/**
 * Idempotent content seed: `npm run seed`
 *
 * Inserts the supplied business content only where nothing exists yet ($setOnInsert),
 * so it is safe to run repeatedly and never overwrites edits made in the admin panel.
 */
import mongoose from "mongoose";
import { loadEnv } from "./env";

loadEnv();

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const M = await import("../src/lib/models");
  const D = await import("../src/lib/defaults");

  await connectDB();
  console.log("Connected. Ensuring indexes…");
  await Promise.all(
    [M.AdminUser, M.AdminSession, M.RateLimit, M.SiteSettings, M.PageContent, M.Service, M.PricingSettings, M.Booking, M.ContactLead, M.GalleryItem, M.StoredUpload, M.UploadSession, M.UploadChunk].map(
      (m) => (m as mongoose.Model<unknown>).createIndexes(),
    ),
  );

  const report: string[] = [];
  const upsert = async (label: string, model: mongoose.Model<unknown>, filter: object, doc: object) => {
    const res = await model.updateOne(filter, { $setOnInsert: { ...filter, ...doc } }, { upsert: true });
    report.push(`${res.upsertedCount ? "created " : "kept    "} ${label}`);
  };

  await upsert("site settings", M.SiteSettings as mongoose.Model<unknown>, { key: "main" }, D.DEFAULT_SETTINGS);
  await upsert("pricing settings", M.PricingSettings as mongoose.Model<unknown>, { key: "main" }, D.DEFAULT_PRICING);

  for (const slug of M.PAGE_SLUGS) {
    await upsert(`page: ${slug}`, M.PageContent as mongoose.Model<unknown>, { slug }, { ...D.DEFAULT_SEO[slug], ogImage: "", fields: D.defaultFields(slug) });
  }

  for (const s of D.DEFAULT_SERVICES) {
    const { slug, ...rest } = s;
    await upsert(`service: ${s.title}`, M.Service as mongoose.Model<unknown>, { slug }, rest);
  }

  console.log(report.join("\n"));
  console.log("\nSeed complete. Existing content was not modified.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
