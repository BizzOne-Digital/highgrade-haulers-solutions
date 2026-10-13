"use client";

import { ArrowDown, ArrowUp, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, TextInput } from "@/components/admin/AdminUI";
import LocalImageField, { discardUpload } from "@/components/admin/LocalImageField";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import SafeImage from "@/components/SafeImage";
import type { AdminService } from "@/lib/admin-data";

const EMPTY: AdminService = {
  id: "",
  slug: "",
  title: "",
  summary: "",
  description: "",
  residential: "",
  commercial: "",
  image: "",
  imageAlt: "",
  active: true,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ServicesManager({ initial }: { initial: AdminService[] }) {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [ordering, setOrdering] = useState(false);

  // Keep local list in sync after server refreshes.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setItems(initial);
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    setOrdering(true);
    try {
      await adminFetch("/api/admin/services", { method: "PATCH", body: JSON.stringify({ ids: next.map((s) => s.id) }) });
      toast("success", "Order saved.");
      router.refresh();
    } catch (err) {
      setItems(items);
      toast("error", (err as Error).message);
    } finally {
      setOrdering(false);
    }
  }

  async function remove(s: AdminService) {
    if (!(await confirm(`Delete "${s.title}"? This removes it from the website. This cannot be undone.`))) return;
    try {
      await adminFetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
      toast("success", "Service deleted.");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {!editing && (
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4" aria-hidden /> Add service
        </button>
      )}

      {editing && (
        <ServiceForm
          key={editing.id || "new"}
          initial={editing}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <Card title={`All services (${items.length})`}>
        {items.length === 0 ? (
          <p className="text-ink/60">No services yet. Run the seed command or add one above.</p>
        ) : (
          <ol className="divide-y divide-line">
            {items.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 py-3">
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[3px] bg-ink-2">
                  <SafeImage src={s.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold">
                    {s.title}
                    {!s.active && (
                      <span className="inline-flex items-center gap-1 rounded-[3px] bg-zinc-200 px-1.5 py-0.5 text-xs">
                        <EyeOff className="size-3" aria-hidden /> Hidden
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-ink/60">/{s.slug} • {s.summary}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="btn btn-outline-dark min-h-9 px-2" onClick={() => move(i, -1)} disabled={i === 0 || ordering} aria-label={`Move ${s.title} up`}>
                    {ordering ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
                  </button>
                  <button type="button" className="btn btn-outline-dark min-h-9 px-2" onClick={() => move(i, 1)} disabled={i === items.length - 1 || ordering} aria-label={`Move ${s.title} down`}>
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                  <button type="button" className="btn btn-dark min-h-9 px-3 text-sm" onClick={() => setEditing(s)}>
                    <Pencil className="size-4" aria-hidden /> Edit
                  </button>
                  <button type="button" className="btn min-h-9 border-2 border-red-700 px-2 text-red-700 hover:bg-red-50" onClick={() => remove(s)} aria-label={`Delete ${s.title}`}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function ServiceForm({ initial, onDone, onCancel }: { initial: AdminService; onDone: () => void; onCancel: () => void }) {
  const { toast } = useAdminUI();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof AdminService) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const isNew = !initial.id;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const { id, ...body } = { ...v, slug: v.slug || slugify(v.title) };
    try {
      await adminFetch(isNew ? "/api/admin/services" : `/api/admin/services/${id}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(body),
      });
      toast("success", isNew ? "Service added." : "Service saved.");
      onDone();
    } catch (err) {
      toast("error", (err as Error).message);
      setErrors((err as { fields?: Record<string, string> }).fields ?? {});
      setBusy(false);
    }
  }

  function cancel() {
    // An image uploaded in this form but never saved is discarded (the server keeps it if referenced).
    if (v.image !== initial.image) void discardUpload(v.image);
    onCancel();
  }

  return (
    <Card title={isNew ? "New service" : `Edit: ${initial.title}`}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput id="sv-title" label="Title" value={v.title} onChange={(t) => setV((s) => ({ ...s, title: t, slug: isNew && (!s.slug || s.slug === slugify(s.title)) ? slugify(t) : s.slug }))} error={errors.title} required />
          <TextInput id="sv-slug" label="Slug" value={v.slug} onChange={set("slug")} hint="Used in booking links: /booking?service=slug" error={errors.slug} required />
          <div className="md:col-span-2">
            <TextInput id="sv-summary" label="Short summary" value={v.summary} onChange={set("summary")} />
          </div>
          <div className="md:col-span-2">
            <TextInput id="sv-description" label="Description" multiline value={v.description} onChange={set("description")} />
          </div>
          <TextInput id="sv-res" label="Residential use" multiline value={v.residential} onChange={set("residential")} />
          <TextInput id="sv-com" label="Commercial use" multiline value={v.commercial} onChange={set("commercial")} />
          <div className="md:col-span-2">
            <LocalImageField label="Service image" folder="products" value={v.image} savedValue={initial.image} onChange={set("image")} />
          </div>
          <TextInput id="sv-alt" label="Image alt text" value={v.imageAlt} onChange={set("imageAlt")} hint="Describe what the photo shows." />
          <label className="flex items-center gap-3 self-end pb-3 font-semibold">
            <input type="checkbox" className="size-5 accent-[#2e7d12]" checked={v.active} onChange={(e) => setV((s) => ({ ...s, active: e.target.checked }))} />
            Show on website
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" className="btn btn-outline-dark" onClick={cancel} disabled={busy}>
            <X className="size-4" aria-hidden /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? "Saving…" : isNew ? "Add service" : "Save service"}
          </button>
        </div>
      </form>
    </Card>
  );
}
