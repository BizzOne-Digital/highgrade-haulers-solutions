import { AdminHeader } from "@/components/admin/AdminUI";
import ServicesManager from "@/components/admin/ServicesManager";
import { loadServices } from "@/lib/admin-data";

export default async function ServicesAdmin() {
  const services = await loadServices();
  return (
    <>
      <AdminHeader title="Services" description="Add, edit, reorder, or hide services. Active services appear on the Services page and in form dropdowns." />
      <ServicesManager initial={services} />
    </>
  );
}
