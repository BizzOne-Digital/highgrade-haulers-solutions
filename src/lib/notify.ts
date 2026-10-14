import "server-only";
import { getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/**
 * Optional email alerts for new bookings and contact leads, sent through Resend's HTTP API.
 * Disabled unless RESEND_API_KEY and NOTIFY_EMAIL_FROM are set. Failures are logged and never
 * affect the saved submission; the public site never claims an email was sent.
 */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function notificationsEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL_FROM);
}

async function recipients(): Promise<string[]> {
  const fromEnv = (process.env.NOTIFY_EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (fromEnv.length) return fromEnv;
  const settings = await getSettings();
  return settings.email ? [settings.email] : [];
}

async function send(subject: string, rows: [string, string][], adminPath: string, replyTo?: string) {
  if (!notificationsEnabled()) return;
  const to = await recipients();
  if (!to.length) return;

  const visible = rows.filter(([, v]) => v && v.trim());
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px;color:#111512">${esc(subject)}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${visible
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f7f7f2;width:38%">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:16px"><a href="${esc(siteUrl() + adminPath)}" style="background:#65cf37;color:#111512;padding:10px 16px;text-decoration:none;font-weight:bold">Open in admin</a></p>
    </div>`;
  const text = visible.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nOpen in admin: ${siteUrl()}${adminPath}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.NOTIFY_EMAIL_FROM, to, subject, html, text, reply_to: replyTo || undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[notify] email failed:", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("[notify] email error:", (err as Error).message);
  }
}

type BookingData = {
  source: string;
  name: string;
  phone: string;
  service: string;
  email?: string;
  propertyType?: string;
  location?: string;
  preferredDate?: string;
  estimatedLoads?: string;
  details?: string;
};

export function notifyNewBooking(b: BookingData, reference: string) {
  return send(
    `New booking request: ${b.service} (${b.name})`,
    [
      ["Reference", reference],
      ["Name", b.name],
      ["Phone", b.phone],
      ["Email", b.email ?? ""],
      ["Service", b.service],
      ["Property type", b.propertyType ?? ""],
      ["Location", b.location ?? ""],
      ["Preferred date (requested, not confirmed)", b.preferredDate ?? ""],
      ["Estimated loads", b.estimatedLoads ?? ""],
      ["Details", b.details ?? ""],
      ["Submitted from", b.source === "home" ? "Home page quick form" : "Booking page"],
    ],
    "/admin/bookings?status=New",
    b.email,
  );
}

export function notifyNewLead(l: { name: string; email: string; phone?: string; serviceInterest?: string; message: string }) {
  return send(
    `New quote request: ${l.name}`,
    [
      ["Name", l.name],
      ["Email", l.email],
      ["Phone", l.phone ?? ""],
      ["Service interest", l.serviceInterest || "General question"],
      ["Message", l.message],
    ],
    "/admin/leads?status=New",
    l.email,
  );
}
