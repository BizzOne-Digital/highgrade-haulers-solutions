"use client";

import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, SaveBar, TextInput } from "@/components/admin/AdminUI";
import LocalImageField from "@/components/admin/LocalImageField";
import { adminFetch, useAdminUI } from "@/components/admin/Toaster";
import type { FieldDef } from "@/lib/defaults";
import type { PageSlug } from "@/lib/models";

type PageState = { seoTitle: string; seoDescription: string; ogImage: string; fields: Record<string, string> };

const TABS: { slug: PageSlug; label: string; path: string }[] = [
  { slug: "home", label: "Home", path: "/" },
  { slug: "services", label: "Services", path: "/services" },
  { slug: "pricing", label: "Pricing", path: "/pricing" },
  { slug: "booking", label: "Booking", path: "/booking" },
  { slug: "contact", label: "Contact", path: "/contact" },
];

export default function PagesEditor({ initial, defs }: { initial: Record<PageSlug, PageState>; defs: Record<PageSlug, FieldDef[]> }) {
  const [tab, setTab] = useState<PageSlug>("home");
  return (
    <div>
      <div role="tablist" aria-label="Pages" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.slug}
            role="tab"
            type="button"
            id={`tab-${t.slug}`}
            aria-selected={tab === t.slug}
            aria-controls={`panel-${t.slug}`}
            onClick={() => setTab(t.slug)}
            className={`rounded-[3px] px-4 py-2 text-sm font-bold ${tab === t.slug ? "bg-ink text-white" : "border border-line bg-white hover:border-ink/40"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) =>
        t.slug === tab ? (
          <div key={t.slug} role="tabpanel" id={`panel-${t.slug}`} aria-labelledby={`tab-${t.slug}`}>
            <PageForm slug={t.slug} path={t.path} initial={initial[t.slug]} defs={defs[t.slug]} />
          </div>
        ) : null,
      )}
    </div>
  );
}

function PageForm({ slug, path, initial, defs }: { slug: PageSlug; path: string; initial: PageState; defs: FieldDef[] }) {
  const router = useRouter();
  const { toast } = useAdminUI();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(v) !== JSON.stringify(initial);
  const setField = (key: string) => (val: string) => setV((s) => ({ ...s, fields: { ...s.fields, [key]: val } }));

  const groups = defs.reduce<Record<string, FieldDef[]>>((acc, d) => {
    (acc[d.group] ??= []).push(d);
    return acc;
  }, {});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch(`/api/admin/pages/${slug}`, { method: "PUT", body: JSON.stringify(v) });
      toast("success", "Page saved and published.");
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-end">
        <a href={path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark hover:underline">
          Preview live page <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
      {Object.entries(groups).map(([group, fields]) => (
        <Card key={group} title={group}>
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((d) =>
              d.type === "image" ? (
                <div key={d.key} className="md:col-span-2">
                  <LocalImageField label={d.label} folder="pages" value={v.fields[d.key] ?? ""} savedValue={initial.fields[d.key]} onChange={setField(d.key)} />
                </div>
              ) : (
                <div key={d.key} className={d.type === "textarea" ? "md:col-span-2" : ""}>
                  <TextInput
                    id={`${slug}-${d.key}`}
                    label={d.label}
                    value={v.fields[d.key] ?? ""}
                    onChange={setField(d.key)}
                    multiline={d.type === "textarea"}
                    hint={d.type === "link" ? "A site path like /booking, or a full https:// link." : undefined}
                  />
                </div>
              ),
            )}
          </div>
        </Card>
      ))}
      <Card title="SEO">
        <div className="grid gap-5">
          <TextInput id={`${slug}-seoTitle`} label="Page title" value={v.seoTitle} onChange={(x) => setV((s) => ({ ...s, seoTitle: x }))} hint={`${v.seoTitle.length}/60 characters recommended`} />
          <TextInput id={`${slug}-seoDescription`} label="Meta description" multiline value={v.seoDescription} onChange={(x) => setV((s) => ({ ...s, seoDescription: x }))} hint={`${v.seoDescription.length}/160 characters recommended`} />
          <LocalImageField label="Social share image (optional)" folder="pages" value={v.ogImage} savedValue={initial.ogImage} onChange={(x) => setV((s) => ({ ...s, ogImage: x }))} hint="Defaults to the hero image. 1200×630 works best." />
        </div>
      </Card>
      <SaveBar busy={busy} dirty={dirty} />
    </form>
  );
}
