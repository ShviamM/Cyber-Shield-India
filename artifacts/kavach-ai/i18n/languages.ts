/**
 * Supported app languages for KavachAI.
 *
 * `code` is the i18next language key and the value persisted to storage.
 * `label` is the English name; `native` is the endonym shown in the picker.
 * `rtl` flags right-to-left scripts (Urdu) for basic text rendering.
 */
export type LanguageCode =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "ur"
  | "gu"
  | "kn"
  | "ml"
  | "pa"
  | "or";

export type LanguageMeta = {
  code: LanguageCode;
  label: string;
  native: string;
  rtl: boolean;
};

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", native: "English", rtl: false },
  { code: "hi", label: "Hindi", native: "हिन्दी", rtl: false },
  { code: "bn", label: "Bengali", native: "বাংলা", rtl: false },
  { code: "te", label: "Telugu", native: "తెలుగు", rtl: false },
  { code: "mr", label: "Marathi", native: "मराठी", rtl: false },
  { code: "ta", label: "Tamil", native: "தமிழ்", rtl: false },
  { code: "ur", label: "Urdu", native: "اردو", rtl: true },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", rtl: false },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", rtl: false },
  { code: "ml", label: "Malayalam", native: "മലയാളം", rtl: false },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", rtl: false },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", rtl: false },
];

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_CODES as string[]).includes(code);
}
