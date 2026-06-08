import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type LanguageCode,
} from "./languages";
import { resources, namespaces } from "./resources";

export const LANGUAGE_STORAGE_KEY = "netraksh_lang";

function resolveInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isSupportedLanguage(saved)) return saved;
  } catch {
    // ignore storage read failures
  }
  try {
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav && isSupportedLanguage(nav)) return nav;
  } catch {
    // ignore detection failures
  }
  return DEFAULT_LANGUAGE;
}

const initialLng = resolveInitialLanguage();

function syncHtmlLang(lng: string) {
  try {
    document.documentElement.lang = lng;
  } catch {
    // ignore in non-DOM environments
  }
}

i18n.use(initReactI18next).init({
  resources: resources as Resource,
  lng: initialLng,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: namespaces.length ? namespaces : ["common"],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

syncHtmlLang(initialLng);

export function setAppLanguage(code: LanguageCode): void {
  i18n.changeLanguage(code);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore persistence failures; language still applies for this session
  }
  syncHtmlLang(code);
}

export function getCurrentLanguage(): LanguageCode {
  const code = i18n.language;
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

export default i18n;
