---
name: Netraksh website i18n
description: How bilingual EN/HI localization is wired in the marketing website (artifacts/website) and the conventions that keep it parallel-subagent-safe.
---

# Netraksh website i18n (i18next + react-i18next)

The marketing site (`artifacts/website`) is EN/HI bilingual. Foundation: `src/i18n/{index.ts, resources.ts, languages.ts}`.

## Per-namespace, per-page ownership (parallel-safe)
`resources.ts` auto-loads `./locales/{en,hi}/*.ts` via Vite `import.meta.glob`, so each page gets its OWN namespace file pair (`home`, `features`, `family`, `pricing`, `laws`, `founder`, `about`, `articles`, `legal`, `misc`, `account`) plus shared `common`.
**Why:** this lets many subagents translate different pages in parallel with zero merge conflicts — each owns only its page component(s) + its `en/<ns>.ts` + `hi/<ns>.ts`. Don't consolidate into one big file.

## Conventions
- Page: `const { t } = useTranslation("<ns>")`. Structured/repeated content lives in the locale arrays, read via `t("key", { returnObjects: true }) as Array<{...}>`.
- Non-text config (lucide icons, hrefs, color tones, image src) stays in module-level arrays in the component and is merged with translated text BY INDEX (use `?? Fallback` for safety). Brand "Netraksh", URLs, emails, phone (1930), figures (₹/lakh/crore), and standard acronyms (UPI/OTP/KYC/SMS/QR/IT Act/BNS/DPDP) stay verbatim across locales.
- Bilingual DATA files (`data/scamArticles.ts` parallel `scamArticlesHi`; `data/legalContent.ts` keyed `Record<"en"|"hi", ...>`): select with `i18n.language.startsWith("hi") ? "hi" : "en"`. Keep slugs/IDs/category enums in English so routes + filtering don't break; only display labels translate.
- Site-wide chrome (Navbar, Footer, MobileCTABar, TrustTicker news ticker) lives in `common`.

## Locale completeness is NOT type-enforced
`resources` is cast to i18next's loose `Resource`; locale files are plain `export default {...}`. `tsc` will NOT catch a missing/extra key in `hi`.
**How to apply:** after edits, run a runtime flatten-and-diff parity check of every `hi/<ns>.ts` against `en/<ns>.ts` (recurse objects, record `array[]=len`). Missing/extra count must be 0. Missing keys fall back to English via `fallbackLng`.

## Switching language
`setAppLanguage()` persists to localStorage key `netraksh_lang` and syncs `<html lang>`. No querystring detector — to screenshot a non-default language you must temporarily hardcode `initialLng` in `index.ts` (screenshots can't set localStorage), then revert.
