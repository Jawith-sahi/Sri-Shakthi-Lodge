import { getTranslations } from "next-intl/server";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { POLICY_LINKS, PUBLIC_NAV } from "@/constants/nav";
import { getAddressLine, getPublicPhones, getValidMapsUrl, getWhatsAppUrl, lodge } from "@/config/lodge";

export async function Footer() {
  const [t, tNav, tAttr] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("attractions.defaults"),
  ]);
  const phones = getPublicPhones();
  const whatsappUrl = getWhatsAppUrl();
  const mapsUrl = getValidMapsUrl();

  const linkClass = "text-primary-100 hover:text-white hover:underline underline-offset-4";

  return (
    <footer className="mt-16 bg-primary-950 text-primary-100 print:hidden">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandMark light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{t("tagline")}</p>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" aria-hidden="true" />
            <span>{getAddressLine()}</span>
          </p>
        </div>

        <nav aria-label={t("quickLinks")}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-300">{t("quickLinks")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={linkClass}>
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-300">{t("roomsTitle")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lodge.roomCategories.map((name) => (
              <li key={name}>
                <Link href="/rooms" className={linkClass}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent-300">{t("attractionsTitle")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lodge.defaultAttractions.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <Link href="/attractions" className={linkClass}>
                  {tAttr(`${a.key}.name`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-300">{t("contactTitle")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {phones.map((p) => (
              <li key={p.digits}>
                <a href={`tel:${p.tel}`} className={`${linkClass} inline-flex items-center gap-2`}>
                  <Phone className="h-4 w-4 text-accent-300" aria-hidden="true" />
                  <span>
                    {p.name} · {p.display}
                  </span>
                </a>
              </li>
            ))}
            {whatsappUrl ? (
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-2`}>
                  <MessageCircle className="h-4 w-4 text-accent-300" aria-hidden="true" /> {tNav("whatsapp")}
                </a>
              </li>
            ) : null}
            {mapsUrl ? (
              <li>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Google Maps
                </a>
              </li>
            ) : null}
          </ul>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent-300">{t("policiesTitle")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {POLICY_LINKS.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={linkClass}>
                  {t(`policyLinks.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-800">
        <div className="container-page py-5 text-center text-xs text-primary-200">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
