const supportedLanguages = [
  { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
];
let currentLanguage = supportedLanguages[0].code;

export { supportedLanguages };

export function getCurrentLanguage() {
  return currentLanguage;
}

export async function changeLanguage(lang) {
  const found = supportedLanguages.find((l) => l.code === lang);
  if (found) {
    currentLanguage = found.code;
  }
}
