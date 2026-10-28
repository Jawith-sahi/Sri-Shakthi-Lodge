import "@/app/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { inter } from "@/lib/fonts";
import en from "@/messages/en.json";

// Admin is English-only, never indexed, and not under a locale prefix.
export const metadata = {
  title: { default: "Admin | Sri Sakthi Lodge", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b2a5b" };

export default function AdminRootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">
        {/* Shared form components read validation texts through next-intl; admin only needs the English ones. */}
        <NextIntlClientProvider locale="en" messages={{ validation: en.validation }}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
