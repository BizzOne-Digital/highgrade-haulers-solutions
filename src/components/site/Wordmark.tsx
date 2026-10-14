import SafeImage from "@/components/SafeImage";

/** Bundled client logo. An uploaded logo in Admin → Settings takes priority. */
export const DEFAULT_LOGO = "/images/highgrade-logo-transparent.png";

const SIZES = {
  // Header: logo plus the business name fits inside the header bar.
  md: { box: "size-12 sm:size-[3.6rem]", px: "58px", name: "text-[0.7rem] sm:text-[0.8rem]" },
  // Admin sidebar.
  sm: { box: "size-14", px: "56px", name: "text-[0.72rem]" },
  // Footer and login: large enough for the badge details to read.
  lg: { box: "size-36 sm:size-40", px: "160px", name: "text-base sm:text-lg" },
};

/** Brand logo with the business name in bold directly underneath it. */
export default function Wordmark({
  logoUrl,
  businessName,
  size = "md",
  priority = false,
  showName = true,
}: {
  logoUrl?: string;
  businessName: string;
  size?: keyof typeof SIZES;
  priority?: boolean;
  showName?: boolean;
}) {
  const s = SIZES[size];
  return (
    <span className="inline-flex flex-col items-center">
      <span className={`relative block shrink-0 ${s.box}`}>
        <SafeImage
          src={logoUrl || DEFAULT_LOGO}
          alt={showName ? "" : `${businessName} logo`}
          fill
          sizes={s.px}
          priority={priority}
          className="object-contain"
        />
      </span>
      {showName && (
        <span className={`mt-1 whitespace-nowrap text-center font-extrabold uppercase leading-tight tracking-wide text-white ${s.name}`}>
          {businessName}
        </span>
      )}
    </span>
  );
}
