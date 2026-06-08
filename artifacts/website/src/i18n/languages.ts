export type LanguageCode = "en" | "hi";

export type LanguageMeta = {
  code: LanguageCode;
  label: string;
  native: string;
  short: string;
};

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", native: "English", short: "EN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", short: "हिं" },
];

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_CODES as string[]).includes(code);
}
