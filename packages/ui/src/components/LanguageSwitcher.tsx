"use client";

import { supportedLanguages, changeLanguage, getCurrentLanguage } from "@uxin/i18n";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const [isClient, setIsClient] = useState(false);
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const currentLanguage = getCurrentLanguage();
  const currentLang =
    supportedLanguages.find((lang) => lang.code === currentLanguage) || supportedLanguages[0];

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        aria-label="切换语言"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentLang.flag} {currentLang.name}
        </span>
        <span className="sm:hidden">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors
                  ${currentLanguage === language.code ? "bg-blue-50 text-blue-700" : "text-gray-700"}
                `}
                aria-label={`切换到 ${language.name}`}
              >
                <span className="mr-2">{language.flag}</span>
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
}
