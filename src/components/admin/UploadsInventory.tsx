"use client";

import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/admin/AdminUI";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import SafeImage from "@/components/SafeImage";

type Upload = { url: string; folder: string; filename: string; size: number; mimeType: string; createdAt: string; inUse: boolean };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** Lists every stored upload with whether saved content still uses it, and cleans up unused files. */
export default function UploadsInventory() {
  const { toast, confirm } = useAdminUI();
  const [uploads, setUploads] = useState<Upload[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<{ uploads: Upload[] }>("/api/admin/uploads");
      setUploads(data.uploads);
    } catch (err) {
      toast("error", (err as Error).message);
      setUploads([]);
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ uploads: Upload[] }>("/api/admin/uploads")
      .then((d) => !cancelled && setUploads(d.uploads))
      .catch(() => !cancelled && setUploads([]));
    return () => {
      cancelled = true;
    };
  }, []);

  async function removeOne(u: Upload) {
    if (!(await confirm(`Delete ${u.filename}? Only unused files can be deleted.`))) return;
    try {
      const r = await adminFetch<{ result: string }>("/api/upload", { method: "DELETE", body: JSON.stringify({ url: u.url }) });
      toast(r.result === "in-use" ? "error" : "success", r.result === "in-use" ? "That image is in use and was kept." : "Upload deleted.");
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  async function cleanup() {
    if (!(await confirm("Delete all uploads older than 24 hours that no saved content uses?", "Clean up"))) return;
    setBusy(true);
    try {
      const r = await adminFetch<{ removed: number }>("/api/admin/uploads", { method: "POST", body: JSON.stringify({ olderThanHours: 24 }) });
      toast("success", `Removed ${r.removed} unused upload${r.removed === 1 ? "" : "s"}.`);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const unused = uploads?.filter((u) => !u.inUse).length ?? 0;

  return (
    <Card title="Stored uploads">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          {uploads === null ? "Loading…" : `${uploads.length} files • ${unused} not used by any saved content`}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline-dark min-h-10 px-3 text-sm" onClick={load}>
            <RefreshCw className="size-4" aria-hidden /> Refresh
          </button>
          <button type="button" className="btn btn-dark min-h-10 px-3 text-sm" onClick={cleanup} disabled={busy || unused === 0}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />} Clean up unused
          </button>
        </div>
      </div>
      {uploads && uploads.length > 0 && (
        <ul className="divide-y divide-line">
          {uploads.map((u) => (
            <li key={u.url} className="flex items-center gap-3 py-2.5">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-[3px] bg-ink-2">
                <SafeImage src={u.url} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs">{u.url}</p>
                <p className="text-xs text-ink/60">
                  {kb(u.size)} • {u.mimeType} • {new Date(u.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
              {u.inUse ? (
                <span className="rounded-[3px] bg-brand/30 px-2 py-0.5 text-xs font-bold text-green-900">In use</span>
              ) : (
                <button type="button" className="btn min-h-8 border-2 border-red-700 px-2 text-xs text-red-700 hover:bg-red-50" onClick={() => removeOne(u)}>
                  <Trash2 className="size-3.5" aria-hidden /> Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
