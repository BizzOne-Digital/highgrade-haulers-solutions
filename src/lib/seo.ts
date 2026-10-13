import "server-only";
import type { Metadata } from "next";
import { getPage, getSettings } from "@/lib/content";
import type { PageSlug } from "@/lib/models";
import { MANAGED_PREFIX } from "@/lib/upload-rules";

/** Per-page metadata from the admin-editable SEO fields. */
export async function pageMetadata(slug: PageSlug, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  const ogCandidate = page.ogImage || page.fields.heroImage || "";
  const ogImage = ogCandidate.startsWith("https://") || (ogCandidate.startsWith(MANAGED_PREFIX) || ogCandidate.startsWith("/images/")) ? ogCandidate : undefined;
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: settings.businessName,
      title: page.seoTitle,
      description: page.seoDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.seoDescription },
  };
}
