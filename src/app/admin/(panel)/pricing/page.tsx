import { AdminHeader } from "@/components/admin/AdminUI";
import PricingEditor from "@/components/admin/PricingEditor";
import { loadPricing } from "@/lib/admin-data";

export default async function PricingAdmin() {
  const pricing = await loadPricing();
  return (
    <>
      <AdminHeader title="Pricing & FAQ" description="Load prices, ton limits, pricing notes, payment terms, contract details, and the pricing FAQ." />
      <PricingEditor initial={pricing} />
    </>
  );
}
