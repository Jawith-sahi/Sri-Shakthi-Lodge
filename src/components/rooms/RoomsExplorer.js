"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { RoomCard } from "@/components/rooms/RoomCard";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

const price = (room) => {
  const n = Number(room.startingPrice);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Filters (A/C vs non-A/C, capacity) and sorting, kept in the URL (?type=ac&capacity=3&sort=price-asc) so a filtered
 * list can be shared. The room list itself is fetched on the server and cached; filtering is instant in the browser.
 */
export function RoomsExplorer({ rooms }) {
  const t = useTranslations("rooms");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const type = params.get("type") || "all";
  const capacity = Number(params.get("capacity") || 0);
  const sort = params.get("sort") || "default";

  const anyPrice = rooms.some((r) => price(r) !== null);
  const capacities = useMemo(
    () => [...new Set(rooms.map((r) => Number(r.maxOccupancy)).filter((n) => n > 0))].sort((a, b) => a - b),
    [rooms]
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all" || value === "default" || value === "0") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = useMemo(() => {
    let list = rooms.filter((r) => (type === "ac" ? r.isAc : type === "non-ac" ? !r.isAc : true));
    if (capacity) list = list.filter((r) => Number(r.maxOccupancy) >= capacity);
    if (sort === "price-asc" || sort === "price-desc") {
      const dir = sort === "price-asc" ? 1 : -1;
      // rooms without a published price always go last
      list = [...list].sort((a, b) => {
        const pa = price(a);
        const pb = price(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
    return list;
  }, [rooms, type, capacity, sort]);

  const hasFilters = type !== "all" || capacity > 0 || sort !== "default";

  return (
    <div>
      <form
        aria-label={t("filters")}
        onSubmit={(e) => e.preventDefault()}
        className="mb-8 grid gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Select name="roomType" label={t("type")} value={type} onChange={(e) => setParam("type", e.target.value)}>
          <option value="all">{t("all")}</option>
          <option value="ac">{t("ac")}</option>
          <option value="non-ac">{t("nonAc")}</option>
        </Select>
        <Select name="capacity" label={t("capacity")} value={String(capacity)} onChange={(e) => setParam("capacity", e.target.value)}>
          <option value="0">{t("anyCapacity")}</option>
          {capacities.map((n) => (
            <option key={n} value={n}>
              {t("capacityOrMore", { count: n })}
            </option>
          ))}
        </Select>
        {anyPrice ? (
          <Select name="sort" label={t("sort")} value={sort} onChange={(e) => setParam("sort", e.target.value)}>
            <option value="default">{t("sortDefault")}</option>
            <option value="price-asc">{t("sortPriceLow")}</option>
            <option value="price-desc">{t("sortPriceHigh")}</option>
          </Select>
        ) : null}
        {hasFilters ? (
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => router.replace(pathname, { scroll: false })}>
              {t("clearFilters")}
            </Button>
          </div>
        ) : null}
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length} / {rooms.length}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={t("noResults")}
          body={t("noResultsHint")}
          action={
            <Button variant="outline" onClick={() => router.replace(pathname, { scroll: false })}>
              {t("clearFilters")}
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((room, index) => (
            <li key={room.id || room.slug}>
              <RoomCard room={room} priority={index < 3} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
