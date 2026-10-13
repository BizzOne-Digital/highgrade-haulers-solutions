import { Phone } from "lucide-react";

export default function CallStrip({ text, phone, phoneHref }: { text: string; phone: string; phoneHref: string }) {
  return (
    <section aria-label="Call us" className="on-light bg-hazard text-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-6 text-center sm:flex-row sm:gap-8 sm:px-6 sm:py-7 lg:px-12">
        <p className="display flex items-center gap-3 text-2xl sm:text-3xl">
          <Phone className="size-7 fill-ink sm:size-8" aria-hidden /> {text}
        </p>
        <span aria-hidden className="hidden h-10 w-px bg-ink/40 sm:block" />
        <a href={phoneHref} className="group flex items-baseline gap-3 rounded-[3px]">
          <span className="text-xl font-extrabold sm:text-2xl">Call</span>
          <span className="display text-4xl group-hover:underline sm:text-5xl">{phone}</span>
        </a>
      </div>
    </section>
  );
}
