import "@/app/globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { env } from "@/config/environment";
import { lodge } from "@/config/lodge";
import { inter, notoSansTamil } from "@/lib/fonts";
import { safely } from "@/lib/api/client";
import { getContent } from "@/lib/api/content.api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyContactBar } from "@/components/layout/StickyContactBar";
import { MockBanner } from "@/components/layout/MockBanner";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { LOCALE_LABELS } from "@/constants/locales";

// Only the namespaces used by client components are sent to the browser.
const CLIENT_NAMESPACES = [
  "nav",
  "common",
  "validation",
  "errors",
  "search",
  "rooms",
  "booking",
  "gallery",
  "reviews",
  "contact",
  "mock",
  "stickyBar",
  "attractions",
  "amenities",
  "policies",
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: t("defaultTitle"), template: `%s | ${lodge.name}` },
    description: t("defaultDescription"),
    applicationName: lodge.name,
    icons: { icon: "/logo-small.png", apple: "/logo-small.png" },
    openGraph: { siteName: lodge.name, type: "website", images: [{ url: "/og-default.jpg" }] },
    formatDetection: { telephone: false },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2a5b",
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [messages, t, content] = await Promise.all([
    getMessages(),
    getTranslations("nav"),
    safely(getContent(), {}),
  ]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html lang={LOCALE_LABELS[locale]?.htmlLang || locale} className={`${inter.variable} ${notoSansTamil.variable}`}>
      <body className="min-h-dvh pb-20 md:pb-0">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-primary focus:shadow-lg"
          >
            {t("skipToContent")}
          </a>
          <MockBanner text={messages.mock?.banner} />
          <AnnouncementBanner announcement={content?.announcement} locale={locale} />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <StickyContactBar />
          <Toaster position="top-center" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
