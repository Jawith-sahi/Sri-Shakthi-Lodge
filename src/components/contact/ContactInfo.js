import { getTranslations } from "next-intl/server";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Notice } from "@/components/ui/States";
import { getAddressLine, getPublicPhones, getValidMapsUrl, getWhatsAppUrl, lodge } from "@/config/lodge";

/** Address, phone numbers, WhatsApp and map. Map embed only appears once a real embed URL is configured. */
export async function ContactInfo({ compact = false }) {
  const t = await getTranslations("contact");
  const phones = getPublicPhones();
  const whatsappUrl = getWhatsAppUrl(t("whatsappMessage"));
  const mapsUrl = getValidMapsUrl();
  const embed = lodge.mapsEmbedUrl && lodge.mapsEmbedUrl.startsWith("https://www.google.com/maps/embed") ? lodge.mapsEmbedUrl : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-primary-900">{t("addressTitle")}</h3>
          <address className="mt-1 not-italic text-ink">{getAddressLine()}</address>
          {!compact ? <p className="mt-1 text-sm text-muted">{t("hoursNote", { time: lodge.checkIn.label })}</p> : null}
        </div>
      </div>

      <div className="flex gap-3">
        <Phone className="mt-1 h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-primary-900">{t("phoneTitle")}</h3>
          {phones.length ? (
            <ul className="mt-1 space-y-1">
              {phones.map((p) => (
                <li key={p.digits}>
                  <a href={`tel:${p.tel}`} className="text-ink hover:text-primary hover:underline">
                    {p.name} · <span className="font-semibold">{p.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted">{t("noPhone")}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {phones[0] ? (
          <LinkButton external href={`tel:${phones[0].tel}`} variant="primary">
            <Phone className="h-4 w-4" aria-hidden="true" /> {t("callPerson", { name: phones[0].name })}
          </LinkButton>
        ) : null}
        {whatsappUrl ? (
          <LinkButton external href={whatsappUrl} variant="outline">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("whatsappUs")}
          </LinkButton>
        ) : null}
        {mapsUrl ? (
          <LinkButton external href={mapsUrl} variant="outline">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {t("directions")}
          </LinkButton>
        ) : null}
      </div>

      {embed ? (
        <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line">
          <iframe
            src={embed}
            title={lodge.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
            allowFullScreen
          />
        </div>
      ) : (
        <Notice tone="info">{t("mapPending")}</Notice>
      )}
    </div>
  );
}
