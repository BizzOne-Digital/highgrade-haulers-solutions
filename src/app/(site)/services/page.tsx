import { ArrowRight, Building, Home, MessageSquare, CalendarCheck, FileText } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import SectionHeading from "@/components/site/SectionHeading";
import SplitHero, { HeroEyebrow } from "@/components/site/SplitHero";
import { getGallery, getPage, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("services", "/services");

export default async function ServicesPage() {
  const [{ fields: c }, services, gallery] = await Promise.all([getPage("services"), getServices(), getGallery()]);
  const steps = [
    { icon: FileText, title: c.step1Title, text: c.step1Text },
    { icon: MessageSquare, title: c.step2Title, text: c.step2Text },
    { icon: CalendarCheck, title: c.step3Title, text: c.step3Text },
  ];

  return (
    <>
      <SplitHero image={c.heroImage} imageAlt={c.heroImageAlt} size="md">
        <HeroEyebrow>{c.heroEyebrow}</HeroEyebrow>
        <h1 className="display mt-4 animate-rise text-[3.4rem] sm:text-7xl lg:text-[5rem]">{c.heroHeading}</h1>
        <p className="mt-5 max-w-md animate-rise text-lg text-white/90">{c.heroText}</p>
        <div className="mt-7 flex animate-rise flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary">
            Get a Free Quote <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/booking" className="btn btn-outline-yellow">
            Book a Pickup
          </Link>
        </div>
      </SplitHero>

      {/* All services */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <SectionHeading eyebrow={c.listEyebrow} title={c.listHeading} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug} id={s.slug} className="flex scroll-mt-28 flex-col overflow-hidden rounded-[4px] border border-line bg-white">
                <div className="relative aspect-[16/9] bg-ink-2">
                  <SafeImage src={s.image} alt={s.imageAlt || s.title} fill sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-extrabold tracking-tight">{s.title}</h2>
                  <p className="mt-2 text-ink/80">{s.description || s.summary}</p>
                  {(s.residential || s.commercial) && (
                    <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                      {s.residential && (
                        <div className="flex gap-3">
                          <dt className="flex shrink-0 items-start pt-0.5">
                            <Home className="size-4 text-brand-dark" aria-hidden />
                            <span className="sr-only">Residential</span>
                          </dt>
                          <dd className="text-ink/80">
                            <strong className="text-ink">Residential:</strong> {s.residential}
                          </dd>
                        </div>
                      )}
                      {s.commercial && (
                        <div className="flex gap-3">
                          <dt className="flex shrink-0 items-start pt-0.5">
                            <Building className="size-4 text-brand-dark" aria-hidden />
                            <span className="sr-only">Commercial</span>
                          </dt>
                          <dd className="text-ink/80">
                            <strong className="text-ink">Commercial:</strong> {s.commercial}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <Link href={`/booking?service=${encodeURIComponent(s.slug)}`} className="btn btn-primary min-h-11 px-4 text-sm">
                      Book this service <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link href="/contact" className="btn btn-outline-dark min-h-11 px-4 text-sm">
                      Free quote
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Residential & commercial */}
      <section className="texture-dark py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <SectionHeading dark title={c.resComHeading} />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[4px] border-2 border-white/80 p-7">
              <Home className="size-9 text-hazard" aria-hidden />
              <h3 className="display mt-4 text-3xl">Residential</h3>
              <p className="mt-3 text-white/85">{c.residentialText}</p>
            </div>
            <div className="rounded-[4px] border-2 border-brand p-7">
              <Building className="size-9 text-brand" aria-hidden />
              <h3 className="display mt-4 text-3xl">Commercial</h3>
              <p className="mt-3 text-white/85">{c.commercialText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <SectionHeading eyebrow="SIMPLE PROCESS" title={c.processHeading} />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-[4px] border border-line bg-white p-7">
                <span className="display absolute right-5 top-4 text-6xl text-ink/10" aria-hidden>
                  0{i + 1}
                </span>
                <step.icon className="size-9 text-brand-dark" aria-hidden />
                <h3 className="mt-4 text-xl font-extrabold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-ink/80">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="on-light border-t border-line bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <SectionHeading title={c.galleryHeading} />
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {gallery.map((g) => (
                <li key={g.id}>
                  <figure>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-ink-2">
                      <SafeImage src={g.image} alt={g.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
                    </div>
                    {g.caption && <figcaption className="mt-2 text-sm text-ink/75">{g.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="on-light bg-brand py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <h2 className="display text-4xl sm:text-5xl">{c.ctaHeading}</h2>
            <p className="mt-2 text-lg font-medium">{c.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-dark">
              Get a Free Quote <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/booking" className="btn btn-outline-dark">
              Book a Pickup
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
