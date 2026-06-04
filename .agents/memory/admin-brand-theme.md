---
name: Admin web brand theme
description: How the admin web console mirrors the kavach-ai (Netraksh) mobile brand, and the primary-token contrast rule.
---

The admin web app (artifacts/admin) shares the kavach-ai mobile brand: saffron
`#FF6713`, navy `#0B3D91`, green `#138808`, the "Netra"+"ksh" (ksh in saffron)
wordmark, and the India tricolor strip. The shared mobile app icon is the logo.

**Rule: in the admin's shadcn theme, `--primary` must be NAVY, not saffron.**
**Why:** saffron `#FF6713` on white is ~2.9:1 contrast (fails WCAG AA), and the
mobile app itself uses navy for action buttons while saffron is only a brand
accent (the "ksh" letters, tricolor, warnings) — never the button fill. Mapping
shadcn `--primary` to saffron turns every default Button/Badge saffron+white and
both fails contrast and misrepresents the app.
**How to apply:** keep `--primary`/`--ring` navy; express saffron explicitly in
brand elements only (wordmark accent, tricolor). `--destructive` stays red.
