import { resolveBundledImage, resolveBundledPageFields } from "@/lib/bundled-images";
import "server-only";
import { cache } from "react";
import { connectDB, isDbConfigured } from "@/lib/db";
import { GalleryItem, PageContent, PricingSettings, Service, SiteSettings, type PageSlug } from "@/lib/models";
import {
  DEFAULT_PRICING,
  DEFAULT_SEO,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  defaultFields,
  type PricingData,
  type ServiceData,
  type SiteSettingsData,
} from "@/lib/defaults";

/**
 * Public content readers. Saved database content always wins; bundled defaults are used only
 * when a value has never been saved or the database is unreachable, so pages never break.
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error("[content] falling back to defaults:", (err as Error).message);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<SiteSettingsData> =>
  safe(async () => {
    const doc = await SiteSettings.findOne({ key: "main" }).lean();
    if (!doc) return DEFAULT_SETTINGS;
    const out = { ...DEFAULT_SETTINGS };
    for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettingsData)[]) {
      const v = doc[k];
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }, DEFAULT_SETTINGS),
);

export const getPricing = cache(async (): Promise<PricingData> =>
  safe(async () => {
    const doc = await PricingSettings.findOne({ key: "main" }).lean();
    if (!doc) return DEFAULT_PRICING;
    return {
      firstLoadPrice: doc.firstLoadPrice ?? DEFAULT_PRICING.firstLoadPrice,
      additionalLoadPrice: doc.additionalLoadPrice ?? DEFAULT_PRICING.additionalLoadPrice,
      tonsPerLoad: doc.tonsPerLoad ?? DEFAULT_PRICING.tonsPerLoad,
      discountCopy: doc.discountCopy ?? "",
      shortNote: doc.shortNote ?? "",
      overageNote: doc.overageNote ?? "",
      laborNote: doc.laborNote ?? "",
      demolitionNote: doc.demolitionNote ?? "",
      deliveryNote: doc.deliveryNote ?? "",
      quoteNote: doc.quoteNote ?? "",
      paymentTerms: doc.paymentTerms ?? [],
      contractNote: doc.contractNote ?? "",
      faqs: (doc.faqs ?? []).map((q) => ({ question: q.question ?? "", answer: q.answer ?? "" })),
    };
  }, DEFAULT_PRICING),
);

export const getServices = cache(async (): Promise<ServiceData[]> =>
  safe(async () => {
    const docs = await Service.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    if (docs.length === 0) return DEFAULT_SERVICES;
    return docs.map((d) => ({
      _id: String(d._id),
      slug: d.slug,
      title: d.title,
      summary: d.summary ?? "",
      description: d.description ?? "",
      residential: d.residential ?? "",
      commercial: d.commercial ?? "",
      image: resolveBundledImage(d.image ?? ""),
      imageAlt: resolveBundledImage(d.image ?? "") !== d.image
        ? DEFAULT_SERVICES.find((service) => service.slug === d.slug)?.imageAlt ?? d.imageAlt ?? ""
        : d.imageAlt ?? "",
      order: d.order ?? 0,
      active: d.active ?? true,
    }));
  }, DEFAULT_SERVICES),
);

export type PageData = { fields: Record<string, string>; seoTitle: string; seoDescription: string; ogImage: string };

export const getPage = cache(async (slug: PageSlug): Promise<PageData> => {
  const base: PageData = { fields: defaultFields(slug), ...DEFAULT_SEO[slug], ogImage: "" };
  return safe(async () => {
    const doc = await PageContent.findOne({ slug }).lean();
    if (!doc) return base;
    const saved = doc.fields instanceof Map ? Object.fromEntries(doc.fields) : (doc.fields as Record<string, string>) ?? {};
    return {
      fields: resolveBundledPageFields({ ...base.fields, ...saved }, base.fields),
      seoTitle: doc.seoTitle || base.seoTitle,
      seoDescription: doc.seoDescription || base.seoDescription,
      ogImage: resolveBundledImage(doc.ogImage || ""),
    };
  }, base);
});

export const getGallery = cache(async () =>
  safe(async () => {
    const docs = await GalleryItem.find({ published: true }).sort({ order: 1, createdAt: -1 }).limit(24).lean();
    return docs.map((d) => ({ id: String(d._id), image: d.image, alt: d.alt ?? "", caption: d.caption ?? "" }));
  }, [] as { id: string; image: string; alt: string; caption: string }[]),
);
