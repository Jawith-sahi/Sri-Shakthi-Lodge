"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { PUBLIC_NAV } from "@/constants/nav";
import { cn } from "@/lib/utils/cn";

export function NavLinks({ orientation = "horizontal", onNavigate }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <ul className={cn(orientation === "horizontal" ? "flex items-center gap-1" : "flex flex-col p-2")}>
      {PUBLIC_NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.key}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-lg font-medium transition-colors",
                orientation === "horizontal" ? "px-3 py-2 text-sm" : "px-4 py-3.5 text-base",
                active ? "bg-primary-50 text-primary" : "text-ink hover:bg-surface hover:text-primary"
              )}
            >
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
