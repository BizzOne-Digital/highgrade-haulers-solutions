"use client";

import {
  CalendarClock,
  DollarSign,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Wordmark from "@/components/site/Wordmark";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/leads", label: "Contact Leads", icon: MessageSquare },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/pricing", label: "Pricing & FAQ", icon: DollarSign },
  { href: "/admin/gallery", label: "Gallery & Uploads", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/admin/login");
  }

  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="texture-dark text-white lg:sticky lg:top-0 lg:h-dvh">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
        <Link href="/admin" aria-label="Admin dashboard">
          <Wordmark businessName="Highgrade Haulers Solutions" size="sm" />
        </Link>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[4px] border border-white/20 lg:hidden"
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} border-t border-white/10 px-3 pb-6 lg:block`}>
        <ul className="mt-3 space-y-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active(href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-semibold ${
                  active(href) ? "bg-brand text-ink" : "text-white/85 hover:bg-white/10"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10">
            <ExternalLink className="size-4" aria-hidden /> View website
          </a>
          <button type="button" onClick={logout} disabled={busy} className="flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-left text-sm font-semibold text-white/85 hover:bg-white/10">
            <LogOut className="size-4" aria-hidden /> {busy ? "Signing out…" : "Log out"}
          </button>
          <p className="truncate px-3 pt-2 text-xs text-white/50">{email}</p>
        </div>
      </nav>
    </aside>
  );
}
