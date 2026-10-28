import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { AvailabilityForm } from "@/components/booking/AvailabilityForm";
import { getPrimaryPhone } from "@/config/lodge";

export async function Hero({ imageUrl }) {
  const t = await getTranslations("hero");
  const tn = await getTranslations("nav");
  const ts = await getTranslations("search");
  const phone = getPrimaryPhone();

  return (
    <section className="relative isolate overflow-hidden bg-primary-900 text-white" aria-labelledby="hero-title">
      <SmartImage
        src={imageUrl || "/placeholders/hero.svg"}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-950/95 via-primary-900/85 to-primary-900/60" aria-hidden="true" />

      <div className="container-page grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <h1 id="hero-title" className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {t("headline")}
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-accent" aria-hidden="true" />
          <p className="mt-5 max-w-xl text-base text-primary-100 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href="/booking" variant="accent" size="lg">
              {tn("bookNow")}
            </LinkButton>
            {phone ? (
              <LinkButton external href={`tel:${phone.tel}`} variant="light" size="lg">
                <Phone className="h-5 w-5" aria-hidden="true" /> {tn("callNow")}
              </LinkButton>
            ) : (
              <LinkButton href="/contact" variant="light" size="lg">
                {tn("contact")}
              </LinkButton>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 text-ink shadow-[var(--shadow-pop)] sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary-900">{ts("title")}</h2>
          <AvailabilityForm />
        </div>
      </div>
    </section>
  );
}
