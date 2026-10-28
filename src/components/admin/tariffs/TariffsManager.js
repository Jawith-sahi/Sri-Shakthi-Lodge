"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/FormParts";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { adminCreateTariff, adminDeleteTariff, adminListTariffs, adminUpdateTariff } from "@/lib/api/tariffs.api";
import { adminListRooms } from "@/lib/api/rooms.api";
import { formatDate, formatINR } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

const tariffSchema = z
  .object({
    roomId: z.string().min(1, "validation.required"),
    planName: z.string().trim().min(1, "validation.required").max(80, "validation.tooLong"),
    baseRate: z.coerce.number("validation.number").positive("validation.number").max(1_000_000, "validation.number"),
    startDate: z.string().min(1, "validation.required"),
    endDate: z.string().optional(),
    season: z.string().trim().max(60, "validation.tooLong").optional(),
    taxPercent: z.union([z.literal(""), z.coerce.number("validation.number").min(0, "validation.number").max(100, "validation.number")]).optional(),
    isActive: z.boolean(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, { path: ["endDate"], message: "validation.dateOrder" });

function TariffForm({ initial, onSubmit, onCancel, submitting }) {
  const [rooms, setRooms] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      roomId: initial.roomId || "",
      planName: initial.planName || "Standard",
      baseRate: initial.baseRate ?? "",
      startDate: initial.startDate || "",
      endDate: initial.endDate || "",
      season: initial.season || "",
      taxPercent: initial.taxPercent ?? "",
      isActive: initial.isActive !== false,
    },
  });

  useEffect(() => {
    adminListRooms({ pageSize: 100 }).then((r) => setRooms(r.items || [])).catch(() => {});
  }, []);

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({ ...v, endDate: v.endDate || null, season: v.season || null, taxPercent: v.taxPercent === "" ? null : v.taxPercent })
      )}
      noValidate
      className="space-y-4"
    >
      <Notice tone="info">
        These are base rates. The backend calculates the final price for each booking, and changing a rate never alters bookings that are already confirmed.
      </Notice>
      <Select name="roomId" label="Room type" required error={errors.roomId?.message} {...register("roomId")}>
        <option value="">Choose a room type…</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>{pick(r.name, "en")}</option>
        ))}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="planName" label="Rate plan" required error={errors.planName?.message} {...register("planName")} />
        <Input name="baseRate" type="number" min={1} step="1" label="Base rate per night (₹)" required error={errors.baseRate?.message} {...register("baseRate")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="startDate" type="date" label="Effective from" required error={errors.startDate?.message} {...register("startDate")} />
        <Input name="endDate" type="date" label="Effective until" optionalText="optional" error={errors.endDate?.message} {...register("endDate")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="season" label="Season name" optionalText="optional" hint="For example: Festival season." error={errors.season?.message} {...register("season")} />
        <Input
          name="taxPercent"
          type="number"
          min={0}
          max={100}
          step="0.01"
          label="Tax %"
          optionalText="only if applicable"
          hint="Leave empty unless the lodge has confirmed a tax."
          error={errors.taxPercent?.message}
          {...register("taxPercent")}
        />
      </div>
      <Checkbox name="isActive" label="Active" {...register("isActive")} />
      <FormActions onCancel={onCancel} submitting={submitting} />
    </form>
  );
}

export function TariffsManager() {
  return (
    <ResourceManager
      config={{
        title: "Tariffs",
        singular: "Tariff",
        description: "Base rates per room type, with effective dates and seasonal rates.",
        searchPlaceholder: "Search tariffs…",
        fetcher: adminListTariffs,
        create: adminCreateTariff,
        update: adminUpdateTariff,
        remove: adminDeleteTariff,
        Form: TariffForm,
        statusOptions: [
          { value: "", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        columns: ({ onEdit, onDelete }) => [
          { key: "roomId", header: "Room type", primary: true, render: (t) => <span className="font-semibold text-primary-900">{t.roomName || t.roomId}</span> },
          { key: "planName", header: "Plan", render: (t) => t.planName },
          { key: "season", header: "Season", hideOnMobile: true, render: (t) => t.season || "—" },
          { key: "baseRate", header: "Base rate", sortable: true, render: (t) => formatINR(t.baseRate) },
          { key: "startDate", header: "Effective", render: (t) => `${formatDate(t.startDate, "en")}${t.endDate ? ` → ${formatDate(t.endDate, "en")}` : " onwards"}` },
          { key: "taxPercent", header: "Tax", hideOnMobile: true, render: (t) => (t.taxPercent == null ? "—" : `${t.taxPercent}%`) },
          { key: "isActive", header: "Status", render: (t) => <StatusBadge tone={t.isActive ? "green" : "gray"}>{t.isActive ? "Active" : "Inactive"}</StatusBadge> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (t) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)} aria-label="Edit tariff"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(t)} aria-label="Delete tariff"><Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" /></Button>
              </div>
            ),
          },
        ],
      }}
    />
  );
}
