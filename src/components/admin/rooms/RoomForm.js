"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BlockedDates } from "@/components/admin/rooms/BlockedDates";
import { Button, LinkButton } from "@/components/ui/Button";
import { Checkbox, Input, Textarea } from "@/components/ui/Field";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Notice } from "@/components/ui/States";
import { createRoom, deleteRoomImage, reorderRoomImages, updateRoom, uploadRoomImage } from "@/lib/api/rooms.api";
import { getAdminErrorMessage } from "@/lib/api/errors";

const roomSchema = z.object({
  nameEn: z.string().trim().min(2, "validation.required"),
  nameTa: z.string().trim().optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").optional().or(z.literal("")),
  isAc: z.boolean(),
  maxOccupancy: z.coerce.number("validation.number").int("validation.number").min(1, "validation.number").max(20, "validation.number"),
  shortEn: z.string().trim().max(200, "validation.tooLong").optional(),
  shortTa: z.string().trim().max(200, "validation.tooLong").optional(),
  descEn: z.string().trim().max(3000, "validation.tooLong").optional(),
  descTa: z.string().trim().max(3000, "validation.tooLong").optional(),
  roomNumbers: z.string().optional(),
  isActive: z.boolean(),
  amenities: z.array(z.object({ en: z.string().trim(), ta: z.string().trim().optional() })),
});

function toForm(room) {
  return {
    nameEn: room?.name?.en || "",
    nameTa: room?.name?.ta || "",
    slug: room?.slug || "",
    isAc: Boolean(room?.isAc),
    maxOccupancy: room?.maxOccupancy ?? 2,
    shortEn: room?.shortDescription?.en || "",
    shortTa: room?.shortDescription?.ta || "",
    descEn: room?.description?.en || "",
    descTa: room?.description?.ta || "",
    roomNumbers: (room?.roomNumbers || []).join(", "),
    isActive: room ? room.isActive !== false : true,
    amenities: (room?.amenities || []).map((a) => ({ en: a.label?.en || "", ta: a.label?.ta || "" })),
  };
}

function toPayload(v) {
  return {
    name: { en: v.nameEn, ta: v.nameTa || "" },
    slug: v.slug || undefined,
    isAc: v.isAc,
    maxOccupancy: v.maxOccupancy,
    shortDescription: { en: v.shortEn || "", ta: v.shortTa || "" },
    description: { en: v.descEn || "", ta: v.descTa || "" },
    amenities: v.amenities.filter((a) => a.en).map((a) => ({ key: a.en.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: { en: a.en, ta: a.ta || "" } })),
    roomNumbers: (v.roomNumbers || "").split(",").map((s) => s.trim()).filter(Boolean),
    isActive: v.isActive,
  };
}

/** Add / edit a room type. On a new room, photos and blocked dates become available after the first save. */
export function RoomForm({ room }) {
  const router = useRouter();
  const [images, setImages] = useState(room?.images || []);
  const [serverError, setServerError] = useState("");
  const isEdit = Boolean(room?.id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(roomSchema), defaultValues: toForm(room) });
  const { fields, append, remove } = useFieldArray({ control, name: "amenities" });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const payload = toPayload(values);
      if (isEdit) {
        await updateRoom(room.id, payload);
        toast.success("Room saved.");
      } else {
        const created = await createRoom(payload);
        toast.success("Room created. You can now add photos.");
        router.replace(`/admin/rooms/${created.id}/edit`);
      }
    } catch (error) {
      setServerError(getAdminErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {serverError ? <Notice tone="error">{serverError}</Notice> : null}

        <section className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-primary-900">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="nameEn" label="Name (English)" required error={errors.nameEn?.message} {...register("nameEn")} />
            <Input name="nameTa" label="Name (Tamil)" lang="ta" error={errors.nameTa?.message} {...register("nameTa")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="slug"
              label="Web address part (slug)"
              hint="Optional. Letters, numbers and hyphens. Leave empty to generate it from the name."
              error={errors.slug?.message}
              {...register("slug")}
            />
            <Input name="maxOccupancy" type="number" min={1} max={20} label="Maximum guests" required error={errors.maxOccupancy?.message} {...register("maxOccupancy")} />
          </div>
          <Input
            name="roomNumbers"
            label="Room numbers"
            hint="Separate with commas, e.g. 101, 102, 103. The number of rooms of this type is counted from this list."
            error={errors.roomNumbers?.message}
            {...register("roomNumbers")}
          />
          <div className="flex flex-wrap gap-6">
            <Checkbox name="isAc" label="This is an A/C room" {...register("isAc")} />
            <Checkbox name="isActive" label="Active (visible and bookable)" {...register("isActive")} />
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-primary-900">Descriptions</h2>
          <Notice tone="info">Only write facts about the room. Leave a field empty if you are not sure – the website then simply hides it.</Notice>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="shortEn" label="Short description (English)" error={errors.shortEn?.message} {...register("shortEn")} />
            <Input name="shortTa" label="Short description (Tamil)" lang="ta" error={errors.shortTa?.message} {...register("shortTa")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea name="descEn" label="Full description (English)" rows={5} error={errors.descEn?.message} {...register("descEn")} />
            <Textarea name="descTa" label="Full description (Tamil)" lang="ta" rows={5} error={errors.descTa?.message} {...register("descTa")} />
          </div>
        </section>

        <section className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-900">Facilities</h2>
            <Button variant="outline" size="sm" onClick={() => append({ en: "", ta: "" })}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add facility
            </Button>
          </div>
          {fields.length === 0 ? <p className="text-sm text-muted">No facilities added yet.</p> : null}
          {fields.map((field, index) => (
            <div key={field.id} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input name={`amenities.${index}.en`} label={index === 0 ? "Facility (English)" : undefined} aria-label="Facility (English)" {...register(`amenities.${index}.en`)} />
              <Input name={`amenities.${index}.ta`} label={index === 0 ? "Facility (Tamil)" : undefined} aria-label="Facility (Tamil)" lang="ta" {...register(`amenities.${index}.ta`)} />
              <Button variant="ghost" onClick={() => remove(index)} aria-label="Remove facility">
                <Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create room"}
          </Button>
          <LinkButton plain href="/admin/rooms" variant="outline" size="lg">
            Back to rooms
          </LinkButton>
        </div>
      </form>

      {isEdit ? (
        <>
          <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <ImageUploader
              images={images}
              onChange={setImages}
              onUpload={(file) => uploadRoomImage(room.id, file)}
              onDelete={(image) => deleteRoomImage(room.id, image.id)}
              onReorder={(ids) => reorderRoomImages(room.id, ids)}
              label="Photos"
            />
          </section>
          <BlockedDates roomId={room.id} />
        </>
      ) : (
        <Notice tone="info">Save the room first, then you can upload photos and block dates.</Notice>
      )}
    </div>
  );
}
