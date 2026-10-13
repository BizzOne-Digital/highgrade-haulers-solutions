import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { AdminUIProvider } from "@/components/admin/Toaster";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin | Highgrade Haulers Solutions", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminUIProvider>
      <div className="on-light min-h-dvh bg-[#eeeee8] lg:grid lg:grid-cols-[16rem_1fr]">
        <AdminNav email={admin.email} />
        <div className="min-w-0">
          <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </AdminUIProvider>
  );
}
