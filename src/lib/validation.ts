import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number.")
  .max(30, "Please enter a valid phone number.")
  .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number.")
  .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a valid phone number.");
const email = z.string().trim().max(200).email("Please enter a valid email address.");

/** Spam protection fields shared by public forms: a hidden honeypot and a render timestamp. */
export const antiSpam = z.object({
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
});

export const quickBookingSchema = z.object({
  source: z.literal("home"),
  name: trimmed(100).min(2, "Please enter your name."),
  phone,
  service: trimmed(120).min(1, "Please choose a service."),
});

export const fullBookingSchema = z.object({
  source: z.literal("booking"),
  name: trimmed(100).min(2, "Please enter your name."),
  email,
  phone,
  service: trimmed(120).min(1, "Please choose a service."),
  propertyType: trimmed(60).min(1, "Please choose a property type."),
  location: trimmed(300).min(3, "Please enter the job address or location."),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date.")
    .or(z.literal(""))
    .optional(),
  estimatedLoads: trimmed(20).optional(),
  details: trimmed(3000).optional(),
});

export const bookingSchema = z.discriminatedUnion("source", [quickBookingSchema, fullBookingSchema]);

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name."),
  email,
  phone: phone.or(z.literal("")).optional(),
  serviceInterest: trimmed(120).optional(),
  message: trimmed(3000).min(10, "Please tell us a little more (at least 10 characters)."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

/** Admin URLs: managed uploads, site-relative paths, or https links. */
const safeUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//i.test(v), "Use a relative path or an https:// URL.")
  .refine((v) => !v.startsWith("//"), "Use a relative path or an https:// URL.");

export const settingsSchema = z.object({
  businessName: trimmed(120).min(1, "Business name is required."),
  ownerName: trimmed(120),
  phone: trimmed(40).min(7, "Phone is required."),
  phoneHref: z.string().trim().regex(/^tel:\+?[0-9]{7,15}$/, "Use the format tel:+13126102757."),
  email: email,
  facebookUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\/(www\.|m\.)?(facebook|fb)\.com\/.+/i.test(v), "Enter a full https://facebook.com/... URL or leave blank."),
  serviceArea: trimmed(500),
  logoUrl: safeUrl,
  announcement: trimmed(120),
});

export const pageSchema = z.object({
  seoTitle: trimmed(120),
  seoDescription: trimmed(320),
  ogImage: safeUrl,
  fields: z.record(z.string().max(60), z.string().max(4000)),
});

export const serviceSchema = z.object({
  title: trimmed(120).min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes."),
  summary: trimmed(200),
  description: trimmed(2000),
  residential: trimmed(600),
  commercial: trimmed(600),
  image: safeUrl,
  imageAlt: trimmed(200),
  active: z.boolean(),
});

export const pricingSchema = z.object({
  firstLoadPrice: z.coerce.number().min(0).max(100000),
  additionalLoadPrice: z.coerce.number().min(0).max(100000),
  tonsPerLoad: z.coerce.number().min(0).max(100),
  discountCopy: trimmed(1000),
  shortNote: trimmed(300),
  overageNote: trimmed(1000),
  laborNote: trimmed(1000),
  demolitionNote: trimmed(1000),
  deliveryNote: trimmed(1000),
  quoteNote: trimmed(1000),
  paymentTerms: z.array(trimmed(500)).max(20),
  contractNote: trimmed(1000),
  faqs: z
    .array(z.object({ question: trimmed(300).min(1, "FAQ question is required."), answer: trimmed(2000).min(1, "FAQ answer is required.") }))
    .max(40),
});

export const galleryItemSchema = z.object({
  image: safeUrl.refine((v) => v.length > 0, "An image is required."),
  alt: trimmed(200),
  caption: trimmed(300),
  published: z.boolean(),
});

export function firstIssue(err: z.ZodError) {
  const i = err.issues[0];
  return i ? i.message : "Invalid input.";
}

export function fieldIssues(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
