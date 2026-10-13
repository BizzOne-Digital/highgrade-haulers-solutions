import { AdminHeader } from "@/components/admin/AdminUI";
import GalleryManager from "@/components/admin/GalleryManager";
import UploadsInventory from "@/components/admin/UploadsInventory";
import { loadGallery } from "@/lib/admin-data";

export default async function GalleryAdmin() {
  const items = await loadGallery();
  return (
    <>
      <AdminHeader
        title="Gallery & Uploads"
        description="Published gallery images appear on the Services page. Images are stored in MongoDB and survive redeployments."
      />
      <GalleryManager initial={items} />
      <div className="mt-10">
        <UploadsInventory />
      </div>
    </>
  );
}
