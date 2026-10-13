"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Toast = { id: number; kind: "success" | "error"; text: string };
type ConfirmState = { message: string; confirmLabel: string; resolve: (ok: boolean) => void } | null;

const Ctx = createContext<{
  toast: (kind: Toast["kind"], text: string) => void;
  confirm: (message: string, confirmLabel?: string) => Promise<boolean>;
} | null>(null);

export function useAdminUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminUI must be used inside <AdminUIProvider>");
  return ctx;
}

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const nextId = useRef(1);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback(
    (message: string, confirmLabel = "Delete") =>
      new Promise<boolean>((resolve) => setConfirmState({ message, confirmLabel, resolve })),
    [],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (confirmState && !d.open) d.showModal();
    if (!confirmState && d.open) d.close();
  }, [confirmState]);

  const settle = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-[4px] border px-4 py-3 text-sm font-semibold shadow-lg ${
              t.kind === "success" ? "border-brand bg-ink text-white" : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <span className="flex-1">{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          settle(false);
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[4px] border border-line p-0 backdrop:bg-ink/60"
        aria-labelledby="confirm-title"
      >
        <div className="p-6">
          <h2 id="confirm-title" className="flex items-center gap-2 text-lg font-extrabold">
            <AlertTriangle className="size-5 text-red-700" aria-hidden /> Please confirm
          </h2>
          <p className="mt-3 text-ink/80">{confirmState?.message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-outline-dark min-h-10 px-4 text-sm" onClick={() => settle(false)} autoFocus>
              Cancel
            </button>
            <button type="button" className="btn min-h-10 border-2 border-red-700 bg-red-700 px-4 text-sm text-white hover:bg-red-800" onClick={() => settle(true)}>
              {confirmState?.confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </Ctx.Provider>
  );
}

/** JSON fetch helper for admin APIs; throws with the server's safe error message. */
export async function adminFetch<T = Record<string, unknown>>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; fields?: Record<string, string> } & T;
  if (res.status === 401) {
    window.location.replace("/admin/login?expired=1");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!res.ok || data.success === false) {
    throw Object.assign(new Error(data.error || `Request failed (${res.status}).`), { fields: data.fields });
  }
  return data;
}
