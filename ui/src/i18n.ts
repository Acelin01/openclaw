import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { loadSettings, saveSettings } from "./ui/storage.ts";

export type Locale = "en" | "zh-CN";

let currentLocale: Locale = "en";
let translations: Record<string, string> = {};

// Load all locales
const localeModules = import.meta.glob("./locales/*.json");

export async function initI18n() {
  const settings = loadSettings();

  // If settings has locale, use it.
  // Note: loadSettings defaults to 'en' only if not present, but we might want browser detection if it's a fresh install.
  // Actually loadSettings defaults 'locale' to 'en' in the code I wrote.
  // Let's refine loadSettings logic in storage.ts or just handle it here.
  // Since I updated loadSettings to handle locale, I can just use it.

  // However, to support browser detection on first run if not in storage:
  // loadSettings returns defaults if storage is empty.

  // Let's stick to what we have in storage.ts for simplicity,
  // but if we want browser detection we should do it there or here.
  // I'll trust loadSettings for now, but wait, loadSettings defaults to 'en'.

  currentLocale = settings.locale as Locale;
  await loadLocale(currentLocale);
}

async function loadLocale(locale: Locale) {
  const path = `./locales/${locale}.json`;
  if (localeModules[path]) {
    const mod = (await localeModules[path]()) as { default: Record<string, string> };
    translations = mod.default;
  }
}

export function t(
  key: string,
  defaultText?: string,
  params?: Record<string, string | number>,
): string {
  let text = translations[key] || defaultText || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function tHtml(key: string, defaultText?: string, params?: Record<string, string | number>) {
  const text = t(key, defaultText, params);
  return html`${unsafeHTML(text)}`;
}

export function getLocale(): Locale {
  return currentLocale;
}

export async function setLocale(locale: Locale) {
  currentLocale = locale;
  const settings = loadSettings();
  settings.locale = locale;
  saveSettings(settings);
  await loadLocale(locale);
  window.location.reload();
}
