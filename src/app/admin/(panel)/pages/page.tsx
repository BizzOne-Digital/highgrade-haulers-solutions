import { AdminHeader } from "@/components/admin/AdminUI";
import PagesEditor from "@/components/admin/PagesEditor";
import { loadPages } from "@/lib/admin-data";
import { PAGE_FIELDS } from "@/lib/defaults";

export default async function PagesAdmin() {
  const pages = await loadPages();
  return (
    <>
      <AdminHeader title="Page Content" description="Edit text, images, buttons, and SEO for each public page. Changes go live when you save." />
      <PagesEditor initial={pages} defs={PAGE_FIELDS} />
    </>
  );
}
