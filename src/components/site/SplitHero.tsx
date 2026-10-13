import SafeImage from "@/components/SafeImage";

/**
 * The reference hero: charcoal text panel on the left, photo on the right separated by a
 * diagonal yellow stripe. On small screens the photo stacks below the copy with a yellow rule.
 */
export default function SplitHero({
  image,
  imageAlt,
  children,
  badge,
  size = "lg",
}: {
  image: string;
  imageAlt: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  size?: "lg" | "md";
}) {
  const tall = size === "lg";
  return (
    <section className="texture-dark relative overflow-hidden text-white">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 ${tall ? "lg:min-h-[35rem]" : "lg:min-h-[24rem]"}`}>
        <div className={`relative z-10 py-12 sm:py-14 lg:w-[46%] ${tall ? "lg:py-20" : "lg:py-16"}`}>{children}</div>
      </div>

      {/* Mobile / tablet photo */}
      <div className="relative border-t-[6px] border-hazard lg:hidden">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/8]">
          <SafeImage src={image} alt={imageAlt} fill priority sizes="100vw" className="animate-slide-in object-cover" />
        </div>
        {badge && <div className="absolute right-4 top-4 sm:right-6">{badge}</div>}
      </div>

      {/* Desktop photo with diagonal yellow divider */}
      <div className="absolute inset-y-0 right-0 hidden w-[56%] lg:block" aria-hidden={false}>
        <div className="absolute inset-0 bg-hazard [clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]" />
        <div className="absolute inset-0 overflow-hidden [clip-path:polygon(calc(16%+16px)_0,100%_0,100%_100%,16px_100%)]">
          <SafeImage src={image} alt={imageAlt} fill priority sizes="56vw" className="animate-slide-in object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/25 via-transparent to-transparent" />
        </div>
        {badge && <div className="absolute right-8 top-10 xl:right-12">{badge}</div>}
      </div>
    </section>
  );
}

export function HeroEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow animate-rise text-brand">{children}</p>;
}
