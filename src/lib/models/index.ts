import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { UPLOAD_FOLDERS } from "@/lib/upload-rules";

/* ---------- AdminUser ---------- */
const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);
export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>;
export const AdminUser: Model<AdminUserDoc> = models.AdminUser || model("AdminUser", AdminUserSchema);

/* ---------- AdminSession ---------- */
// Only a SHA-256 hash of the session token is stored; the raw token lives in the HttpOnly cookie.
const AdminSessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type AdminSessionDoc = InferSchemaType<typeof AdminSessionSchema>;
export const AdminSession: Model<AdminSessionDoc> =
  models.AdminSession || model("AdminSession", AdminSessionSchema);

/* ---------- RateLimit ---------- */
// Fixed-window counters shared across serverless instances; expired windows are removed by TTL.
const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type RateLimitDoc = InferSchemaType<typeof RateLimitSchema>;
export const RateLimit: Model<RateLimitDoc> = models.RateLimit || model("RateLimit", RateLimitSchema);

/* ---------- SiteSettings ---------- */
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    businessName: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    phone: { type: String, default: "" },
    phoneHref: { type: String, default: "" },
    email: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    serviceArea: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    announcement: { type: String, default: "" },
  },
  { timestamps: true },
);
export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

/* ---------- PageContent ---------- */
// Editable copy for one public page, stored as a flat key -> string map so every field
// (text, CTA labels, image URLs) is editable from the admin panel.
export const PAGE_SLUGS = ["home", "services", "pricing", "booking", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
const PageContentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, enum: PAGE_SLUGS },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    fields: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);
export type PageContentDoc = InferSchemaType<typeof PageContentSchema>;
export const PageContent: Model<PageContentDoc> = models.PageContent || model("PageContent", PageContentSchema);

/* ---------- Service ---------- */
const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    residential: { type: String, default: "" },
    commercial: { type: String, default: "" },
    image: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ServiceSchema.index({ active: 1, order: 1 });
export type ServiceDoc = InferSchemaType<typeof ServiceSchema>;
export const Service: Model<ServiceDoc> = models.Service || model("Service", ServiceSchema);

/* ---------- PricingSettings ---------- */
const PricingSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    firstLoadPrice: { type: Number, default: 400 },
    additionalLoadPrice: { type: Number, default: 350 },
    tonsPerLoad: { type: Number, default: 2 },
    discountCopy: { type: String, default: "" },
    shortNote: { type: String, default: "" },
    overageNote: { type: String, default: "" },
    laborNote: { type: String, default: "" },
    demolitionNote: { type: String, default: "" },
    deliveryNote: { type: String, default: "" },
    quoteNote: { type: String, default: "" },
    paymentTerms: { type: [String], default: [] },
    contractNote: { type: String, default: "" },
    faqs: { type: [{ _id: false, question: String, answer: String }], default: [] },
  },
  { timestamps: true },
);
export type PricingSettingsDoc = InferSchemaType<typeof PricingSettingsSchema>;
export const PricingSettings: Model<PricingSettingsDoc> =
  models.PricingSettings || model("PricingSettings", PricingSettingsSchema);

/* ---------- Booking ---------- */
export const BOOKING_STATUSES = ["New", "Contacted", "Scheduled", "Completed", "Cancelled"] as const;
const BookingSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    propertyType: { type: String, default: "" },
    location: { type: String, default: "" },
    preferredDate: { type: String, default: "" },
    estimatedLoads: { type: String, default: "" },
    details: { type: String, default: "" },
    source: { type: String, enum: ["home", "booking"], default: "booking" },
    status: { type: String, enum: BOOKING_STATUSES, default: "New" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true },
);
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ createdAt: -1 });
export type BookingDoc = InferSchemaType<typeof BookingSchema>;
export const Booking: Model<BookingDoc> = models.Booking || model("Booking", BookingSchema);

/* ---------- ContactLead ---------- */
export const LEAD_STATUSES = ["New", "Contacted", "Closed"] as const;
const ContactLeadSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    serviceInterest: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: LEAD_STATUSES, default: "New" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true },
);
ContactLeadSchema.index({ status: 1, createdAt: -1 });
ContactLeadSchema.index({ createdAt: -1 });
export type ContactLeadDoc = InferSchemaType<typeof ContactLeadSchema>;
export const ContactLead: Model<ContactLeadDoc> = models.ContactLead || model("ContactLead", ContactLeadSchema);

/* ---------- GalleryItem ---------- */
const GalleryItemSchema = new Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
GalleryItemSchema.index({ published: 1, order: 1 });
export type GalleryItemDoc = InferSchemaType<typeof GalleryItemSchema>;
export const GalleryItem: Model<GalleryItemDoc> = models.GalleryItem || model("GalleryItem", GalleryItemSchema);

/* ---------- StoredUpload ---------- */
const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true, enum: UPLOAD_FOLDERS },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    // Excluded by default so listings never pull binary data.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true },
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.index({ createdAt: -1 });
export type StoredUploadDoc = InferSchemaType<typeof StoredUploadSchema>;
export const StoredUpload: Model<StoredUploadDoc> =
  models.StoredUpload || model("StoredUpload", StoredUploadSchema);

/* ---------- Chunked upload staging ---------- */
// Temporary parts of a chunked upload. Incomplete sessions are removed by TTL after 1 hour.
const UploadSessionSchema = new Schema({
  uploadId: { type: String, required: true, unique: true },
  folder: { type: String, required: true, enum: UPLOAD_FOLDERS },
  mimeType: { type: String, required: true },
  totalSize: { type: Number, required: true },
  totalChunks: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 },
});
export type UploadSessionDoc = InferSchemaType<typeof UploadSessionSchema>;
export const UploadSession: Model<UploadSessionDoc> =
  models.UploadSession || model("UploadSession", UploadSessionSchema);

const UploadChunkSchema = new Schema({
  uploadId: { type: String, required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 },
});
UploadChunkSchema.index({ uploadId: 1, index: 1 }, { unique: true });
export type UploadChunkDoc = InferSchemaType<typeof UploadChunkSchema>;
export const UploadChunk: Model<UploadChunkDoc> = models.UploadChunk || model("UploadChunk", UploadChunkSchema);
