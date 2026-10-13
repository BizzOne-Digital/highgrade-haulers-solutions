import SafeImage from "@/components/SafeImage";

/** Bundled client logo. An uploaded logo in Admin → Settings takes priority. */
export const DEFAULT_LOGO = "/images/highgrade-logo-transparent.png";

const SIZES = {
  // Header: fits inside the 72px / 84px header bar.
  md: "size-[3.75rem] sm:size-[4.6rem]",
  // Admin sidebar and login.
  sm: "size-16",
  // Footer: large enough for the badge details to read.
  lg: "size-36 sm:size-40",
};

/** Brand logo used in the header, footer, and admin. */
export default function Wordmark({
  logoUrl,
  businessName,
  size = "md",
  priority = false,
}: {
  logoUrl?: string;
  businessName: string;
  size?: keyof typeof SIZES;
  priority?: boolean;
}) {
  const sizes = size === "lg" ? "160px" : size === "md" ? "74px" : "64px";
  return (
    <span className={`relative block shrink-0 ${SIZES[size]}`}>
      <SafeImage
        src={logoUrl || DEFAULT_LOGO}
        alt={`${businessName} logo`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
