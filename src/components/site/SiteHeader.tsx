"use client";

import { ArrowRight, Building2, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/site/Wordmark";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/booking", label: "Booking" },
  { href: "/contact", label: "Contact" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

type Props = { businessName: string; phone: string; phoneHref: string; logoUrl: string; announcement: string };

export default function SiteHeader({ businessName, phone, phoneHref, logoUrl, announcement }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating (state reset during render, no effect needed).
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-hazard focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>

      {/* Announcement bar */}
      <div className="on-light bg-hazard text-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[0.8rem] font-bold sm:px-6 sm:text-sm lg:px-12">
          <p className="flex min-w-0 items-center gap-2">
            <Building2 className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{announcement}</span>
          </p>
          <a href={phoneHref} className="flex shrink-0 items-center gap-2 hover:underline">
            <Phone className="size-4" aria-hidden />
            <span>{phone}</span>
          </a>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex h-[5.25rem] max-w-7xl items-center justify-between gap-6 px-4 sm:h-[6.25rem] sm:px-6 lg:px-12">
          <Link href="/" className="shrink-0" aria-label={`${businessName} home`}>
            <Wordmark logoUrl={logoUrl} businessName={businessName} priority />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative py-3 text-[0.95rem] font-semibold transition-colors hover:text-brand ${
                        active ? "text-white" : "text-white/85"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 left-0 h-[3px] w-full bg-brand transition-transform ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact" className="btn btn-primary hidden sm:inline-flex">
              Get a Free Quote <ArrowRight className="size-4" aria-hidden />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-12 items-center justify-center rounded-[4px] border border-white/20 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => {
                setOpenedAt(pathname);
                setOpen((v) => !v);
              }}
            >
              {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          id="mobile-nav"
          hidden={!open}
          className="absolute inset-x-0 top-full h-[calc(100dvh-5.25rem)] overflow-y-auto border-t border-white/10 bg-ink sm:h-[calc(100dvh-6.25rem)] lg:hidden"
        >
          <nav aria-label="Mobile" className="px-4 py-6 sm:px-6">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`display flex items-center justify-between py-4 text-3xl ${active ? "text-brand" : "text-white"}`}
                    >
                      {item.label}
                      <ArrowRight className="size-6" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 grid gap-3">
              <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                Get a Free Quote <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href={phoneHref} className="btn btn-outline-yellow w-full">
                <Phone className="size-4" aria-hidden /> Call {phone}
              </a>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
