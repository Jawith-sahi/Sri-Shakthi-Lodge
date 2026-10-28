import { getTranslations } from "next-intl/server";
import { MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { getPrimaryPhone, getWhatsAppUrl } from "@/config/lodge";

/** Phone-only bottom bar: Call / WhatsApp / Book Now. Hidden from tablet width up and when printing. */
export async function StickyContactBar() {
  const t = await getTranslations("nav");
  const phone = getPrimaryPhone();
  const whatsappUrl = getWhatsAppUrl();

  return (
    <div
      role="region"
      aria-label={t("quickContact")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-2 shadow-[0_-4px_16px_rgb(11_42_91/0.08)] backdrop-blur md:hidden print:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg gap-2">
        {phone ? (
          <LinkButton external href={`tel:${phone.tel}`} variant="outline" className="flex-1" aria-label={`${t("call")} ${phone.display}`}>
            <Phone className="h-4 w-4" aria-hidden="true" /> {t("call")}
          </LinkButton>
        ) : null}
        {whatsappUrl ? (
          <LinkButton external href={whatsappUrl} variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("whatsapp")}
          </LinkButton>
        ) : null}
        <LinkButton href="/booking" variant="accent" className="flex-[1.4]">
          {t("bookNow")}
        </LinkButton>
      </div>
    </div>
  );
}
