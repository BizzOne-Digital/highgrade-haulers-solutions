import { AdminHeader } from "@/components/admin/AdminUI";
import SubmissionsList from "@/components/admin/SubmissionsList";
import { loadLeads } from "@/lib/admin-data";
import { LEAD_STATUSES } from "@/lib/models";

export default async function LeadsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = LEAD_STATUSES.find((s) => s === status);
  const leads = await loadLeads(filter);
  return (
    <>
      <AdminHeader title="Contact Leads" description="Quote requests and questions from the Contact page." />
      <SubmissionsList
        noun="lead"
        endpoint="/api/admin/leads"
        basePath="/admin/leads"
        statuses={LEAD_STATUSES}
        currentStatus={filter}
        items={leads.map((l) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          phone: l.phone,
          status: l.status,
          adminNotes: l.adminNotes,
          createdAt: l.createdAt,
          title: l.serviceInterest || "General question",
          details: [
            { label: "Service interest", value: l.serviceInterest },
            { label: "Message", value: l.message },
          ],
        }))}
      />
    </>
  );
}
