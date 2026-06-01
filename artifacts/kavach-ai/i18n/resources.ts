import type { Resource } from "i18next";

import en from "./locales/en";
import hi from "./locales/hi";
import bn from "./locales/bn";
import te from "./locales/te";
import mr from "./locales/mr";
import ta from "./locales/ta";
import ur from "./locales/ur";
import gu from "./locales/gu";
import kn from "./locales/kn";
import ml from "./locales/ml";
import pa from "./locales/pa";
import or from "./locales/or";

/**
 * All locale resources keyed by language code. English is the complete source.
 * Every locale mirrors the English key structure exactly, but if a key were ever
 * missing, i18next resolves it to the English value via `fallbackLng: "en"`
 * (configured in i18n/index.ts) — no manual merge step is required.
 */
export const resources: Resource = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  te: { translation: te },
  mr: { translation: mr },
  ta: { translation: ta },
  ur: { translation: ur },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
};
