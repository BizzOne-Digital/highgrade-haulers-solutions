"use client";

import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, TextInput } from "@/components/admin/AdminUI";
import LocalImageField, { discardUpload } from "@/components/admin/LocalImageField";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import SafeImage from "@/components/SafeImage";
import type { AdminGalleryItem } from "@/lib/admin-data";

const EMPTY: AdminGalleryItem = { id: "", image: "", alt: "", caption: "", published: true };

export default function GalleryManager({ initial }: { initial: AdminGalleryItem[] }) {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [items, setItems] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null);
  const [ordering, setOrdering] = useState(false);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setItems(initial);
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setOrdering(true);
    try {
      await adminFetch("/api/admin/gallery", { method: "PATCH", body: JSON.stringify({ ids: next.map((x) => x.id) }) });
      router.refresh();
    } catch (err) {
      setItems(items);
      toast("error", (err as Error).message);
    } finally {
      setOrdering(false);
    }
  }

  async function remove(item: AdminGalleryItem) {
    if (!(await confirm("Delete this gallery image? The stored file is removed too unless other content still uses it."))) return;
    try {
      await adminFetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
      toast("success", "Gallery image deleted.");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {!editing && (
        <button type="button" className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="size-4" aria-hidden /> Add gallery image
        </button>
      )}
      {editing && (
        <GalleryForm
          key={editing.id || "new"}
          initial={editing}
          onCancel={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      <Card title={`Gallery (${items.length})`}>
        {items.length === 0 ? (
          <p className="text-ink/60">No gallery images yet. The gallery section stays hidden on the website until you add one.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g, i) => (
              <li key={g.id} className="overflow-hidden rounded-[3px] border border-line">
                <div className="relative aspect-[4/3] bg-ink-2">
                  <SafeImage src={g.image} alt={g.alt} fill sizes="300px" className="object-cover" />
                  {!g.published && <span className="absolute left-2 top-2 rounded-[3px] bg-zinc-200 px-2 py-0.5 text-xs font-bold">Hidden</span>}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{g.caption || g.alt || "No caption"}</p>
                  <div className="mt-3 flex gap-1">
                    <button type="button" className="btn btn-outline-dark min-h-9 px-2" disabled={i === 0 || ordering} onClick={() => move(i, -1)} aria-label="Move earlier">
                      {ordering ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
                    </button>
                    <button type="button" className="btn btn-outline-dark min-h-9 px-2" disabled={i === items.length - 1 || ordering} onClick={() => move(i, 1)} aria-label="Move later">
                      <ArrowDown className="size-4" aria-hidden />
                    </button>
                    <button type="button" className="btn btn-dark min-h-9 flex-1 px-2 text-sm" onClick={() => setEditing(g)}>
                      <Pencil className="size-4" aria-hidden /> Edit
                    </button>
                    <button type="button" className="btn min-h-9 border-2 border-red-700 px-2 text-red-700 hover:bg-red-50" onClick={() => remove(g)} aria-label="Delete image">
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function GalleryForm({ initial, onDone, onCancel }: { initial: AdminGalleryItem; onDone: () => void; onCancel: () => void }) {
  const { toast } = useAdminUI();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const isNew = !initial.id;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.image) {
      toast("error", "Upload an image first.");
      return;
    }
    setBusy(true);
    const { id, ...body } = v;
    try {
      await adminFetch(isNew ? "/api/admin/gallery" : `/api/admin/gallery/${id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      toast("success", isNew ? "Gallery image added." : "Gallery image saved.");
      onDone();
    } catch (err) {
      toast("error", (err as Error).message);
      setBusy(false);
    }
  }

  function cancel() {
    if (v.image !== initial.image) void discardUpload(v.image);
    onCancel();
  }

  return (
    <Card title={isNew ? "New gallery image" : "Edit gallery image"}>
      <form onSubmit={onSubmit} className="space-y-5">
        <LocalImageField label="Image" folder="gallery" value={v.image} savedValue={initial.image} onChange={(image) => setV((s) => ({ ...s, image }))} aspect="aspect-[4/3]" />
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput id="g-alt" label="Alt text" value={v.alt} onChange={(alt) => setV((s) => ({ ...s, alt }))} hint="Describe what the photo shows." />
          <TextInput id="g-caption" label="Caption (optional)" value={v.caption} onChange={(caption) => setV((s) => ({ ...s, caption }))} />
        </div>
        <label className="flex items-center gap-3 font-semibold">
          <input type="checkbox" className="size-5 accent-[#2e7d12]" checked={v.published} onChange={(e) => setV((s) => ({ ...s, published: e.target.checked }))} />
          Show on website
        </label>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" className="btn btn-outline-dark" onClick={cancel} disabled={busy}>
            <X className="size-4" aria-hidden /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Card>
  );
}
