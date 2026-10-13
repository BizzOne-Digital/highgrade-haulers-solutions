import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardSignature,
  FileText,
  HardHat,
  Home,
  KeyRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import QuickBookingForm from "@/components/forms/QuickBookingForm";
import SafeImage from "@/components/SafeImage";
import SplitHero, { HeroEyebrow } from "@/components/site/SplitHero";
import { getGallery, getPage, getPricing, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("home", "/");

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function HomePage() {
  const [{ fields: c }, pricing, services, gallery] = await Promise.all([getPage("home"), getPricing(), getServices(), getGallery()]);

  const cards = [1, 2, 3].map((n) => ({
    title: c[`card${n}Title`],
    text: c[`card${n}Text`],
    image: c[`card${n}Image`],
    alt: c[`card${n}Alt`],
    link: c[`card${n}Link`] || "/services",
  }));
  const audience = [
    { icon: Home, title: c.aud1Title, text: c.aud1Text },
    { icon: HardHat, title: c.aud2Title, text: c.aud2Text },
    { icon: KeyRound, title: c.aud3Title, text: c.aud3Text },
  ];
  const steps = [
    { title: c.step1Title, text: c.step1Text },
    { title: c.step2Title, text: c.step2Text },
    { title: c.step3Title, text: c.step3Text },
  ];
  const haulItems = (c.haulItems ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const terms = [
    { icon: FileText, title: "Free quotes", text: pricing.quoteNote },
    { icon: Wallet, title: "Clear payment terms", text: pricing.paymentTerms.join(" ") },
    { icon: ClipboardSignature, title: "Detailed contract", text: pricing.contractNote },
  ].filter((t) => t.text);
  const faqs = pricing.faqs.slice(0, 4);
  const benefits = [
    { icon: CalendarDays, label: c.benefit1 },
    { icon: CircleDollarSign, label: c.benefit2 },
    { icon: HardHat, label: c.benefit3 },
  ];

  return (
    <>
      {/* 3. Hero */}
      <SplitHero
        image={c.heroImage}
        imageAlt={c.heroImageAlt}
        badge={
          <div className="animate-badge on-light bg-hazard px-4 py-3 text-ink shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:px-5 sm:py-4">
            <p className="display text-base sm:text-xl">{c.heroBadgeTitle}</p>
            <p className="display text-3xl sm:text-[2.6rem]">
              {money(pricing.firstLoadPrice)} <span className="text-2xl sm:text-3xl">/ load</span>
            </p>
            <p className="text-sm font-semibold sm:text-base">{c.heroBadgeSub}</p>
          </div>
        }
      >
        <HeroEyebrow>{c.heroEyebrow}</HeroEyebrow>
        <h1 className="display mt-4 text-[3.9rem] leading-[0.9] sm:text-[5.2rem] lg:text-[5.4rem] xl:text-[6.1rem]">
          <span className="block animate-rise [animation-delay:80ms]">{c.heroLine1}</span>
          <span className="block animate-rise [animation-delay:160ms]">{c.heroLine2}</span>
          <span className="block animate-rise text-brand [animation-delay:240ms]">{c.heroLine3}</span>
        </h1>
        <p className="mt-6 max-w-md animate-rise text-lg text-white/90 [animation-delay:320ms] sm:text-xl">{c.heroText}</p>
        <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:400ms]">
          <Link href={c.heroPrimaryLink || "/contact"} className="btn btn-primary">
            {c.heroPrimaryCta} <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href={c.heroSecondaryLink || "/booking"} className="btn btn-outline-yellow">
            {c.heroSecondaryCta}
          </Link>
        </div>
        <p className="mt-5 animate-rise text-sm text-white/75 [animation-delay:460ms]">{c.heroNote}</p>
      </SplitHero>

      {/* 4. Benefits strip */}
      <section aria-label="Why choose us" className="on-light bg-brand text-ink">
        <ul className="mx-auto grid max-w-7xl divide-y divide-ink/25 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-12">
          {benefits.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-3 py-4 sm:py-5">
              <Icon className="size-8 shrink-0" strokeWidth={2} aria-hidden />
              <span className="text-lg font-extrabold">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Services */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <p className="eyebrow text-brand-dark">{c.servicesEyebrow}</p>
          <h2 className="display mt-2 text-[2.7rem] sm:text-6xl lg:text-[4rem]">{c.servicesHeading}</h2>
          <p className="mt-2 text-lg text-ink/85 sm:text-xl">{c.servicesText}</p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <li key={card.title}>
                <Link
                  href={card.link}
                  className="group flex h-full flex-col overflow-hidden rounded-[4px] border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-2">
                    <SafeImage
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">{card.title}</h3>
                      <p className="mt-1 text-[0.95rem] text-ink/75">{card.text}</p>
                    </div>
                    <ChevronRight className="size-6 shrink-0 text-brand-dark transition group-hover:translate-x-1" strokeWidth={3} aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-4 text-center text-[0.95rem]">
            <span aria-hidden className="hidden h-px flex-1 bg-ink/25 md:block" />
            <p className="mx-auto">
              <strong className="font-extrabold">Also available:</strong> {c.alsoAvailable}{" "}
              <Link href="/services" className="ml-1 whitespace-nowrap font-bold text-brand-dark underline-offset-4 hover:underline">
                All services
              </Link>
            </p>
            <span aria-hidden className="hidden h-px flex-1 bg-ink/25 md:block" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="texture-dark py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-12">
          <div className="relative">
            <div aria-hidden className="absolute -bottom-3 -left-3 h-full w-full border-[6px] border-hazard" />
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
              <SafeImage src={c.aboutImage} alt={c.aboutImageAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="eyebrow text-brand">{c.aboutEyebrow}</p>
            <h2 className="display mt-2 text-[2.7rem] sm:text-6xl">{c.aboutHeading}</h2>
            <p className="mt-5 text-lg text-white/90">{c.aboutText}</p>
            {c.aboutText2 && <p className="mt-4 text-white/75">{c.aboutText2}</p>}
            <ul className="mt-7 space-y-3">
              {[c.aboutPoint1, c.aboutPoint2, c.aboutPoint3].filter(Boolean).map((p) => (
                <li key={p} className="flex items-center gap-3 font-semibold">
                  <CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <p className="eyebrow text-brand-dark">{c.audienceEyebrow}</p>
          <h2 className="display mt-2 text-[2.7rem] sm:text-6xl">{c.audienceHeading}</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {audience.map((a) => (
              <li key={a.title} className="border-t-[6px] border-brand bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <a.icon className="size-9 text-ink" aria-hidden />
                <h3 className="mt-4 text-xl font-extrabold">{a.title}</h3>
                <p className="mt-2 text-ink/75">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="on-light bg-hazard py-16 text-ink sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{c.processEyebrow}</p>
              <h2 className="display mt-2 text-[2.7rem] sm:text-6xl">{c.processHeading}</h2>
            </div>
            <Link href="/booking" className="btn btn-dark self-start md:self-auto">
              Start a booking request <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="relative bg-ink p-7 text-white">
                <span className="display text-6xl text-brand" aria-hidden>
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-xl font-extrabold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-white/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we take */}
      <section className="on-light bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-12">
          <div>
            <p className="eyebrow text-brand-dark">{c.haulEyebrow}</p>
            <h2 className="display mt-2 text-[2.7rem] sm:text-6xl">{c.haulHeading}</h2>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {haulItems.map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-line pb-3 font-semibold">
                  <Check className="size-5 shrink-0 text-brand-dark" strokeWidth={3} aria-hidden /> {item}
                </li>
              ))}
            </ul>
            {c.haulNote && <p className="mt-6 text-ink/70">{c.haulNote}</p>}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-2 sm:aspect-[16/10] lg:aspect-[4/5]">
            <SafeImage src={c.haulImage} alt={c.haulImageAlt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            <div className="absolute bottom-0 left-0 bg-ink px-5 py-4 text-white">
              <p className="display text-2xl">Free quotes</p>
              <p className="text-sm text-white/80">Residential & commercial</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing */}
      <section className="texture-dark py-14 text-white sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:px-12">
          <div>
            <p className="eyebrow text-brand">{c.pricingEyebrow}</p>
            <h2 className="display mt-3 text-[3.2rem] sm:text-6xl lg:text-[4.4rem]">
              <span className="block">{c.pricingLine1}</span>
              <span className="block text-hazard">{c.pricingLine2}</span>
            </h2>
            <p className="mt-4 text-lg text-white/90 sm:text-xl">{c.pricingText}</p>
            <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 font-bold text-brand underline-offset-4 hover:underline">
              {c.pricingLinkLabel} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[4px] border-2 border-white/85 px-6 py-6 text-center">
                <h3 className="text-lg font-extrabold uppercase">First load</h3>
                <p className="display mt-2 text-7xl text-hazard sm:text-[5.25rem]">
                  <span className="align-top text-4xl sm:text-5xl">$</span>
                  {pricing.firstLoadPrice}
                </p>
                <p className="mt-2 text-lg font-semibold">Up to {pricing.tonsPerLoad} tons</p>
              </div>
              <div className="rounded-[4px] border-2 border-brand px-6 py-6 text-center">
                <h3 className="text-lg font-extrabold uppercase">Each additional load</h3>
                <p className="display mt-2 text-7xl text-brand sm:text-[5.25rem]">
                  <span className="align-top text-4xl sm:text-5xl">$</span>
                  {pricing.additionalLoadPrice}
                </p>
                <p className="mt-2 text-lg font-semibold">Up to {pricing.tonsPerLoad} tons &bull; Same project</p>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-white/80">{pricing.shortNote}</p>
          </div>
        </div>
      </section>

      {/* No surprises: payment & contract */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <h2 className="display text-[2.7rem] sm:text-6xl">{c.termsHeading}</h2>
          <p className="mt-2 text-lg text-ink/80">{c.termsText}</p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {terms.map((t) => (
              <li key={t.title} className="flex gap-4 border border-line bg-white p-6">
                <span className="grid size-12 shrink-0 place-items-center bg-brand">
                  <t.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-extrabold">{t.title}</h3>
                  <p className="mt-1 text-sm text-ink/75">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gallery (only when images exist) */}
      {gallery.length > 0 && (
        <section className="on-light border-t border-line bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
            <h2 className="display text-[2.7rem] sm:text-6xl">{c.galleryHeading}</h2>
            <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.slice(0, 8).map((g) => (
                <li key={g.id} className="relative aspect-square overflow-hidden bg-ink-2">
                  <SafeImage src={g.image} alt={g.alt} fill sizes="(min-width: 768px) 300px, 50vw" className="object-cover" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="texture-dark py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-12">
            <div>
              <p className="eyebrow text-brand">FAQ</p>
              <h2 className="display mt-2 text-[2.7rem] sm:text-6xl">{c.faqHeading}</h2>
              <Link href="/pricing" className="mt-6 inline-flex items-center gap-2 font-bold text-brand hover:underline">
                More pricing questions <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {faqs.map((f) => (
                <details key={f.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="display text-3xl text-hazard transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-white/80">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Compact booking */}
      <section className="on-light bg-paper py-10 sm:py-12" aria-labelledby="quick-booking-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-12 2xl:grid-cols-[auto_minmax(0,1fr)] 2xl:gap-8">
          <div>
            <h2 id="quick-booking-heading" className="display text-[2.4rem] sm:text-5xl xl:text-[2.75rem]">
              {c.bookingHeading}
            </h2>
            <p className="mt-1 text-ink/80">{c.bookingText}</p>
          </div>
          <QuickBookingForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} cta={c.bookingCta} />
        </div>
      </section>
    </>
  );
}
