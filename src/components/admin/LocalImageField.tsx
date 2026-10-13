"use client";

import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { useAdminUI } from "@/components/admin/Toaster";
import {
  ALLOWED_MIME,
  CHUNK_BYTES,
  DIRECT_UPLOAD_MAX_BYTES,
  MAX_UPLOAD_BYTES,
  parseManagedUrl,
  type UploadFolder,
} from "@/lib/upload-rules";

type UploadResult = { success: true; url: string; filename: string; size: number; folder: UploadFolder };

async function readJson(res: Response) {
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string } & Partial<UploadResult> & {
    uploadId?: string;
    chunkSize?: number;
  };
  if (!res.ok || !data.success) {
    if (res.status === 413) throw new Error(data.error || "That file is too large for the server to accept.");
    throw new Error(data.error || `Upload failed (${res.status}).`);
  }
  return data;
}

/** Sends a file directly, or in chunks when it exceeds the host's request-body limit. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadResult> {
  if (file.size <= DIRECT_UPLOAD_MAX_BYTES) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    return (await readJson(await fetch("/api/upload", { method: "POST", body: fd }))) as UploadResult;
  }

  const init = await readJson(
    await fetch("/api/upload/chunked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, mimeType: file.type, totalSize: file.size }),
    }),
  );
  const id = init.uploadId!;
  const size = init.chunkSize ?? CHUNK_BYTES;
  try {
    for (let i = 0, off = 0; off < file.size; i++, off += size) {
      await readJson(
        await fetch(`/api/upload/chunked/${id}?index=${i}`, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.slice(off, off + size),
        }),
      );
    }
    return (await readJson(await fetch(`/api/upload/chunked/${id}`, { method: "POST" }))) as UploadResult;
  } catch (err) {
    await fetch(`/api/upload/chunked/${id}`, { method: "DELETE" }).catch(() => undefined);
    throw err;
  }
}

/** Asks the server to drop an upload; it refuses if any saved content still references it. */
export async function discardUpload(url: string) {
  if (!parseManagedUrl(url)) return;
  await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => undefined);
}

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  /** The value currently saved in the database. Unsaved uploads that get replaced are discarded. */
  savedValue?: string;
  hint?: string;
  aspect?: string;
};

/**
 * Reusable admin image field. Uploads to MongoDB via /api/upload and returns only the saved URL.
 * The previously published image is never deleted here; the server removes it after the
 * content document is saved without it (and only if nothing else references it).
 */
export default function LocalImageField({ label, value, onChange, folder, savedValue, hint, aspect = "aspect-[16/9]" }: Props) {
  const { toast } = useAdminUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const id = useId();

  const isUnsavedUpload = (url: string) => !!url && url !== savedValue && !!parseManagedUrl(url);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProblem("");
    if (!(file.type in ALLOWED_MIME)) {
      setProblem("Choose a PNG, JPEG, WebP, or GIF image.");
      toast("error", "Unsupported file type. Use PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setProblem(`This file is ${mb} MB. The maximum is 8 MB.`);
      toast("error", "Images must be 8 MB or smaller.");
      return;
    }
    setBusy(true);
    try {
      const result = await uploadImage(file, folder);
      const previous = value;
      onChange(result.url);
      if (isUnsavedUpload(previous)) void discardUpload(previous);
      toast("success", "Image uploaded. Remember to save your changes.");
    } catch (err) {
      setProblem((err as Error).message);
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (isUnsavedUpload(value)) void discardUpload(value);
    onChange("");
    toast("success", "Image removed. Save to publish the change.");
  }

  return (
    <div>
      <span id={`${id}-label`} className="label">
        {label}
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className={`relative w-full shrink-0 overflow-hidden rounded-[3px] border border-line bg-ink-2 sm:w-56 ${aspect}`}>
          {value ? (
            <SafeImage src={value} alt={`${label} preview`} fill sizes="224px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-xs font-semibold text-white/60">No image</div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-ink/70 text-white">
              <Loader2 className="size-6 animate-spin" aria-label="Uploading" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={onFile}
            disabled={busy}
            aria-labelledby={`${id}-label`}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-dark min-h-10 px-3 text-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {value ? <RefreshCw className="size-4" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button type="button" className="btn btn-outline-dark min-h-10 px-3 text-sm" onClick={remove} disabled={busy}>
                <Trash2 className="size-4" aria-hidden /> Remove
              </button>
            )}
          </div>
          <p className="break-all text-xs text-ink/60">{value || "No image selected"}</p>
          <p className="text-xs text-ink/60">{hint ?? "PNG, JPEG, WebP, or GIF up to 8 MB."}</p>
          {problem && (
            <p className="error-text" role="alert">
              {problem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
