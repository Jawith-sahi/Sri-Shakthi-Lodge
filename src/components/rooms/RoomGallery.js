"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { pick } from "@/lib/utils/localize";
import { cn } from "@/lib/utils/cn";

/** Simple, dependency-free photo viewer for a room: one large image + thumbnails + previous/next buttons. */
export function RoomGallery({ images = [], name }) {
  const t = useTranslations("rooms");
  const locale = useLocale();
  const [index, setIndex] = useState(0);

  const list = images.length ? images : [{ id: "placeholder", url: "/placeholders/room.svg", alt: name }];
  const current = list[Math.min(index, list.length - 1)];
  const go = (delta) => setIndex((i) => (i + delta + list.length) % list.length);

  return (
    <section aria-label={t("photos", { name })}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-surface">
        <SmartImage
          src={current.url}
          alt={pick(current.alt, locale) || name}
          fill
          priority
          sizes="(min-width: 1024px) 660px, 100vw"
          className="object-cover"
        />
        {list.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("previousPhoto")}
              className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("nextPhoto")}
              className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {list.length > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((image, i) => (
            <li key={image.id || i} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("showPhoto", { index: i + 1 })}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-lg border-2 bg-surface",
                  i === index ? "border-accent-500" : "border-transparent"
                )}
              >
                <SmartImage src={image.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
