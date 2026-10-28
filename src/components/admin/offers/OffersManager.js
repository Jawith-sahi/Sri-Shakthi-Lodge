"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/FormParts";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Textarea } from "@/components/ui/Field";
import { SingleImageInput } from "@/components/ui/SingleImageInput";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { PUBLISH_STATUS_META } from "@/constants/statuses";
import { adminCreateOffer, adminDeleteOffer, adminListOffers, adminUpdateOffer } from "@/lib/api/offers.api";
import { formatDate } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

const offerSchema = z
  .object({
    titleEn: z.string().trim().min(2, "validation.required").max(120, "validation.tooLong"),
    titleTa: z.string().trim().max(120, "validation.tooLong").optional(),
    descEn: z.string().trim().max(1000, "validation.tooLong").optional(),
    descTa: z.string().trim().max(1000, "validation.tooLong").optional(),
    termsEn: z.string().trim().max(2000, "validation.tooLong").optional(),
    termsTa: z.string().trim().max(2000, "validation.tooLong").optional(),
    imageUrl: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isPublished: z.boolean(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, { path: ["endDate"], message: "validation.dateOrder" });

function OfferForm({ initial, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      titleEn: initial.title?.en || "",
      titleTa: initial.title?.ta || "",
      descEn: initial.description?.en || "",
      descTa: initial.description?.ta || "",
      termsEn: initial.terms?.en || "",
      termsTa: initial.terms?.ta || "",
      imageUrl: initial.imageUrl || "",
      startDate: initial.startDate || "",
      endDate: initial.endDate || "",
      isPublished: Boolean(initial.isPublished),
    },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          title: { en: v.titleEn, ta: v.titleTa || "" },
          description: { en: v.descEn || "", ta: v.descTa || "" },
          terms: { en: v.termsEn || "", ta: v.termsTa || "" },
          imageUrl: v.imageUrl || "",
          startDate: v.startDate || null,
          endDate: v.endDate || null,
          isPublished: v.isPublished,
        })
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="titleEn" label="Title (English)" required error={errors.titleEn?.message} {...register("titleEn")} />
        <Input name="titleTa" label="Title (Tamil)" lang="ta" error={errors.titleTa?.message} {...register("titleTa")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea name="descEn" label="Description (English)" rows={3} error={errors.descEn?.message} {...register("descEn")} />
        <Textarea name="descTa" label="Description (Tamil)" lang="ta" rows={3} error={errors.descTa?.message} {...register("descTa")} />
      </div>
      <SingleImageInput label="Offer image" value={watch("imageUrl")} onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })} hint="Optional. JPG, PNG or WebP up to 5 MB." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="startDate" type="date" label="Valid from" optionalText="optional" error={errors.startDate?.message} {...register("startDate")} />
        <Input name="endDate" type="date" label="Valid until" optionalText="optional" error={errors.endDate?.message} {...register("endDate")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea name="termsEn" label="Terms (English)" rows={3} error={errors.termsEn?.message} {...register("termsEn")} />
        <Textarea name="termsTa" label="Terms (Tamil)" lang="ta" rows={3} error={errors.termsTa?.message} {...register("termsTa")} />
      </div>
      <Checkbox name="isPublished" label="Published (visible on the website while the dates are valid)" {...register("isPublished")} />
      <FormActions onCancel={onCancel} submitting={submitting} />
    </form>
  );
}

export function OffersManager() {
  return (
    <ResourceManager
      config={{
        title: "Offers",
        singular: "Offer",
        description: "Special offers shown on the website. Only published offers within their dates are visible.",
        searchPlaceholder: "Search offers…",
        fetcher: adminListOffers,
        create: adminCreateOffer,
        update: adminUpdateOffer,
        remove: adminDeleteOffer,
        Form: OfferForm,
        statusOptions: [
          { value: "", label: "All" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ],
        columns: ({ onEdit, onDelete }) => [
          { key: "title", header: "Offer", primary: true, render: (o) => <span className="font-semibold text-primary-900">{pick(o.title, "en")}</span> },
          { key: "startDate", header: "Valid", render: (o) => (o.startDate || o.endDate ? `${o.startDate ? formatDate(o.startDate, "en") : "…"} → ${o.endDate ? formatDate(o.endDate, "en") : "…"}` : "Always") },
          { key: "isPublished", header: "Status", render: (o) => <MetaBadge value={Boolean(o.isPublished)} meta={PUBLISH_STATUS_META} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (o) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(o)} aria-label="Edit offer"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(o)} aria-label="Delete offer"><Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" /></Button>
              </div>
            ),
          },
        ],
      }}
    />
  );
}
