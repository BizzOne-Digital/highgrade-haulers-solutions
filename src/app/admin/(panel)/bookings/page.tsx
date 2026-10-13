import { AdminHeader } from "@/components/admin/AdminUI";
import SubmissionsList from "@/components/admin/SubmissionsList";
import { loadBookings } from "@/lib/admin-data";
import { BOOKING_STATUSES } from "@/lib/models";

export default async function BookingsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = BOOKING_STATUSES.find((s) => s === status);
  const bookings = await loadBookings(filter);
  return (
    <>
      <AdminHeader title="Booking Requests" description="Requests are not confirmed appointments. Call the customer, then move the status forward." />
      <SubmissionsList
        noun="booking request"
        endpoint="/api/admin/bookings"
        basePath="/admin/bookings"
        statuses={BOOKING_STATUSES}
        currentStatus={filter}
        items={bookings.map((b) => ({
          id: b.id,
          name: b.name,
          email: b.email,
          phone: b.phone,
          status: b.status,
          adminNotes: b.adminNotes,
          createdAt: b.createdAt,
          title: b.service,
          details: [
            { label: "Service", value: b.service },
            { label: "Property type", value: b.propertyType },
            { label: "Location", value: b.location },
            { label: "Preferred date (requested)", value: b.preferredDate },
            { label: "Estimated loads", value: b.estimatedLoads },
            { label: "Submitted from", value: b.source === "home" ? "Home page quick form" : "Booking page" },
            { label: "Project details", value: b.details },
          ],
        }))}
      />
    </>
  );
}
