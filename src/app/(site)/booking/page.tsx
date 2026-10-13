import { Info, Mail, Phone } from "lucide-react";
import BookingForm from "@/components/forms/BookingForm";
import SplitHero, { HeroEyebrow } from "@/components/site/SplitHero";
import { getPage, getServices, getSettings } from "@/lib/content";
import { PROPERTY_TYPES } from "@/lib/defaults";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("booking", "/booking");

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const [{ fields: c }, services, settings, sp] = await Promise.all([getPage("booking"), getServices(), getSettings(), searchParams]);
  const requested = Array.isArray(sp.service) ? sp.service[0] : sp.service;
  const preselected = services.find((s) => s.slug === requested)?.title;

  return (
    <>
      <SplitHero image={c.heroImage} imageAlt={c.heroImageAlt} size="md">
        <HeroEyebrow>{c.heroEyebrow}</HeroEyebrow>
        <h1 className="display mt-4 animate-rise text-[3.2rem] sm:text-7xl lg:text-[4.8rem]">{c.heroHeading}</h1>
        <p className="mt-5 max-w-md animate-rise text-lg text-white/90">{c.heroText}</p>
      </SplitHero>

      <section className="on-light bg-paper py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-12">
          <div className="rounded-[4px] border border-line bg-white p-5 sm:p-8">
            <h2 className="display text-4xl sm:text-5xl">{c.formHeading}</h2>
            <p className="mt-3 flex gap-2 rounded-[3px] bg-hazard/30 px-3 py-2.5 text-sm font-medium">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{c.formIntro}</span>
            </p>
            <div className="mt-6">
              <BookingForm
                services={services.map((s) => ({ slug: s.slug, title: s.title }))}
                propertyTypes={PROPERTY_TYPES}
                defaultService={preselected}
                successTitle={c.successTitle}
                successText={c.successText}
                phone={settings.phone}
                phoneHref={settings.phoneHref}
                email={settings.email}
              />
            </div>
          </div>

          <aside className="texture-dark h-fit rounded-[4px] p-7 text-white lg:sticky lg:top-28">
            <h2 className="display text-4xl">{c.sidebarHeading}</h2>
            <p className="mt-3 text-white/85">{c.sidebarText}</p>
            <ul className="mt-6 space-y-3">
              <li>
                <a href={settings.phoneHref} className="btn btn-primary w-full justify-start">
                  <Phone className="size-5" aria-hidden /> {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="btn btn-outline-yellow w-full justify-start overflow-hidden text-ellipsis">
                  <Mail className="size-5 shrink-0" aria-hidden /> {settings.email}
                </a>
              </li>
            </ul>
            <ul className="mt-7 space-y-2 border-t border-white/15 pt-6 text-sm text-white/80">
              <li>&bull; Requests are reviewed and confirmed by phone or email.</li>
              <li>&bull; No payment is required to submit a request.</li>
              <li>&bull; A detailed contract is provided before work begins.</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
