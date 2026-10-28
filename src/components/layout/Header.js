import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { NavLinks } from "@/components/layout/NavLinks";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileNav } from "@/components/layout/MobileNav";
import { LinkButton } from "@/components/ui/Button";
import { getPrimaryPhone, getWhatsAppUrl } from "@/config/lodge";

export async function Header() {
  const t = await getTranslations("nav");
  const phone = getPrimaryPhone();
  const whatsappUrl = getWhatsAppUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <BrandMark priority />

        <nav aria-label={t("mainNavigation")} className="hidden lg:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          {phone ? (
            <a
              href={`tel:${phone.tel}`}
              className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-primary-50 xl:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone.display}
            </a>
          ) : null}
          <LinkButton href="/booking" variant="accent" className="hidden sm:inline-flex">
            {t("bookNow")}
          </LinkButton>
          <MobileNav phoneTel={phone?.tel} whatsappUrl={whatsappUrl} />
        </div>
      </div>
    </header>
  );
}
