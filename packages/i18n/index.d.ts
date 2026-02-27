export interface Language {
  code: string;
  name: string;
  flag: string;
}
export declare const supportedLanguages: Language[];
export declare function getCurrentLanguage(): string;
export declare function changeLanguage(lang: string): Promise<void>;
