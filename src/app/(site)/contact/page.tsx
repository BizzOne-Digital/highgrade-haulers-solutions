import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { FacebookIcon } from "@/components/site/SiteFooter";
import SplitHero, { HeroEyebrow } from "@/components/site/SplitHero";
import { getPage, getServices, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("contact", "/contact");

export default async function ContactPage() {
  const [{ fields: c }, services, s] = await Promise.all([getPage("contact"), getServices(), getSettings()]);

  return (
    <>
      <SplitHero image={c.heroImage} imageAlt={c.heroImageAlt} size="md">
        <HeroEyebrow>{c.heroEyebrow}</HeroEyebrow>
        <h1 className="display mt-4 animate-rise text-[3.2rem] sm:text-7xl lg:text-[4.8rem]">{c.heroHeading}</h1>
        <p className="mt-5 max-w-md animate-rise text-lg text-white/90">{c.heroText}</p>
        <a href={s.phoneHref} className="btn btn-primary mt-7 animate-rise">
          <Phone className="size-4" aria-hidden /> Call {s.phone}
        </a>
      </SplitHero>

      <section className="on-light bg-paper py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-12">
          <aside>
            <h2 className="display text-4xl sm:text-5xl">{c.detailsHeading}</h2>
            <ul className="mt-6 space-y-4">
              <li>
                <a href={s.phoneHref} className="flex items-center gap-4 rounded-[4px] border border-line bg-white p-5 hover:border-ink/40">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[3px] bg-brand">
                    <Phone className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink/65">Phone</span>
                    <span className="display text-3xl">{s.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${s.email}`} className="flex items-center gap-4 rounded-[4px] border border-line bg-white p-5 hover:border-ink/40">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[3px] bg-hazard">
                    <Mail className="size-6" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink/65">Email</span>
                    <span className="block truncate text-lg font-bold">{s.email}</span>
                  </span>
                </a>
              </li>
              {s.facebookUrl && (
                <li>
                  <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[4px] border border-line bg-white p-5 hover:border-ink/40">
                    <span className="grid size-12 shrink-0 place-items-center rounded-[3px] bg-ink text-white">
                      <FacebookIcon className="size-6" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink/65">Facebook</span>
                      <span className="block text-lg font-bold">
                        Visit our page <span className="sr-only">(opens in a new tab)</span>
                      </span>
                    </span>
                  </a>
                </li>
              )}
              {s.serviceArea && (
                <li className="flex items-start gap-4 rounded-[4px] border border-line bg-white p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[3px] bg-ink text-white">
                    <MapPin className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink/65">Service area</span>
                    <span className="block font-semibold">{s.serviceArea}</span>
                  </span>
                </li>
              )}
            </ul>
          </aside>

          <div className="rounded-[4px] border border-line bg-white p-5 sm:p-8">
            <h2 className="display text-4xl sm:text-5xl">{c.formHeading}</h2>
            <p className="mt-2 text-ink/80">{c.formIntro}</p>
            <div className="mt-6">
              <ContactForm
                services={services.map((x) => ({ slug: x.slug, title: x.title }))}
                successTitle={c.successTitle}
                successText={c.successText}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
