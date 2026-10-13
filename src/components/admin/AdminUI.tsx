import { Loader2, Save } from "lucide-react";

export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[4px] border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-5 text-lg font-extrabold">{title}</h2>}
      {children}
    </section>
  );
}

export function SaveBar({ busy, dirty, label = "Save changes" }: { busy: boolean; dirty?: boolean; label?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-line bg-[#eeeee8]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      {dirty && <span className="text-sm font-semibold text-ink/70">Unsaved changes</span>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  multiline,
  type = "text",
  hint,
  error,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} className="field min-h-24" rows={3} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} required={required} />
      ) : (
        <input id={id} type={type} className="field" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} required={required} />
      )}
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export const STATUS_STYLES: Record<string, string> = {
  New: "bg-hazard text-ink",
  Contacted: "bg-sky-100 text-sky-900",
  Scheduled: "bg-violet-100 text-violet-900",
  Completed: "bg-brand/30 text-green-900",
  Cancelled: "bg-zinc-200 text-zinc-700",
  Closed: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-bold ${STATUS_STYLES[status] ?? "bg-zinc-100"}`}>{status}</span>;
}
