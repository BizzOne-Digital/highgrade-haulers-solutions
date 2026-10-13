import { ArrowRight, ClipboardSignature, Hammer, Scale, Truck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import SectionHeading from "@/components/site/SectionHeading";
import SplitHero, { HeroEyebrow } from "@/components/site/SplitHero";
import { getPage, getPricing } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => pageMetadata("pricing", "/pricing");

export default async function PricingPage() {
  const [{ fields: c }, p] = await Promise.all([getPage("pricing"), getPricing()]);
  const details = [
    { icon: Scale, title: `Overages above ${p.tonsPerLoad} tons`, text: p.overageNote },
    { icon: Users, title: "Labor quoted separately", text: p.laborNote },
    { icon: Hammer, title: "Demolition cleanup", text: p.demolitionNote },
    { icon: Truck, title: "Material deliveries", text: p.deliveryNote },
  ].filter((d) => d.text);

  return (
    <>
      <SplitHero image={c.heroImage} imageAlt={c.heroImageAlt} size="md">
        <HeroEyebrow>{c.heroEyebrow}</HeroEyebrow>
        <h1 className="display mt-4 animate-rise text-[3.2rem] sm:text-7xl lg:text-[4.8rem]">{c.heroHeading}</h1>
        <p className="mt-5 max-w-md animate-rise text-lg text-white/90">{c.heroText}</p>
        <div className="mt-7 animate-rise">
          <Link href="/contact" className="btn btn-primary">
            Get a Free Quote <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </SplitHero>

      {/* Load pricing */}
      <section className="texture-dark border-t border-white/10 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <SectionHeading dark eyebrow={c.cardsEyebrow} title={c.cardsHeading} />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-[4px] border-2 border-white/85 p-8 text-center">
              <h2 className="text-xl font-extrabold uppercase">First dump trailer load</h2>
              <p className="display mt-3 text-8xl text-hazard sm:text-[7rem]">
                <span className="align-top text-5xl">$</span>
                {p.firstLoadPrice}
              </p>
              <p className="mt-2 text-xl font-semibold">Includes up to {p.tonsPerLoad} tons</p>
            </article>
            <article className="rounded-[4px] border-2 border-brand p-8 text-center">
              <h2 className="text-xl font-extrabold uppercase">Each additional load</h2>
              <p className="display mt-3 text-8xl text-brand sm:text-[7rem]">
                <span className="align-top text-5xl">$</span>
                {p.additionalLoadPrice}
              </p>
              <p className="mt-2 text-xl font-semibold">Up to {p.tonsPerLoad} tons per load &bull; Same project</p>
            </article>
          </div>
          {p.discountCopy && (
            <p className="mx-auto mt-8 max-w-3xl border-l-4 border-hazard bg-white/5 px-5 py-4 text-lg text-white/90">{p.discountCopy}</p>
          )}
          <p className="mt-4 text-center text-sm text-white/75">
            These prices apply to dump trailer loads. Other services are quoted for your specific project.
          </p>
        </div>
      </section>

      {/* Other pricing details */}
      <section className="on-light bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <SectionHeading title={c.detailsHeading} text={p.quoteNote} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {details.map((d) => (
              <li key={d.title} className="rounded-[4px] border border-line bg-white p-6">
                <d.icon className="size-8 text-brand-dark" aria-hidden />
                <h3 className="mt-3 text-xl font-extrabold">{d.title}</h3>
                <p className="mt-2 text-ink/80">{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Payment & contract */}
      <section className="on-light border-t border-line bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-12">
          <div>
            <SectionHeading title={c.paymentHeading} />
            <p className="mt-4 text-ink/75">No online payment is taken. Payment is arranged directly once your job is confirmed.</p>
          </div>
          <div className="space-y-4">
            {p.paymentTerms.map((t) => (
              <div key={t} className="flex gap-4 rounded-[4px] border border-line bg-paper p-5">
                <Wallet className="mt-0.5 size-6 shrink-0 text-brand-dark" aria-hidden />
                <p className="font-medium">{t}</p>
              </div>
            ))}
            {p.contractNote && (
              <div className="flex gap-4 rounded-[4px] border-2 border-ink bg-hazard p-5">
                <ClipboardSignature className="mt-0.5 size-6 shrink-0" aria-hidden />
                <p className="font-semibold">{p.contractNote}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {p.faqs.length > 0 && (
        <section className="on-light bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeading eyebrow="FAQ" title={c.faqHeading} />
            <div className="mt-8 divide-y divide-line border-y border-line">
              {p.faqs.map((f) => (
                <details key={f.question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden className="display text-3xl text-brand-dark transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-ink/80">{f.answer}</p>
                </details>
              ))}
            </div>
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
