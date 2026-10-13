import { ArrowRight, CalendarClock, Images, MessageSquare, Wrench } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Card, StatusBadge } from "@/components/admin/AdminUI";
import { dashboardCounts } from "@/lib/admin-data";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminDashboard() {
  const d = await dashboardCounts();
  const stats = [
    { label: "New booking requests", value: d.bookingsNew, sub: `${d.bookingsTotal} total • ${d.bookingsWeek} this week`, href: "/admin/bookings?status=New", icon: CalendarClock, alert: d.bookingsNew > 0 },
    { label: "New contact leads", value: d.leadsNew, sub: `${d.leadsTotal} total`, href: "/admin/leads?status=New", icon: MessageSquare, alert: d.leadsNew > 0 },
    { label: "Active services", value: d.services, sub: "Shown on the website", href: "/admin/services", icon: Wrench, alert: false },
    { label: "Gallery images", value: d.gallery, sub: `${d.uploads} stored uploads`, href: "/admin/gallery", icon: Images, alert: false },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="Live counts from the database. New requests need a call back." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`block h-full rounded-[4px] border bg-white p-5 hover:border-ink/40 ${s.alert ? "border-l-[6px] border-l-hazard border-line" : "border-line"}`}>
              <s.icon className="size-6 text-brand-dark" aria-hidden />
              <p className="display mt-3 text-5xl">{s.value}</p>
              <p className="mt-1 font-bold">{s.label}</p>
              <p className="text-sm text-ink/60">{s.sub}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Latest booking requests">
          {d.recentBookings.length === 0 ? (
            <p className="text-ink/60">No booking requests yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{b.name}</p>
                    <p className="truncate text-sm text-ink/60">{b.service} • {fmt(b.createdAt)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/bookings" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-dark hover:underline">
            All bookings <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
        <Card title="Latest contact leads">
          {d.recentLeads.length === 0 ? (
            <p className="text-ink/60">No contact leads yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{l.name}</p>
                    <p className="truncate text-sm text-ink/60">{l.serviceInterest || "General question"} • {fmt(l.createdAt)}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/leads" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-dark hover:underline">
            All leads <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </div>
    </>
  );
}
