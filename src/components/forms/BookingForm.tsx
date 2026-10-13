"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { describedBy, Field, FormAlert, Honeypot } from "@/components/forms/FormParts";
import { isEmail, isPhone, usePublicForm } from "@/components/forms/usePublicForm";

type Option = { slug: string; title: string };

type Props = {
  services: Option[];
  propertyTypes: string[];
  defaultService?: string;
  successTitle: string;
  successText: string;
  phone: string;
  phoneHref: string;
  email: string;
};

function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function BookingForm(props: Props) {
  const { status, errors, message, reference, submit, reset } = usePublicForm("/api/bookings");
  const [minDate] = useState(todayLocal);
  const busy = status === "submitting";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const values = {
      source: "booking",
      name: v("name"),
      email: v("email"),
      phone: v("phone"),
      service: v("service"),
      propertyType: v("propertyType"),
      location: v("location"),
      preferredDate: v("preferredDate"),
      estimatedLoads: v("estimatedLoads"),
      details: v("details"),
      website: v("website"),
    };
    const errs: Record<string, string> = {};
    if (values.name.length < 2) errs.name = "Please enter your name.";
    if (!isEmail(values.email)) errs.email = "Please enter a valid email address.";
    if (!isPhone(values.phone)) errs.phone = "Please enter a valid phone number.";
    if (!values.service) errs.service = "Please choose a service.";
    if (!values.propertyType) errs.propertyType = "Please choose a property type.";
    if (values.location.length < 3) errs.location = "Please enter the job address or location.";
    const okay = await submit(values, errs);
    if (okay) {
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[4px] border-2 border-brand bg-white p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-brand-dark" aria-hidden />
        <h2 className="display mt-4 text-4xl">{props.successTitle}</h2>
        {reference && (
          <p className="mt-2 text-sm font-bold text-ink/70">
            Request reference: <span className="font-mono">{reference}</span>
          </p>
        )}
        <p className="mt-4 max-w-prose text-ink/80">{props.successText}</p>
        <p className="mt-4 text-sm text-ink/70">
          Need to add something? Call <a className="font-bold underline" href={props.phoneHref}>{props.phone}</a> or email{" "}
          <a className="font-bold underline" href={`mailto:${props.email}`}>{props.email}</a>.
        </p>
        <button type="button" onClick={reset} className="btn btn-dark mt-6">
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5" aria-busy={busy}>
      <Honeypot />
      <FormAlert message={message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="bk-name" label="Full name" error={errors.name}>
          <input id="bk-name" name="name" autoComplete="name" className="field" aria-invalid={!!errors.name} aria-describedby={describedBy("bk-name", errors.name)} disabled={busy} required />
        </Field>
        <Field id="bk-phone" label="Phone" error={errors.phone}>
          <input id="bk-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" aria-invalid={!!errors.phone} aria-describedby={describedBy("bk-phone", errors.phone)} disabled={busy} required />
        </Field>
        <Field id="bk-email" label="Email" error={errors.email}>
          <input id="bk-email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} aria-describedby={describedBy("bk-email", errors.email)} disabled={busy} required />
        </Field>
        <Field id="bk-service" label="Service" error={errors.service}>
          <select id="bk-service" name="service" defaultValue={props.defaultService ?? ""} className="field" aria-invalid={!!errors.service} aria-describedby={describedBy("bk-service", errors.service)} disabled={busy} required>
            <option value="" disabled>
              Choose a service
            </option>
            {props.services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Not sure / other">Not sure / other</option>
          </select>
        </Field>
        <Field id="bk-property" label="Property type" error={errors.propertyType}>
          <select id="bk-property" name="propertyType" defaultValue="" className="field" aria-invalid={!!errors.propertyType} aria-describedby={describedBy("bk-property", errors.propertyType)} disabled={busy} required>
            <option value="" disabled>
              Choose a property type
            </option>
            {props.propertyTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field id="bk-location" label="Job address or location" error={errors.location}>
          <input id="bk-location" name="location" autoComplete="street-address" className="field" aria-invalid={!!errors.location} aria-describedby={describedBy("bk-location", errors.location)} disabled={busy} required />
        </Field>
        <Field id="bk-date" label="Preferred date" optional hint="A request only. We will confirm availability with you." error={errors.preferredDate}>
          <input id="bk-date" name="preferredDate" type="date" min={minDate} className="field" aria-invalid={!!errors.preferredDate} aria-describedby={describedBy("bk-date", errors.preferredDate, true)} disabled={busy} />
        </Field>
        <Field id="bk-loads" label="Estimated loads" optional hint="For dump trailer rental, if you know it." error={errors.estimatedLoads}>
          <select id="bk-loads" name="estimatedLoads" defaultValue="" className="field" aria-describedby={describedBy("bk-loads", errors.estimatedLoads, true)} disabled={busy}>
            <option value="">Not sure / not applicable</option>
            <option value="1">1 load</option>
            <option value="2">2 loads</option>
            <option value="3">3 loads</option>
            <option value="4+">4 or more loads</option>
          </select>
        </Field>
      </div>

      <Field id="bk-details" label="Project details" optional error={errors.details}>
        <textarea id="bk-details" name="details" rows={5} maxLength={3000} placeholder="What needs to go, roughly how much, and anything about access (stairs, driveway, gate)." className="field" aria-describedby={describedBy("bk-details", errors.details)} disabled={busy} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/70">No payment is required. This sends a request; it does not confirm an appointment.</p>
        <button type="submit" className="btn btn-primary shrink-0" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending request…
            </>
          ) : (
            <>
              Send Booking Request <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
