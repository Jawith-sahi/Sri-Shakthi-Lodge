"use client";

import { addDaysISO } from "@/lib/utils/format";
import { Input } from "@/components/ui/Field";

/**
 * Check-in / check-out pair built on native date inputs (best accessibility + mobile pickers).
 * Works with react-hook-form: pass register, watch, setValue and the errors object.
 * Keeps check-out after check-in automatically. `minFrom` (today in IST) is supplied by the parent after mount,
 * so a cached/static page can never ship a stale "today".
 */
export function DateRangeFields({
  register,
  watch,
  setValue,
  errors = {},
  labels,
  fromName = "checkIn",
  toName = "checkOut",
  minFrom,
  className,
}) {
  const from = watch(fromName);
  const minTo = from ? addDaysISO(from, 1) : minFrom ? addDaysISO(minFrom, 1) : undefined;

  const fromField = register(fromName, {
    onChange: (event) => {
      const value = event.target.value;
      const currentTo = watch(toName);
      if (value && (!currentTo || currentTo <= value)) {
        setValue(toName, addDaysISO(value, 1), { shouldValidate: true });
      }
    },
  });

  return (
    <div className={className ?? "grid gap-4 sm:grid-cols-2"}>
      <Input
        name={fromName}
        type="date"
        label={labels.from}
        min={minFrom}
        required
        error={errors[fromName]?.message}
        {...fromField}
      />
      <Input
        name={toName}
        type="date"
        label={labels.to}
        min={minTo}
        required
        error={errors[toName]?.message}
        {...register(toName)}
      />
    </div>
  );
}
