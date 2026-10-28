import localFont from "next/font/local";

// Self-hosted variable fonts (installed from @fontsource-variable) loaded through next/font,
// so builds never depend on reaching Google Fonts and there is no layout shift.
export const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const notoSansTamil = localFont({
  src: "../../node_modules/@fontsource-variable/noto-sans-tamil/files/noto-sans-tamil-tamil-wght-normal.woff2",
  variable: "--font-tamil",
  display: "swap",
  weight: "100 900",
});
