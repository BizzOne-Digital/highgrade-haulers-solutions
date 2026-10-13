"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV } from "@/components/site/SiteHeader";

export default function FooterNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Footer">
      <ul className="flex flex-wrap gap-x-7 gap-y-3 md:justify-end">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative pb-1.5 text-[0.95rem] font-semibold hover:text-brand ${active ? "text-white" : "text-white/80"}`}
              >
                {item.label}
                {active && <span aria-hidden className="absolute bottom-0 left-0 h-[3px] w-full bg-brand" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
