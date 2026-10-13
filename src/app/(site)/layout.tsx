import CallStrip from "@/components/site/CallStrip";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { getPage, getServices, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/** Structured data built only from verified business details (no address, ratings, or hours). */
function businessJsonLd(
  s: Awaited<ReturnType<typeof getSettings>>,
  services: Awaited<ReturnType<typeof getServices>>,
) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl()}/#business`,
    name: s.businessName,
    url: siteUrl(),
    telephone: s.phoneHref.replace(/^tel:/, ""),
    email: s.email,
    description: "We are a local junk removal service specializing in junk and debris cleanup and removal at affordable prices.",
    founder: s.ownerName ? { "@type": "Person", name: s.ownerName } : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((sv) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: sv.title } })),
    },
  };
  if (s.facebookUrl) data.sameAs = [s.facebookUrl];
  if (s.serviceArea) data.areaServed = s.serviceArea;
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, home, services] = await Promise.all([getSettings(), getPage("home"), getServices()]);
  return (
    <>
      <SiteHeader
        businessName={settings.businessName}
        phone={settings.phone}
        phoneHref={settings.phoneHref}
        logoUrl={settings.logoUrl}
        announcement={settings.announcement}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <CallStrip text={home.fields.callStripText} phone={settings.phone} phoneHref={settings.phoneHref} />
      <SiteFooter settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: businessJsonLd(settings, services) }} />
    </>
  );
}
