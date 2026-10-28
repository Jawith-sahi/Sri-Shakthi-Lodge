import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-bold text-accent-600" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-primary-900 sm:text-3xl">{t("heading")}</h1>
      <p className="mt-3 max-w-md text-muted">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/">{t("goHome")}</LinkButton>
        <LinkButton href="/rooms" variant="outline">
          {t("viewRooms")}
        </LinkButton>
      </div>
    </section>
  );
}
