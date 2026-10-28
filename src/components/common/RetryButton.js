"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** For server-rendered pages: asks Next to re-render the route (re-fetching data). */
export function RetryButton({ variant = "outline" }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant={variant} loading={pending} onClick={() => startTransition(() => router.refresh())}>
      {t("retry")}
    </Button>
  );
}
