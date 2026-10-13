"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, SaveBar, TextInput } from "@/components/admin/AdminUI";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import type { PricingData } from "@/lib/defaults";

type TextKey = Exclude<keyof PricingData, "firstLoadPrice" | "additionalLoadPrice" | "tonsPerLoad" | "paymentTerms" | "faqs">;

export default function PricingEditor({ initial }: { initial: PricingData }) {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const setText = (k: TextKey) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const setNum = (k: "firstLoadPrice" | "additionalLoadPrice" | "tonsPerLoad") => (val: string) =>
    setV((s) => ({ ...s, [k]: val === "" ? 0 : Number(val) }));

  function moveFaq(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= v.faqs.length) return;
    const faqs = [...v.faqs];
    [faqs[i], faqs[j]] = [faqs[j], faqs[i]];
    setV((s) => ({ ...s, faqs }));
  }

  async function removeFaq(i: number) {
    if (!(await confirm("Remove this FAQ? It will disappear from the website after you save.", "Remove"))) return;
    setV((s) => ({ ...s, faqs: s.faqs.filter((_, x) => x !== i) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch("/api/admin/pricing", {
        method: "PUT",
        body: JSON.stringify({ ...v, paymentTerms: v.paymentTerms.filter((t) => t.trim()) }),
      });
      toast("success", "Pricing saved and published.");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Dump trailer loads">
        <div className="grid gap-5 sm:grid-cols-3">
          <TextInput id="firstLoadPrice" label="First load price ($)" type="number" value={String(v.firstLoadPrice)} onChange={setNum("firstLoadPrice")} />
          <TextInput id="additionalLoadPrice" label="Each additional load ($)" type="number" value={String(v.additionalLoadPrice)} onChange={setNum("additionalLoadPrice")} />
          <TextInput id="tonsPerLoad" label="Tons included per load" type="number" value={String(v.tonsPerLoad)} onChange={setNum("tonsPerLoad")} />
          <div className="sm:col-span-3">
            <TextInput id="discountCopy" label="Same-project discount explanation" multiline value={v.discountCopy} onChange={setText("discountCopy")} />
          </div>
          <div className="sm:col-span-3">
            <TextInput id="shortNote" label="Short note under price cards (home page)" value={v.shortNote} onChange={setText("shortNote")} />
          </div>
        </div>
      </Card>

      <Card title="Pricing notes">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput id="overageNote" label="Overage charges" multiline value={v.overageNote} onChange={setText("overageNote")} />
          <TextInput id="laborNote" label="Labor" multiline value={v.laborNote} onChange={setText("laborNote")} />
          <TextInput id="demolitionNote" label="Demolition cleanup" multiline value={v.demolitionNote} onChange={setText("demolitionNote")} />
          <TextInput id="deliveryNote" label="Material deliveries" multiline value={v.deliveryNote} onChange={setText("deliveryNote")} />
          <div className="md:col-span-2">
            <TextInput id="quoteNote" label="Free quote note" multiline value={v.quoteNote} onChange={setText("quoteNote")} />
          </div>
        </div>
      </Card>

      <Card title="Payment terms & contract">
        <div className="space-y-3">
          {v.paymentTerms.map((t, i) => (
            <div key={i} className="flex gap-2">
              <label htmlFor={`term-${i}`} className="sr-only">
                Payment term {i + 1}
              </label>
              <input id={`term-${i}`} className="field" value={t} onChange={(e) => setV((s) => ({ ...s, paymentTerms: s.paymentTerms.map((x, j) => (j === i ? e.target.value : x)) }))} />
              <button type="button" className="btn min-h-12 border-2 border-red-700 px-3 text-red-700 hover:bg-red-50" aria-label={`Remove payment term ${i + 1}`} onClick={() => setV((s) => ({ ...s, paymentTerms: s.paymentTerms.filter((_, j) => j !== i) }))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-dark min-h-10 px-3 text-sm" onClick={() => setV((s) => ({ ...s, paymentTerms: [...s.paymentTerms, ""] }))}>
            <Plus className="size-4" aria-hidden /> Add payment term
          </button>
          <div className="pt-3">
            <TextInput id="contractNote" label="Contract note" multiline value={v.contractNote} onChange={setText("contractNote")} />
          </div>
        </div>
      </Card>

      <Card title={`Pricing FAQ (${v.faqs.length})`}>
        <ol className="space-y-4">
          {v.faqs.map((f, i) => (
            <li key={i} className="rounded-[3px] border border-line bg-paper p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink/60">Question {i + 1}</span>
                <div className="flex gap-1">
                  <button type="button" className="btn btn-outline-dark min-h-8 px-2" aria-label="Move question up" disabled={i === 0} onClick={() => moveFaq(i, -1)}>
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                  <button type="button" className="btn btn-outline-dark min-h-8 px-2" aria-label="Move question down" disabled={i === v.faqs.length - 1} onClick={() => moveFaq(i, 1)}>
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                  <button type="button" className="btn min-h-8 border-2 border-red-700 px-2 text-red-700 hover:bg-red-50" aria-label={`Remove question ${i + 1}`} onClick={() => removeFaq(i)}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                <TextInput id={`faq-q-${i}`} label="Question" value={f.question} onChange={(x) => setV((s) => ({ ...s, faqs: s.faqs.map((q, j) => (j === i ? { ...q, question: x } : q)) }))} />
                <TextInput id={`faq-a-${i}`} label="Answer" multiline value={f.answer} onChange={(x) => setV((s) => ({ ...s, faqs: s.faqs.map((q, j) => (j === i ? { ...q, answer: x } : q)) }))} />
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn-outline-dark mt-4 min-h-10 px-3 text-sm" onClick={() => setV((s) => ({ ...s, faqs: [...s.faqs, { question: "", answer: "" }] }))}>
          <Plus className="size-4" aria-hidden /> Add question
        </button>
      </Card>

      <SaveBar busy={busy} dirty={dirty} />
    </form>
  );
}
