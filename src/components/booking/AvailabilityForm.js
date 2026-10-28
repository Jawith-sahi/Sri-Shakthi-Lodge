"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { DateRangeFields } from "@/components/ui/DateRange";
import { lodge } from "@/config/lodge";
import { searchSchema } from "@/lib/schemas";
import { addDaysISO, todayIST } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Search form used by the home hero and the room page. It only collects dates + guests and hands over to /booking:
 * availability and prices are always fetched live from the backend there.
 */
export function AvailabilityForm({ roomSlug, category = "", compact = false, className, onSearch, initialValues }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [today, setToday] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: { checkIn: "", checkOut: "", adults: 2, children: 0, rooms: 1, category },
  });

  // "Today" is computed in the browser (IST) so statically cached pages never carry a stale date.
  useEffect(() => {
    const now = todayIST();
    setToday(now);
    reset({
      checkIn: now,
      checkOut: addDaysISO(now, 1),
      adults: 2,
      children: 0,
      rooms: 1,
      category,
      ...(initialValues || {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, category]);

  const onSubmit = (values) => {
    if (onSearch) {
      onSearch(values);
      return;
    }
    const params = new URLSearchParams({
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      adults: String(values.adults),
      children: String(values.children),
      rooms: String(values.rooms),
    });
    if (values.category) params.set("category", values.category);
    if (roomSlug) params.set("room", roomSlug);
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("space-y-4", className)} aria-label={t("title")}>
      <DateRangeFields
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        minFrom={today}
        labels={{ from: t("checkIn"), to: t("checkOut") }}
      />
      <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
        <Select name="adults" label={t("adults")} error={errors.adults?.message} {...register("adults")}>
          {range(1, lodge.limits.maxAdults).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
        <Select name="children" label={t("children")} error={errors.children?.message} {...register("children")}>
          {range(0, lodge.limits.maxChildren).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
        {!compact ? (
          <Select name="rooms" label={t("rooms")} error={errors.rooms?.message} wrapperClassName="col-span-2 sm:col-span-1" {...register("rooms")}>
            {range(1, lodge.limits.maxRooms).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
      <Button type="submit" variant="accent" size="lg" fullWidth loading={isSubmitting}>
        <Search className="h-5 w-5" aria-hidden="true" /> {t("submit")}
      </Button>
    </form>
  );
}
