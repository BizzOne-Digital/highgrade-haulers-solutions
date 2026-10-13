"use client";

import { ChevronDown, Loader2, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/AdminUI";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";

export type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  title: string;
  details: { label: string; value: string }[];
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export default function SubmissionsList({
  items,
  statuses,
  endpoint,
  basePath,
  currentStatus,
  noun,
}: {
  items: Submission[];
  statuses: readonly string[];
  endpoint: string;
  basePath: string;
  currentStatus?: string;
  noun: string;
}) {
  return (
    <div>
      <nav aria-label={`Filter ${noun}s`} className="mb-5 flex flex-wrap gap-2">
        {[undefined, ...statuses].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `${basePath}?status=${s}` : basePath}
            aria-current={currentStatus === s ? "page" : undefined}
            className={`rounded-[3px] px-3 py-1.5 text-sm font-bold ${currentStatus === s ? "bg-ink text-white" : "border border-line bg-white hover:border-ink/40"}`}
          >
            {s ?? "All"}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <p className="rounded-[4px] border border-line bg-white p-8 text-center text-ink/60">No {noun}s{currentStatus ? ` with status "${currentStatus}"` : ""}.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <Row key={item.id} item={item} statuses={statuses} endpoint={endpoint} noun={noun} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ item, statuses, endpoint, noun }: { item: Submission; statuses: readonly string[]; endpoint: string; noun: string }) {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.adminNotes);
  const [busy, setBusy] = useState<"" | "status" | "notes" | "delete">("");

  async function changeStatus(next: string) {
    const prev = status;
    setStatus(next);
    setBusy("status");
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      toast("success", `Status updated to ${next}.`);
      router.refresh();
    } catch (err) {
      setStatus(prev);
      toast("error", (err as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function saveNotes() {
    setBusy("notes");
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: "PATCH", body: JSON.stringify({ adminNotes: notes }) });
      toast("success", "Notes saved.");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!(await confirm(`Permanently delete this ${noun} from ${item.name}? This cannot be undone.`))) return;
    setBusy("delete");
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: "DELETE" });
      toast("success", `${noun[0].toUpperCase()}${noun.slice(1)} deleted.`);
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
      setBusy("");
    }
  }

  return (
    <li className={`rounded-[4px] border bg-white ${status === "New" ? "border-l-[6px] border-l-hazard border-line" : "border-line"}`}>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ChevronDown className={`size-5 shrink-0 transition ${open ? "rotate-180" : ""}`} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-bold">{item.name}</span>
            <span className="block truncate text-sm text-ink/60">
              {item.title} • {fmt(item.createdAt)}
            </span>
          </span>
        </button>
        <StatusBadge status={status} />
        <label className="sr-only" htmlFor={`status-${item.id}`}>
          Status for {item.name}
        </label>
        <div className="flex items-center gap-2">
          <select id={`status-${item.id}`} className="field min-h-10 w-40 py-1.5 text-sm" value={status} onChange={(e) => changeStatus(e.target.value)} disabled={!!busy}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {busy === "status" && <Loader2 className="size-4 animate-spin" aria-label="Saving" />}
        </div>
      </div>
      {open && (
        <div className="border-t border-line p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <a href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`} className="btn btn-primary min-h-10 px-3 text-sm">
              <Phone className="size-4" aria-hidden /> {item.phone || "No phone"}
            </a>
            {item.email && (
              <a href={`mailto:${item.email}`} className="btn btn-outline-dark min-h-10 px-3 text-sm">
                <Mail className="size-4" aria-hidden /> {item.email}
              </a>
            )}
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {item.details
              .filter((d) => d.value)
              .map((d) => (
                <div key={d.label} className={d.value.length > 80 ? "sm:col-span-2" : ""}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink/55">{d.label}</dt>
                  <dd className="whitespace-pre-wrap break-words">{d.value}</dd>
                </div>
              ))}
          </dl>
          <div className="mt-5">
            <label htmlFor={`notes-${item.id}`} className="label">
              Internal notes
            </label>
            <textarea id={`notes-${item.id}`} className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="mt-3 flex flex-wrap justify-between gap-2">
              <button type="button" onClick={remove} disabled={!!busy} className="btn min-h-10 border-2 border-red-700 px-3 text-sm text-red-700 hover:bg-red-50">
                <Trash2 className="size-4" aria-hidden /> Delete
              </button>
              <button type="button" onClick={saveNotes} disabled={!!busy || notes === item.adminNotes} className="btn btn-dark min-h-10 px-3 text-sm">
                {busy === "notes" && <Loader2 className="size-4 animate-spin" aria-hidden />} Save notes
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
