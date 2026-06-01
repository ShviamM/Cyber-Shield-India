import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type LanguageCode,
} from "./languages";
import { resources } from "./resources";

export const LANGUAGE_STORAGE_KEY = "kv_language";

/**
 * Resolve the best starting language: a previously saved choice wins; otherwise
 * fall back to the device locale if we support it; otherwise English.
 */
async function resolveInitialLanguage(): Promise<LanguageCode> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isSupportedLanguage(saved)) return saved;
  } catch {
    // ignore storage read failures and fall through to device detection
  }

  try {
    const locales = Localization.getLocales();
    for (const loc of locales) {
      const code = loc.languageCode?.toLowerCase();
      if (code && isSupportedLanguage(code)) return code;
    }
  } catch {
    // ignore locale detection failures
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Initialise i18next once at app start. Resolves the starting language from
 * storage/device, configures English as the fallback, and disables the
 * Intl-based plural engine (plurals are handled in-component).
 */
export async function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) return i18n;

  const lng = await resolveInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: "translation",
    ns: ["translation"],
    returnObjects: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
}

/**
 * Change the active language at runtime and persist the choice.
 */
export async function setAppLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore persistence failures; language still applies for this session
  }
}

export function getCurrentLanguage(): LanguageCode {
  const code = i18n.language;
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

export default i18n;
