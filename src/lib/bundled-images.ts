/** Bundled AI-generated website illustrations; real admin uploads retain their own URLs. */
export const BUNDLED_IMAGES = {
  "jobSiteTrucks": "/images/highgrade/home-hero.webp",
  "clutteredGarage": "/images/highgrade/junk-removal.webp",
  "storageGarage": "/images/highgrade/garage-property-cleanouts.webp",
  "yardDebris": "/images/highgrade/house-cleanouts.webp",
  "dumpHauler": "/images/highgrade/dump-trailer-rental.webp",
  "rubblePile": "/images/highgrade/construction-debris-removal.webp",
  "demolition": "/images/highgrade/demolition-remodeling-cleanup.webp",
  "siteDumpster": "/images/highgrade/hauling-disposal.webp",
  "aggregateYard": "/images/highgrade/material-deliveries.webp",
  "siteWorkers": "/images/highgrade/residential-commercial-cleanup.webp",
  "servicesHero": "/images/highgrade/services-hero.webp",
  "pricingHero": "/images/highgrade/pricing-hero.webp",
  "bookingHero": "/images/highgrade/booking-hero.webp",
  "contactHero": "/images/highgrade/contact-hero.webp"
};

/** Only the exact original seed URLs are replaced. Custom stock images and uploads are preserved. */
const LEGACY_DEFAULT_IMAGES: Record<string, string> = {
  "https://images.unsplash.com/photo-1778068846016-b0ae7a27abbe?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/home-hero.webp",
  "https://images.unsplash.com/photo-1647299852821-40401c0b0976?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/junk-removal.webp",
  "https://images.unsplash.com/photo-1635108198322-18c814f9b70f?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/garage-property-cleanouts.webp",
  "https://images.unsplash.com/photo-1670108948068-ed86cc96393f?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/house-cleanouts.webp",
  "https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/dump-trailer-rental.webp",
  "https://images.unsplash.com/photo-1777793919680-0123bc31ce36?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/construction-debris-removal.webp",
  "https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/demolition-remodeling-cleanup.webp",
  "https://images.unsplash.com/photo-1751688220612-e9cae6486014?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/hauling-disposal.webp",
  "https://images.unsplash.com/photo-1762608676460-5fd5aafa5ce1?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/material-deliveries.webp",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80": "/images/highgrade/residential-commercial-cleanup.webp"
};

export function resolveBundledImage(url: string, pageDefault?: string): string {
  if (!Object.prototype.hasOwnProperty.call(LEGACY_DEFAULT_IMAGES, url)) return url;
  return pageDefault?.startsWith("/images/highgrade/") ? pageDefault : LEGACY_DEFAULT_IMAGES[url];
}

/** Resolve old saved defaults per field so every page gets its dedicated hero. */
export function resolveBundledPageFields(fields: Record<string, string>, defaults: Record<string, string>): Record<string, string> {
  const result = { ...fields };
  for (const [key, value] of Object.entries(fields)) {
    const image = resolveBundledImage(value, defaults[key]);
    if (image === value) continue;
    result[key] = image;
    for (const altKey of [key + "Alt", key.replace(/Image$/, "") + "Alt"]) {
      if (defaults[altKey] !== undefined) result[altKey] = defaults[altKey];
    }
  }
  return result;
}
