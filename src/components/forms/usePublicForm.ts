"use client";

import { useEffect, useRef, useState } from "react";

export type FormStatus = "idle" | "submitting" | "success" | "error";

/**
 * Shared submit logic for public forms. Adds spam-protection fields, maps server field errors,
 * and only reports success when the API confirms the record was saved.
 */
export function usePublicForm(endpoint: string) {
  const startedAt = useRef(0);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(values: Record<string, string>, clientErrors: Record<string, string>) {
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      return false;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        fields?: Record<string, string>;
        reference?: string;
      };
      if (res.ok && data.success) {
        setStatus("success");
        setReference(data.reference ?? "");
        return true;
      }
      setErrors(data.fields ?? {});
      setMessage(data.error ?? "Something went wrong. Please try again or call us.");
      setStatus("error");
    } catch {
      setMessage("Network error. Please check your connection, or call us directly.");
      setStatus("error");
    }
    return false;
  }

  function reset() {
    setStatus("idle");
    setErrors({});
    setMessage("");
    startedAt.current = Date.now();
  }

  return { status, errors, message, reference, submit, reset };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isPhone = (v: string) => /^[0-9+().\-\s]+$/.test(v.trim()) && v.replace(/\D/g, "").length >= 7;
