"use client";

import { ArrowRight, CheckCircle2, ListChecks, Loader2, Phone, User } from "lucide-react";
import Link from "next/link";
import { Honeypot } from "@/components/forms/FormParts";
import { isPhone, usePublicForm } from "@/components/forms/usePublicForm";

type Option = { slug: string; title: string };

/** Compact three-field booking strip used on the home page. */
export default function QuickBookingForm({ services, cta }: { services: Option[]; cta: string }) {
  const { status, errors, message, reference, submit, reset } = usePublicForm("/api/bookings");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const values = {
      source: "home",
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      service: String(fd.get("service") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const errs: Record<string, string> = {};
    if (values.name.length < 2) errs.name = "Please enter your name.";
    if (!isPhone(values.phone)) errs.phone = "Please enter a valid phone number.";
    if (!values.service) errs.service = "Please choose a service.";
    const okay = await submit(values, errs);
    if (okay) form.reset();
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-[4px] border-2 border-brand bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 font-semibold">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-brand-dark" aria-hidden />
          <span>
            Request received{reference ? ` (ref. ${reference})` : ""}. It is pending confirmation, and we will call you to
            plan the next step.
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Link href="/booking" className="btn btn-outline-dark min-h-11 px-4 text-sm">
            Add details
          </Link>
          <button type="button" onClick={reset} className="btn btn-dark min-h-11 px-4 text-sm">
            New request
          </button>
        </div>
      </div>
    );
  }

  const busy = status === "submitting";
  const fieldCls = (k: string) => `field pl-10 ${errors[k] ? "border-red-700" : ""}`;

  return (
    <form onSubmit={onSubmit} noValidate className="relative" aria-describedby={message ? "quick-form-msg" : undefined}>
      <Honeypot />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr_auto]">
        <div>
          <label htmlFor="qb-name" className="sr-only">
            Your name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/55" aria-hidden />
            <input id="qb-name" name="name" autoComplete="name" placeholder="Your name" className={fieldCls("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "qb-name-error" : undefined} disabled={busy} />
          </div>
          {errors.name && <p id="qb-name-error" className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="qb-phone" className="sr-only">
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/55" aria-hidden />
            <input id="qb-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone number" className={fieldCls("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "qb-phone-error" : undefined} disabled={busy} />
          </div>
          {errors.phone && <p id="qb-phone-error" className="error-text">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="qb-service" className="sr-only">
            Service needed
          </label>
          <div className="relative">
            <ListChecks className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/55" aria-hidden />
            <select id="qb-service" name="service" defaultValue="" className={`${fieldCls("service")} select`} aria-invalid={!!errors.service} aria-describedby={errors.service ? "qb-service-error" : undefined} disabled={busy}>
              <option value="" disabled>
                Service needed
              </option>
              {services.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          {errors.service && <p id="qb-service-error" className="error-text">{errors.service}</p>}
        </div>
        <button type="submit" className="btn btn-primary sm:col-span-2 lg:col-span-1" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              {cta} <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
      {message && (
        <p id="quick-form-msg" role="alert" className="error-text mt-3">
          {message}
        </p>
      )}
    </form>
  );
}
