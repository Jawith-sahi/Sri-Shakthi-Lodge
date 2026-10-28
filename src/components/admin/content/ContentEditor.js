"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Textarea } from "@/components/ui/Field";
import { SingleImageInput } from "@/components/ui/SingleImageInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, Notice } from "@/components/ui/States";
import { adminGetContent, adminPublishContent, adminSaveContent } from "@/lib/api/content.api";
import { getAdminErrorMessage } from "@/lib/api/errors";

const POLICY_FIELDS = [
  { key: "cancellation", label: "Cancellation policy" },
  { key: "terms", label: "Terms and conditions" },
  { key: "privacy", label: "Privacy policy" },
];

function toForm(c = {}) {
  return {
    aboutEn: c.about?.en || "",
    aboutTa: c.about?.ta || "",
    aboutImageUrl: c.aboutImageUrl || "",
    heroImageUrl: c.heroImageUrl || "",
    announcementActive: Boolean(c.announcement?.active),
    announcementEn: c.announcement?.text?.en || "",
    announcementTa: c.announcement?.text?.ta || "",
    faq: (c.faq || []).map((f) => ({ qEn: f.q?.en || "", qTa: f.q?.ta || "", aEn: f.a?.en || "", aTa: f.a?.ta || "" })),
    policies: Object.fromEntries(POLICY_FIELDS.map(({ key }) => [key, { en: c.policies?.[key]?.en || "", ta: c.policies?.[key]?.ta || "" }])),
  };
}

function fromForm(v) {
  return {
    about: { en: v.aboutEn, ta: v.aboutTa },
    aboutImageUrl: v.aboutImageUrl,
    heroImageUrl: v.heroImageUrl,
    announcement: { active: v.announcementActive, text: { en: v.announcementEn, ta: v.announcementTa } },
    faq: v.faq
      .filter((f) => f.qEn.trim() && f.aEn.trim())
      .map((f) => ({ q: { en: f.qEn.trim(), ta: f.qTa.trim() }, a: { en: f.aEn.trim(), ta: f.aTa.trim() } })),
    policies: v.policies,
  };
}

function Block({ title, description, children }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 className="text-lg font-semibold text-primary-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ContentEditor() {
  const [state, setState] = useState({ loading: true, error: null });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, control, formState: { isDirty } } = useForm({ defaultValues: toForm() });
  const faq = useFieldArray({ control, name: "faq" });

  const load = () => {
    setState({ loading: true, error: null });
    adminGetContent()
      .then((c) => {
        reset(toForm(c));
        setState({ loading: false, error: null });
      })
      .catch((e) => setState({ loading: false, error: getAdminErrorMessage(e) }));
  };

  useEffect(() => {
    let alive = true;
    adminGetContent()
      .then((c) => {
        if (!alive) return;
        reset(toForm(c));
        setState({ loading: false, error: null });
      })
      .catch((e) => alive && setState({ loading: false, error: getAdminErrorMessage(e) }));
    return () => {
      alive = false;
    };
  }, [reset]);

  const save = handleSubmit(async (v) => {
    setSaving(true);
    try {
      await adminSaveContent(fromForm(v));
      reset(v);
      setSaved(true);
      toast.success("Draft saved. It is not on the website until you publish.");
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    } finally {
      setSaving(false);
    }
  });

  const publish = async () => {
    setPublishing(true);
    try {
      await adminPublishContent();
      setSaved(false);
      toast.success("Published. The website now shows this content.");
    } catch (e) {
      toast.error(getAdminErrorMessage(e));
    } finally {
      setPublishing(false);
    }
  };

  if (state.loading) {
    return (
      <div>
        <AdminPageHeader title="Website content" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (state.error) return <ErrorState title="Could not load content" body={state.error} action={<Button variant="outline" onClick={load}>Try again</Button>} />;

  return (
    <form onSubmit={save} noValidate>
      <AdminPageHeader
        title="Website content"
        description="Text and pictures shown on the public website. Anything left empty uses the built-in wording."
        actions={
          <>
            <Button type="submit" variant="outline" loading={saving} disabled={!isDirty}>Save draft</Button>
            <Button type="button" onClick={publish} loading={publishing} disabled={isDirty || (!saved && !isDirty && false)}>Publish</Button>
          </>
        }
      />
      {isDirty ? <Notice tone="warning" className="mb-4">You have unsaved changes. Save the draft first, then publish.</Notice> : null}

      <div className="space-y-6">
        <Block title="Announcement banner" description="A short notice shown at the top of every page while it is switched on.">
          <Checkbox name="announcementActive" label="Show the banner" {...register("announcementActive")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="announcementEn" label="Text (English)" maxLength={200} {...register("announcementEn")} />
            <Input name="announcementTa" label="Text (Tamil)" lang="ta" maxLength={200} {...register("announcementTa")} />
          </div>
        </Block>

        <Block title="Pictures">
          <div className="grid gap-4 sm:grid-cols-2">
            <SingleImageInput label="Home page main picture" value={watch("heroImageUrl")} onChange={(u) => setValue("heroImageUrl", u, { shouldDirty: true })} hint="Wide photo of the lodge. JPG, PNG or WebP up to 5 MB." />
            <SingleImageInput label="About picture" value={watch("aboutImageUrl")} onChange={(u) => setValue("aboutImageUrl", u, { shouldDirty: true })} />
          </div>
        </Block>

        <Block title="About the lodge" description="Only write facts the lodge has confirmed.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea name="aboutEn" label="English" rows={6} {...register("aboutEn")} />
            <Textarea name="aboutTa" label="Tamil" lang="ta" rows={6} {...register("aboutTa")} />
          </div>
        </Block>

        <Block title="Frequently asked questions" description="Questions with an English question and answer are shown on the website.">
          {faq.fields.length === 0 ? <p className="text-sm text-muted">No questions yet.</p> : null}
          {faq.fields.map((f, i) => (
            <div key={f.id} className="space-y-3 rounded-lg border border-line p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-900">Question {i + 1}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => faq.remove(i)} aria-label={`Remove question ${i + 1}`}>
                  <Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name={`faq.${i}.qEn`} label="Question (English)" {...register(`faq.${i}.qEn`)} />
                <Input name={`faq.${i}.qTa`} label="Question (Tamil)" lang="ta" {...register(`faq.${i}.qTa`)} />
                <Textarea name={`faq.${i}.aEn`} label="Answer (English)" rows={3} {...register(`faq.${i}.aEn`)} />
                <Textarea name={`faq.${i}.aTa`} label="Answer (Tamil)" lang="ta" rows={3} {...register(`faq.${i}.aTa`)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => faq.append({ qEn: "", qTa: "", aEn: "", aTa: "" })}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a question
          </Button>
        </Block>

        <Block title="Policies" description="If a policy is left empty, the website shows only the facts already confirmed in its settings. Have the lodge owner approve policy wording, especially refunds.">
          {POLICY_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-primary-900">{label}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Textarea name={`policies.${key}.en`} label="English" rows={6} {...register(`policies.${key}.en`)} />
                <Textarea name={`policies.${key}.ta`} label="Tamil" lang="ta" rows={6} {...register(`policies.${key}.ta`)} />
              </div>
            </div>
          ))}
        </Block>
      </div>
    </form>
  );
}
