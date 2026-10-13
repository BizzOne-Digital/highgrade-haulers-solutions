import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/pricing", priority: 0.9 },
    { path: "/booking", priority: 0.8 },
    { path: "/contact", priority: 0.8 },
  ].map(({ path, priority }) => ({ url: `${base}${path}`, changeFrequency: "monthly", priority }));
}
