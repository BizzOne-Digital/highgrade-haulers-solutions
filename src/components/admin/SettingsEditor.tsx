"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, SaveBar, TextInput } from "@/components/admin/AdminUI";
import LocalImageField from "@/components/admin/LocalImageField";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import type { SiteSettingsData } from "@/lib/defaults";

export default function SettingsEditor({ initial }: { initial: SiteSettingsData }) {
  const router = useRouter();
  const { toast } = useAdminUI();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof SiteSettingsData) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await adminFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(v) });
      toast("success", "Settings saved and published.");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
      const fields = (err as { fields?: Record<string, string> }).fields;
      if (fields) setErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Business details">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput id="businessName" label="Business name" value={v.businessName} onChange={set("businessName")} error={errors.businessName} required />
          <TextInput id="ownerName" label="Owner name" value={v.ownerName} onChange={set("ownerName")} />
          <TextInput id="phone" label="Phone (display)" value={v.phone} onChange={set("phone")} required />
          <TextInput id="phoneHref" label="Phone link" value={v.phoneHref} onChange={set("phoneHref")} hint="Format: tel:+13126102757" required />
          <TextInput id="email" label="Email" type="email" value={v.email} onChange={set("email")} required />
          <TextInput id="announcement" label="Announcement bar text" value={v.announcement} onChange={set("announcement")} />
        </div>
      </Card>
      <Card title="Online presence & service area">
        <div className="grid gap-5">
          <TextInput
            id="facebookUrl"
            label="Facebook URL"
            value={v.facebookUrl}
            onChange={set("facebookUrl")}
            hint="Leave blank to hide all Facebook links. Must be a full https://facebook.com/... address."
          />
          <TextInput
            id="serviceArea"
            label="Service area (optional)"
            value={v.serviceArea}
            onChange={set("serviceArea")}
            multiline
            hint="Shown on the contact page and footer only when filled in."
          />
        </div>
      </Card>
      <Card title="Logo">
        <LocalImageField
          label="Logo image"
          folder="misc"
          value={v.logoUrl}
          savedValue={initial.logoUrl}
          onChange={set("logoUrl")}
          aspect="aspect-[4/1]"
          hint="Optional. A transparent PNG or WebP on a dark background works best. Leave empty to use the text wordmark."
        />
      </Card>
      <SaveBar busy={busy} dirty={dirty} />
    </form>
  );
}
