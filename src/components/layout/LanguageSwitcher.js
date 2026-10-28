"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE_LABELS } from "@/constants/locales";
import { cn } from "@/lib/utils/cn";

/** EN / தமிழ் switcher. Keeps the current page and query string; next-intl remembers the choice in a cookie. */
export function LanguageSwitcher({ className }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div role="group" aria-label={t("language")} className={cn("inline-flex rounded-lg border border-line bg-white p-0.5", className)}>
      {routing.locales.map((code) => {
        const active = code === locale;
        const meta = LOCALE_LABELS[code];
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            hrefLang={meta.htmlLang}
            lang={meta.htmlLang}
            aria-current={active ? "true" : undefined}
            aria-label={meta.name}
            onClick={(event) => {
              event.preventDefault();
              if (active) return;
              router.replace(`${pathname}${window.location.search}`, { locale: code });
            }}
            className={cn(
              "inline-flex min-h-9 min-w-10 items-center justify-center rounded-md px-2.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-white" : "text-primary hover:bg-primary-50"
            )}
          >
            {meta.short}
          </Link>
        );
      })}
    </div>
  );
}
