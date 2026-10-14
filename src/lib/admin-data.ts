import { resolveBundledImage } from "@/lib/bundled-images";
import "server-only";
import { connectDB } from "@/lib/db";
import { Booking, BOOKING_STATUSES, ContactLead, LEAD_STATUSES, GalleryItem, PricingSettings, Service, SiteSettings, StoredUpload } from "@/lib/models";
import { DEFAULT_PRICING, DEFAULT_SERVICES, DEFAULT_SETTINGS } from "@/lib/defaults";

/** Admin loaders read straight from MongoDB (no cache) and return plain serialisable objects. */

export async function dashboardCounts() {
  await connectDB();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [bookingsNew, bookingsTotal, bookingsWeek, leadsNew, leadsTotal, services, gallery, uploads] = await Promise.all([
    Booking.countDocuments({ status: "New" }),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: weekAgo } }),
    ContactLead.countDocuments({ status: "New" }),
    ContactLead.countDocuments(),
    Service.countDocuments({ active: true }),
    GalleryItem.countDocuments(),
    StoredUpload.countDocuments(),
  ]);
  const [recentBookings, recentLeads] = await Promise.all([
    Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
    ContactLead.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return {
    bookingsNew,
    bookingsTotal,
    bookingsWeek,
    leadsNew,
    leadsTotal,
    services,
    gallery,
    uploads,
    recentBookings: recentBookings.map((b) => ({ id: String(b._id), name: b.name, service: b.service, status: b.status, createdAt: b.createdAt.toISOString() })),
    recentLeads: recentLeads.map((l) => ({ id: String(l._id), name: l.name, serviceInterest: l.serviceInterest ?? "", status: l.status, createdAt: l.createdAt.toISOString() })),
  };
}

export async function loadSettings() {
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  const out = { ...DEFAULT_SETTINGS };
  if (doc) for (const k of Object.keys(out) as (keyof typeof out)[]) if (typeof doc[k] === "string") out[k] = doc[k] as string;
  return out;
}

export async function loadServices() {
  await connectDB();
  const docs = await Service.find().sort({ order: 1, createdAt: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    title: d.title,
    summary: d.summary ?? "",
    description: d.description ?? "",
    residential: d.residential ?? "",
    commercial: d.commercial ?? "",
    image: resolveBundledImage(d.image ?? ""),
    imageAlt: resolveBundledImage(d.image ?? "") !== d.image
      ? DEFAULT_SERVICES.find((service) => service.slug === d.slug)?.imageAlt ?? d.imageAlt ?? ""
      : d.imageAlt ?? "",
    active: d.active ?? true,
  }));
}
export type AdminService = Awaited<ReturnType<typeof loadServices>>[number];

export async function loadPricing() {
  await connectDB();
  const d = await PricingSettings.findOne({ key: "main" }).lean();
  if (!d) return DEFAULT_PRICING;
  return {
    firstLoadPrice: d.firstLoadPrice,
    additionalLoadPrice: d.additionalLoadPrice,
    tonsPerLoad: d.tonsPerLoad,
    discountCopy: d.discountCopy ?? "",
    shortNote: d.shortNote ?? "",
    overageNote: d.overageNote ?? "",
    laborNote: d.laborNote ?? "",
    demolitionNote: d.demolitionNote ?? "",
    deliveryNote: d.deliveryNote ?? "",
    quoteNote: d.quoteNote ?? "",
    paymentTerms: [...(d.paymentTerms ?? [])],
    contractNote: d.contractNote ?? "",
    faqs: (d.faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" })),
  };
}

export async function loadBookings(status?: (typeof BOOKING_STATUSES)[number]) {
  await connectDB();
  const filter = status ? { status } : {};
  const docs = await Booking.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  return docs.map((b) => ({
    id: String(b._id),
    name: b.name,
    email: b.email ?? "",
    phone: b.phone,
    service: b.service,
    propertyType: b.propertyType ?? "",
    location: b.location ?? "",
    preferredDate: b.preferredDate ?? "",
    estimatedLoads: b.estimatedLoads ?? "",
    details: b.details ?? "",
    source: b.source,
    status: b.status,
    adminNotes: b.adminNotes ?? "",
    createdAt: b.createdAt.toISOString(),
  }));
}
export type AdminBooking = Awaited<ReturnType<typeof loadBookings>>[number];

export async function loadLeads(status?: (typeof LEAD_STATUSES)[number]) {
  await connectDB();
  const filter = status ? { status } : {};
  const docs = await ContactLead.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  return docs.map((l) => ({
    id: String(l._id),
    name: l.name,
    email: l.email,
    phone: l.phone ?? "",
    serviceInterest: l.serviceInterest ?? "",
    message: l.message,
    status: l.status,
    adminNotes: l.adminNotes ?? "",
    createdAt: l.createdAt.toISOString(),
  }));
}
export type AdminLead = Awaited<ReturnType<typeof loadLeads>>[number];

export async function loadGallery() {
  await connectDB();
  const docs = await GalleryItem.find().sort({ order: 1, createdAt: -1 }).lean();
  return docs.map((g) => ({ id: String(g._id), image: g.image, alt: g.alt ?? "", caption: g.caption ?? "", published: g.published ?? true }));
}
export type AdminGalleryItem = Awaited<ReturnType<typeof loadGallery>>[number];
