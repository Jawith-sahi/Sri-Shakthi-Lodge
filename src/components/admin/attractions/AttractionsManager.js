"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/FormParts";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Field";
import { SingleImageInput } from "@/components/ui/SingleImageInput";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { ATTRACTION_CATEGORIES, PUBLISH_STATUS_META } from "@/constants/statuses";
import { getValidMapsUrl } from "@/config/lodge";
import { adminCreateAttraction, adminDeleteAttraction, adminListAttractions, adminUpdateAttraction } from "@/lib/api/attractions.api";
import { pick } from "@/lib/utils/localize";

const attractionSchema = z.object({
  nameEn: z.string().trim().min(2, "validation.required").max(120, "validation.tooLong"),
  nameTa: z.string().trim().max(120, "validation.tooLong").optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").optional().or(z.literal("")),
  descEn: z.string().trim().max(2000, "validation.tooLong").optional(),
  descTa: z.string().trim().max(2000, "validation.tooLong").optional(),
  category: z.string().min(1, "validation.required"),
  imageUrl: z.string().optional(),
  mapsUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || getValidMapsUrl(v), "Enter a Google Maps link (https://…) or leave this empty."),
  order: z.coerce.number("validation.number").int("validation.number").min(0, "validation.number"),
  isPublished: z.boolean(),
});

function AttractionForm({ initial, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attractionSchema),
    defaultValues: {
      nameEn: initial.name?.en || "",
      nameTa: initial.name?.ta || "",
      slug: initial.slug || "",
      descEn: initial.description?.en || "",
      descTa: initial.description?.ta || "",
      category: initial.category || "other",
      imageUrl: initial.imageUrl || "",
      mapsUrl: initial.mapsUrl || "",
      order: initial.order ?? 0,
      isPublished: initial.isPublished !== false,
    },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          name: { en: v.nameEn, ta: v.nameTa || "" },
          slug: v.slug || undefined,
          description: { en: v.descEn || "", ta: v.descTa || "" },
          category: v.category,
          imageUrl: v.imageUrl || "",
          mapsUrl: v.mapsUrl || "",
          order: v.order,
          isPublished: v.isPublished,
        })
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="nameEn" label="Name (English)" required error={errors.nameEn?.message} {...register("nameEn")} />
        <Input name="nameTa" label="Name (Tamil)" lang="ta" error={errors.nameTa?.message} {...register("nameTa")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea name="descEn" label="Description (English)" rows={4} hint="Do not add distances or timings unless they are confirmed." error={errors.descEn?.message} {...register("descEn")} />
        <Textarea name="descTa" label="Description (Tamil)" lang="ta" rows={4} error={errors.descTa?.message} {...register("descTa")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category" label="Category" required error={errors.category?.message} {...register("category")}>
          {ATTRACTION_CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </Select>
        <Input name="order" type="number" min={0} label="Order" error={errors.order?.message} {...register("order")} />
      </div>
      <Input name="mapsUrl" label="Google Maps link" optionalText="optional" error={errors.mapsUrl?.message} {...register("mapsUrl")} />
      <Input name="slug" label="Web address part (slug)" optionalText="optional" error={errors.slug?.message} {...register("slug")} />
      <SingleImageInput label="Picture" value={watch("imageUrl")} onChange={(u) => setValue("imageUrl", u, { shouldDirty: true })} hint="JPG, PNG or WebP up to 5 MB." />
      <Checkbox name="isPublished" label="Published" {...register("isPublished")} />
      <FormActions onCancel={onCancel} submitting={submitting} />
    </form>
  );
}

export function AttractionsManager() {
  return (
    <ResourceManager
      config={{
        title: "Attractions",
        singular: "Attraction",
        description: "Places to visit near the lodge. Until you publish some here, the website shows a short default list of place names.",
        searchPlaceholder: "Search attractions…",
        fetcher: adminListAttractions,
        create: adminCreateAttraction,
        update: adminUpdateAttraction,
        remove: adminDeleteAttraction,
        Form: AttractionForm,
        statusOptions: [
          { value: "", label: "All" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ],
        columns: ({ onEdit, onDelete }) => [
          { key: "name", header: "Place", primary: true, render: (a) => <span className="font-semibold text-primary-900">{pick(a.name, "en")}</span> },
          { key: "category", header: "Category", render: (a) => <span className="capitalize">{a.category}</span> },
          { key: "order", header: "Order", sortable: true, render: (a) => a.order ?? 0 },
          { key: "mapsUrl", header: "Map link", hideOnMobile: true, render: (a) => (a.mapsUrl ? "Yes" : "No") },
          { key: "isPublished", header: "Status", render: (a) => <MetaBadge value={Boolean(a.isPublished)} meta={PUBLISH_STATUS_META} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (a) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(a)} aria-label="Edit attraction"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(a)} aria-label="Delete attraction"><Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" /></Button>
              </div>
            ),
          },
        ],
      }}
    />
  );
}
