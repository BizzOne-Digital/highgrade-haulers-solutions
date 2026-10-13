import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Wordmark from "@/components/site/Wordmark";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin Login | Highgrade Haulers Solutions", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { expired } = await searchParams;
  return (
    <main className="texture-dark grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Wordmark businessName="Highgrade Haulers Solutions" size="lg" priority />
        </div>
        <div className="on-light rounded-[4px] border-t-[6px] border-brand bg-white p-6 sm:p-8">
          <h1 className="display text-4xl">Admin Login</h1>
          {expired && <p className="mt-3 text-sm font-semibold text-red-800">Your session expired. Please log in again.</p>}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
