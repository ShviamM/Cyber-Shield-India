---
name: National Cybercrime "Search a Suspect" integration
description: Why the cybercrime.gov.in suspect repository is deep-link only, not an API call.
---

# cybercrime.gov.in suspect repository = deep-link only

The Verify screen integrates the Government of India National Cybercrime
"Search a Suspect" repository
(`https://cybercrime.gov.in/Webform/suspect_search_repository.aspx`).

**Rule:** integrate it by OPENING the portal (expo-web-browser, fall back to
Linking.openURL), never by calling it as an API.

**Why:** it is a captcha-gated ASPX web form with no public API and no GET
query-param prefill, so there is no way to query it programmatically or
pre-fill the search field. Any attempt to "fetch" or auto-submit it will fail.

**How to apply:** keep it as a contextual "cross-check on the official portal"
CTA shown after a valid check result. Do not promise auto-lookup. If prefill is
ever wanted, the only option is copying the value to the clipboard for the user
to paste (would need expo-clipboard, not currently a dependency).
