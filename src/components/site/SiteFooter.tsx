import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Wordmark from "@/components/site/Wordmark";
import FooterNav from "@/components/site/FooterNav";
import type { SiteSettingsData } from "@/lib/defaults";

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export { FacebookIcon };

export default function SiteFooter({ settings }: { settings: SiteSettingsData }) {
  const year = new Date().getFullYear();
  return (
    <footer className="texture-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr_1.4fr] md:items-start lg:px-12">
        <div>
          <Link href="/" aria-label={`${settings.businessName} home`} className="inline-block">
            <Wordmark logoUrl={settings.logoUrl} businessName={settings.businessName} size="lg" />
          </Link>
          {settings.serviceArea && (
            <p className="mt-4 flex max-w-xs items-start gap-2 text-sm font-semibold text-white/85">
              <MapPin className="mt-0.5 size-4 shrink-0 text-hazard" aria-hidden /> {settings.serviceArea}
            </p>
          )}
        </div>

        <ul className="space-y-3 text-[0.95rem] text-white/85">
          <li>
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-3 hover:text-brand">
              <Mail className="size-4 text-white/70" aria-hidden /> {settings.email}
            </a>
          </li>
          <li>
            <a href={settings.phoneHref} className="inline-flex items-center gap-3 hover:text-brand">
              <Phone className="size-4 text-white/70" aria-hidden /> {settings.phone}
            </a>
          </li>
          {settings.facebookUrl && (
            <li>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 hover:text-brand"
              >
                <FacebookIcon className="size-4 text-white/70" /> Facebook
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          )}
        </ul>

        <div className="md:text-right">
          <FooterNav />
          <p className="mt-6 text-xs text-white/60">
            &copy; {year} {settings.businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
