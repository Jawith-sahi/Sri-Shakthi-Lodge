"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { addBlockedDate, listBlockedDates, removeBlockedDate } from "@/lib/api/rooms.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { blockedDateSchema } from "@/lib/schemas";
import { formatDate } from "@/lib/utils/format";

/** Dates when a room type must not be sold (maintenance, private use…). The backend applies them to availability. */
export function BlockedDates({ roomId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await listBlockedDates(roomId));
    } catch (e) {
      setError(getAdminErrorMessage(e));
      setItems([]);
    }
  }, [roomId]);

  useEffect(() => {
    load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(blockedDateSchema), defaultValues: { from: "", to: "", reason: "" } });

  const onSubmit = async (values) => {
    setError("");
    try {
      await addBlockedDate(roomId, values);
      toast.success("Dates blocked.");
      reset();
      load();
    } catch (e) {
      setError(getAdminErrorMessage(e));
    }
  };

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 className="text-lg font-semibold text-primary-900">Blocked dates</h2>
      <p className="mt-1 text-sm text-muted">Block dates when this room type cannot be booked.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 grid items-start gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
        <Input name="blockFrom" type="date" label="From" required error={errors.from?.message} {...register("from")} />
        <Input name="blockTo" type="date" label="To (inclusive)" required error={errors.to?.message} {...register("to")} />
        <Input name="blockReason" label="Reason (optional)" error={errors.reason?.message} {...register("reason")} />
        <div className="sm:pt-[1.65rem]">
          <Button type="submit" loading={isSubmitting}>
            Block
          </Button>
        </div>
      </form>

      {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}

      <ul className="mt-4 divide-y divide-line">
        {(items || []).map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span>
              <span className="font-medium">{formatDate(b.from, "en")} – {formatDate(b.to, "en")}</span>
              {b.reason ? <span className="text-muted"> · {b.reason}</span> : null}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Remove blocked dates"
              onClick={async () => {
                try {
                  await removeBlockedDate(roomId, b.id);
                  load();
                } catch (e) {
                  toast.error(getAdminErrorMessage(e));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-danger-600" aria-hidden="true" />
            </Button>
          </li>
        ))}
        {items && items.length === 0 ? <li className="py-2 text-sm text-muted">No blocked dates.</li> : null}
      </ul>
    </section>
  );
}
