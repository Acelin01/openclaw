import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./locales/en-US.json";
// Import translation files
import zhCN from "./locales/zh-CN.json";

const resources = {
  "zh-CN": {
    translation: zhCN,
  },
  "en-US": {
    translation: enUS,
  },
};

// Initialize i18next only on client side
const initI18n = () => {
  // Only initialize on client side
  if (typeof window === "undefined") {
    return Promise.resolve(i18n);
  }

  // Import browser-specific modules only on client side
  return import("i18next-browser-languagedetector").then(({ default: LanguageDetector }) => {
    return i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: "zh-CN",
        debug: process.env["NODE_ENV"] === "development",

        interpolation: {
          escapeValue: false, // React already escapes values
        },

        detection: {
          order: ["localStorage", "navigator", "htmlTag"],
          caches: ["localStorage"],
          lookupLocalStorage: "i18nextLng",
        },

        supportedLngs: ["zh-CN", "en-US"],

        react: {
          useSuspense: false,
        },
      });
  });
};

// Initialize if not already initialized
if (!i18n.isInitialized && typeof window !== "undefined") {
  initI18n();
}

export default i18n;

export const supportedLanguages = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];

export function changeLanguage(language: string) {
  return i18n.changeLanguage(language);
}

export function getCurrentLanguage() {
  return i18n.language;
}
