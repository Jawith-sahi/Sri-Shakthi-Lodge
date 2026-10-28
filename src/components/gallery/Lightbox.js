"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { pick } from "@/lib/utils/localize";

/** Full-screen photo viewer on a native <dialog> (focus trap, Esc to close). Loaded on demand via next/dynamic. */
export default function Lightbox({ items, index, onClose, onIndexChange }) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const ref = useRef(null);
  const current = items[index];

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, items.length, onIndexChange]);

  if (!current) return null;
  const title = pick(current.title, locale);

  return (
    <dialog
      ref={ref}
      aria-label={t("lightboxLabel")}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-primary-950/95 p-0 text-white backdrop:bg-black"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="truncate text-sm font-medium">
            {title} <span className="text-primary-200">({index + 1} / {items.length})</span>
          </p>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label={t("close")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="relative flex-1">
          <SmartImage
            src={current.url}
            alt={pick(current.alt, locale) || title}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
              aria-label={t("previous")}
              className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % items.length)}
              aria-label={t("next")}
              className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
