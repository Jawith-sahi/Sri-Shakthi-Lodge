"use client";

import { useTranslations } from "next-intl";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

export default function LocaleError({ reset }) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  return (
    <div className="container-page py-16">
      <ErrorState
        title={t("pageTitle")}
        body={t("pageBody")}
        action={
          <>
            <Button onClick={reset}>{tc("retry")}</Button>
            <LinkButton href="/contact" variant="outline">
              {tn("contact")}
            </LinkButton>
          </>
        }
      />
    </div>
  );
}
