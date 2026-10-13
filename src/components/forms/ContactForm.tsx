"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { describedBy, Field, FormAlert, Honeypot } from "@/components/forms/FormParts";
import { isEmail, isPhone, usePublicForm } from "@/components/forms/usePublicForm";

type Option = { slug: string; title: string };

export default function ContactForm({
  services,
  successTitle,
  successText,
}: {
  services: Option[];
  successTitle: string;
  successText: string;
}) {
  const { status, errors, message, submit, reset } = usePublicForm("/api/contact");
  const busy = status === "submitting";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const values = {
      name: v("name"),
      email: v("email"),
      phone: v("phone"),
      serviceInterest: v("serviceInterest"),
      message: v("message"),
      website: v("website"),
    };
    const errs: Record<string, string> = {};
    if (values.name.length < 2) errs.name = "Please enter your name.";
    if (!isEmail(values.email)) errs.email = "Please enter a valid email address.";
    if (values.phone && !isPhone(values.phone)) errs.phone = "Please enter a valid phone number.";
    if (values.message.length < 10) errs.message = "Please tell us a little more (at least 10 characters).";
    if (await submit(values, errs)) form.reset();
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-[4px] border-2 border-brand bg-white p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-brand-dark" aria-hidden />
        <h2 className="display mt-4 text-4xl">{successTitle}</h2>
        <p className="mt-4 max-w-prose text-ink/80">{successText}</p>
        <button type="button" onClick={reset} className="btn btn-dark mt-6">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5" aria-busy={busy}>
      <Honeypot />
      <FormAlert message={message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="ct-name" label="Full name" error={errors.name}>
          <input id="ct-name" name="name" autoComplete="name" className="field" aria-invalid={!!errors.name} aria-describedby={describedBy("ct-name", errors.name)} disabled={busy} required />
        </Field>
        <Field id="ct-email" label="Email" error={errors.email}>
          <input id="ct-email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} aria-describedby={describedBy("ct-email", errors.email)} disabled={busy} required />
        </Field>
        <Field id="ct-phone" label="Phone" optional error={errors.phone}>
          <input id="ct-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" aria-invalid={!!errors.phone} aria-describedby={describedBy("ct-phone", errors.phone)} disabled={busy} />
        </Field>
        <Field id="ct-service" label="Service interest" optional>
          <select id="ct-service" name="serviceInterest" defaultValue="" className="field" disabled={busy}>
            <option value="">General question</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="ct-message" label="Message" error={errors.message}>
        <textarea id="ct-message" name="message" rows={6} maxLength={3000} className="field" aria-invalid={!!errors.message} aria-describedby={describedBy("ct-message", errors.message)} disabled={busy} required />
      </Field>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
          </>
        ) : (
          <>
            Request a Free Quote <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
