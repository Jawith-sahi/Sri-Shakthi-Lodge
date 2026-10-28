"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, MessageCircle, Phone } from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { LinkButton } from "@/components/ui/Button";
import { NavLinks } from "@/components/layout/NavLinks";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

/** Slide-out menu for phones/tablets. Uses a native <dialog>: focus is trapped, Esc closes, screen readers announce it. */
export function MobileNav({ phoneTel, whatsappUrl }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-50 lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <Drawer open={open} onClose={close} title={t("menu")} closeLabel={t("closeMenu")}>
        <nav aria-label={t("mainNavigation")}>
          <NavLinks orientation="vertical" onNavigate={close} />
        </nav>
        <div className="space-y-3 border-t border-line p-4">
          <LinkButton href="/booking" variant="accent" size="lg" fullWidth onClick={close}>
            {t("bookNow")}
          </LinkButton>
          {phoneTel ? (
            <LinkButton external href={`tel:${phoneTel}`} variant="outline" fullWidth>
              <Phone className="h-4 w-4" aria-hidden="true" /> {t("callNow")}
            </LinkButton>
          ) : null}
          {whatsappUrl ? (
            <LinkButton external href={whatsappUrl} variant="outline" fullWidth>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("whatsapp")}
            </LinkButton>
          ) : null}
          <LinkButton href="/booking/lookup" variant="ghost" fullWidth onClick={close}>
            {t("findBooking")}
          </LinkButton>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted">{t("language")}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </Drawer>
    </>
  );
}
