import { AdminHeader } from "@/components/admin/AdminUI";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { loadSettings } from "@/lib/admin-data";

export default async function SettingsPage() {
  const settings = await loadSettings();
  return (
    <>
      <AdminHeader title="Settings" description="Business details used in the header, footer, contact page, and structured data." />
      <SettingsEditor initial={settings} />
    </>
  );
}
