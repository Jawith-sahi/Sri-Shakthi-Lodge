"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = ["search", "availability", "guest", "summary", "payment", "confirmation"];

export function StepIndicator({ current }) {
  const t = useTranslations("booking");
  const index = Math.max(0, STEPS.indexOf(current));

  return (
    <nav aria-label={t("heading")} className="mb-8">
      <p className="mb-3 text-sm font-medium text-muted sm:hidden">
        {t("stepOf", { current: index + 1, total: STEPS.length })} · <span className="text-primary-900">{t(`steps.${current}`)}</span>
      </p>
      <ol className="hidden items-center gap-2 sm:flex">
        {STEPS.map((step, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li key={step} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  done && "bg-success-600 text-white",
                  active && "bg-primary text-white",
                  !done && !active && "bg-surface text-muted"
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("truncate text-sm", active ? "font-semibold text-primary-900" : "text-muted")}>{t(`steps.${step}`)}</span>
              {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-line" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface sm:hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-accent" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
      </div>
    </nav>
  );
}
