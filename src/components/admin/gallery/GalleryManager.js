"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/FormParts";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { SingleImageInput } from "@/components/ui/SingleImageInput";
import { SmartImage } from "@/components/ui/SmartImage";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { GALLERY_CATEGORIES, PUBLISH_STATUS_META } from "@/constants/statuses";
import { adminCreateGalleryItem, adminDeleteGalleryItem, adminListGallery, adminUpdateGalleryItem } from "@/lib/api/gallery.api";
import { parseVideo } from "@/lib/utils/video";
import { pick } from "@/lib/utils/localize";

const gallerySchema = z
  .object({
    type: z.enum(["image", "video"]),
    url: z.string().trim().min(1, "validation.required"),
    thumbnailUrl: z.string().optional(),
    titleEn: z.string().trim().min(1, "validation.required").max(120, "validation.tooLong"),
    titleTa: z.string().trim().max(120, "validation.tooLong").optional(),
    altEn: z.string().trim().max(200, "validation.tooLong").optional(),
    altTa: z.string().trim().max(200, "validation.tooLong").optional(),
    category: z.string().min(1, "validation.required"),
    order: z.coerce.number("validation.number").int("validation.number").min(0, "validation.number"),
    isPublished: z.boolean(),
  })
  .refine((v) => v.type !== "video" || parseVideo(v.url), { path: ["url"], message: "Enter a valid video link starting with https://" });

function GalleryForm({ initial, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      type: initial.type || "image",
      url: initial.url || "",
      thumbnailUrl: initial.thumbnailUrl || "",
      titleEn: initial.title?.en || "",
      titleTa: initial.title?.ta || "",
      altEn: initial.alt?.en || "",
      altTa: initial.alt?.ta || "",
      category: initial.category || "rooms",
      order: initial.order ?? 0,
      isPublished: initial.isPublished !== false,
    },
  });
  const type = watch("type");

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          type: v.type,
          url: v.url,
          thumbnailUrl: v.thumbnailUrl || "",
          title: { en: v.titleEn, ta: v.titleTa || "" },
          alt: { en: v.altEn || v.titleEn, ta: v.altTa || "" },
          category: v.category,
          order: v.order,
          isPublished: v.isPublished,
        })
      )}
    >
      <Select name="type" label="Type" {...register("type")}>
        <option value="image">Photo</option>
        <option value="video">Video (link)</option>
      </Select>

      {type === "image" ? (
        <div>
          <SingleImageInput label="Photo" value={watch("url")} onChange={(u) => setValue("url", u, { shouldValidate: true, shouldDirty: true })} hint="JPG, PNG or WebP up to 5 MB." />
          {errors.url ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger-600">Please upload a photo.</p> : null}
        </div>
      ) : (
        <>
          <Input name="url" label="Video link" required hint="A YouTube link or a direct .mp4 link. It plays only after a visitor taps it." error={errors.url?.message} {...register("url")} />
          <SingleImageInput label="Preview picture" value={watch("thumbnailUrl")} onChange={(u) => setValue("thumbnailUrl", u, { shouldDirty: true })} hint="Optional. YouTube links use their own thumbnail." />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="titleEn" label="Title (English)" required error={errors.titleEn?.message} {...register("titleEn")} />
        <Input name="titleTa" label="Title (Tamil)" lang="ta" error={errors.titleTa?.message} {...register("titleTa")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="altEn" label="Picture description (English)" hint="Describes the picture for people using screen readers." error={errors.altEn?.message} {...register("altEn")} />
        <Input name="altTa" label="Picture description (Tamil)" lang="ta" error={errors.altTa?.message} {...register("altTa")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category" label="Category" required error={errors.category?.message} {...register("category")}>
          {GALLERY_CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </Select>
        <Input name="order" type="number" min={0} label="Order" hint="Smaller numbers come first." error={errors.order?.message} {...register("order")} />
      </div>
      <Checkbox name="isPublished" label="Published" {...register("isPublished")} />
      <FormActions onCancel={onCancel} submitting={submitting} />
    </form>
  );
}

export function GalleryManager() {
  return (
    <ResourceManager
      config={{
        title: "Gallery",
        singular: "Item",
        description: "Photos and videos shown in the website gallery.",
        searchPlaceholder: "Search gallery…",
        fetcher: adminListGallery,
        create: adminCreateGalleryItem,
        update: adminUpdateGalleryItem,
        remove: adminDeleteGalleryItem,
        Form: GalleryForm,
        statusOptions: [
          { value: "", label: "All" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft / archived" },
        ],
        columns: ({ onEdit, onDelete }) => [
          {
            key: "title",
            header: "Item",
            primary: true,
            render: (g) => (
              <span className="flex items-center gap-3">
                <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded bg-surface">
                  {g.type === "image" ? <SmartImage src={g.url} alt="" fill sizes="56px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted">Video</span>}
                </span>
                <span className="font-semibold text-primary-900">{pick(g.title, "en")}</span>
              </span>
            ),
          },
          { key: "type", header: "Type", render: (g) => (g.type === "video" ? "Video" : "Photo") },
          { key: "category", header: "Category", render: (g) => <span className="capitalize">{g.category}</span> },
          { key: "order", header: "Order", sortable: true, render: (g) => g.order ?? 0 },
          { key: "isPublished", header: "Status", render: (g) => <MetaBadge value={Boolean(g.isPublished)} meta={PUBLISH_STATUS_META} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (g) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(g)} aria-label="Edit item"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(g)} aria-label="Delete item"><Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" /></Button>
              </div>
            ),
          },
        ],
      }}
    />
  );
}
