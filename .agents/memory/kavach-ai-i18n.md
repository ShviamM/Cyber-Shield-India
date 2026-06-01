---
name: KavachAI i18n
description: How localization is wired in the KavachAI Expo app and the non-obvious constraints around locale completeness.
---

# KavachAI i18n (i18next)

The Expo app (`artifacts/kavach-ai`) uses i18next + react-i18next + expo-localization.
`i18n/locales/en.ts` is the canonical source; all other locales mirror its key tree.

## Locale completeness is NOT type-enforced
`i18n/resources.ts` types the bundle as i18next's loose `Resource`, and the locale
files are plain `const xx = { ... }` objects (no `satisfies typeof en`). So `tsc`
will NOT catch a missing or extra key in a non-English locale.

**Why:** keeping locales as untyped plain objects avoids fighting i18next's types and
keeps subagent-generated files simple.

**How to apply:** after adding/translating keys, verify parity at runtime by flattening
each locale object (recursing into nested objects, recording `array[]=len`) and diffing
the key set against `en`. A missing/extra count > 0 means a locale drifted. At last
check every locale had identical key counts.

## Fallback strategy
Missing keys resolve to English via `fallbackLng: "en"` in `i18n/index.ts`. There is
NO manual deep-merge step despite what an older comment claimed — do not add one; it is
redundant with i18next's per-key fallback.

## Conventions
- Plurals handled in-component (`*One` variant + base key with `{{n}}`), NOT i18next's
  Intl plural engine (avoids Hermes Intl.PluralRules reliance).
- `family` member `lastSeen` is stored as a semantic token (`justNow`, `oneHourAgo`,
  `"Just added"`) and localized at render via a token→key map; unknown values render verbatim.
- Out of scope / intentionally left in source language: the dynamic feed in
  `constants/data.ts` (LIVE_THREATS, SCAM_OF_DAY, CITY_HOTSPOTS, GOLDEN_RULES) and the
  relative `time` strings on feed items.
- Keep verbatim across all locales: brand `KavachAI`, helpline `1930`, `OTP`/`UPI`/`QR`/`SMS`,
  URLs (`cybercrime.gov.in`), `FedEx`.
- 12 languages: en, hi, bn, te, mr, ta, ur, gu, kn, ml, pa, or. Persisted to AsyncStorage
  key `kv_language`; runtime selector at `app/language.tsx` (reached from profile).
