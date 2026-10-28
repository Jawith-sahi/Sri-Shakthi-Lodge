import { defineRouting } from "next-intl/routing";

// To add a language: add its code here, create src/messages/<code>.json and add its label in
// src/constants/locales.js. Nothing else is required.
export const routing = defineRouting({
  locales: ["en", "ta"],
  defaultLocale: "en",
  localePrefix: "always",
});
