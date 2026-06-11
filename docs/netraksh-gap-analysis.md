# Netraksh (Kavach AI) — Functional Gap Analysis & Enhancement Report

**Date:** 11 June 2026
**Scope:** Android app (`artifacts/kavach-ai`) + backend (`artifacts/api-server`) + admin (`artifacts/admin`)
**Reviewed by:** End-to-end codebase review against the supplied gap brief, benchmarked against Truecaller-class caller-protection apps and validated against current Android + Google Play policy.

> **Headline finding:** Most features in the brief are *already implemented* and reasonably mature. The real remaining gaps are narrow and specific. Several requested behaviours are deliberately **not** built because they require restricted permissions that have caused (or would cause) Play Store rejection. Compliant alternatives are documented below.

---

## 1. Features Implemented (working today)

### Incoming call experience
- Native `CallScreeningService` (`KavachCallScreeningService.kt`) bound via `ROLE_CALL_SCREENING` (Android 10+). Runs independently of the JS/app lifecycle, so it works when the **app is closed or backgrounded**.
- Truecaller-style **full-screen caller alert** (`app/call-alert.tsx`) launched two ways for reliability:
  - `startActivity` when *Display over other apps* (`SYSTEM_ALERT_WINDOW`) is granted.
  - High-priority notification with `fullScreenIntent` (`USE_FULL_SCREEN_INTENT`) so it fires on **lock screen / screen off** even when background activity starts are throttled.
- **Live reputation lookup** on every alert (risk band, community report count, scam category) via the backend, with a native fallback config (`syncScreeningApiConfig`) so lookups work even when the JS engine is killed.
- **Always-on safety reminder** ("Do NOT share OTP or send money!" in Hindi + English) now shown for *every* caller — risky and unknown alike (shipped earlier this session).
- In-alert **Answer / Block** actions (`ANSWER_PHONE_CALLS`), and on-device silent auto-reject for user-blocked numbers (`BlockedNumberDao`).

### Broadcasts & notifications
- Expo push registration (`lib/push.ts`) → backend `device_tokens` table (`POST /me/push-token`).
- Admin broadcast console (`admin/src/pages/broadcasts.tsx`) → `POST /admin/broadcasts`, with batched send via the Expo Push API and live success/failure stats.
- **In-app notification feed** (`app/notifications.tsx` ← `GET /notifications`) so users who miss/disable push still see every alert.
- **Read/unread** tracking with a home-screen bell dot (`hooks/useNotifications.ts`).
- High-importance Android channel ("Alerts") and **deep linking** into `verify` and `call-alert` routes.

### Location awareness
- Hybrid current-city detection (`hooks/useNearbyCity.ts`): `expo-location` reverse-geocode primary, **haversine nearest-city** fallback (13 metros) for offline.
- **Battery-efficient**: `Accuracy.Low` (Wi-Fi/cell, not GPS), one-shot on mount, refresh only on app-foreground, no continuous tracking.
- City used to filter **trending scams** and **scam hotspots** (`useGetTrendingScams`, `useGetCityHotspots` → `stats.ts`), and persisted to the user profile for server-side localised messaging.
- Graceful denial: "Enable Location" CTA, re-prompt or deep-link to Settings; app stays fully functional with nationwide data.

### Reporting, blocking & community intelligence
- Multiple report entry points: manual (`app/report.tsx`), share-to-check from other apps (`expo-share-intent` → `verify.tsx`), and in-call quick-report (`call-alert.tsx`).
- Backend `POST /reports` with phone normalisation, per-user duplicate window, and rate limiting; feeds `recomputeReputation`.
- On-device blocklist management (`app/blocked-numbers.tsx`) + native silent rejection.
- Community reputation engine (`lib/reputation.ts`): report-count + recency + admin "verified scam" flag → High/Medium/Low/Unknown bands surfaced in every check.

### User journey
- Onboarding (language + Guardian explainer), phone+OTP login (MSG91 widget), guided 5-step permission setup (`app/screening.tsx`), home dashboard with SOS (1930), Verify, Threats, Family Shield, Profile/Settings.
- Subscription: dual-path entitlement (RevenueCat store billing **or** Razorpay web), plus a no-card 7-day backend trial for eligible users.

---

## 2. Features Partially Implemented

| Area | What exists | What's missing |
| --- | --- | --- |
| Notification **categories** | Single "Alerts" channel; tier-based delivery (premium = push, free = in-app) | Content-type categories (Security Alert / Fraud Warning / Scam Campaign / Emergency / Product / Community), per-category icons & filtering, **silent** vs **high-priority** classification |
| Read/unread state | Local timestamp in AsyncStorage | No server-side sync (doesn't carry across devices); no per-item read state (it's a single "last seen" watermark) |
| Targeted notifications | Global broadcasts only | No individual/segmented (e.g. "users in city X") notifications |
| Post-call reporting | In-call popup can report during the call | No prompt **after** the call ends if the alert was dismissed/never shown; no in-app recent-calls list to report from |
| Location fallback | 13-metro haversine list | Users in smaller cities offline snap to a distant metro |
| Trial discoverability | No-card trial on the Subscription page | No home-screen hook; many eligible users never discover it |
| Subscription management | Correct dual-path entitlement | Web (Razorpay) subscribers are sometimes told to "manage via store", which won't work for them |

---

## 3. Features Blocked by Android Restrictions (cannot be done as the brief literally describes)

- **Guaranteed identical caller-ID across all OEMs (Samsung/Xiaomi/Vivo/Oppo/Realme/OnePlus/Pixel).** The APIs used are correct and standard, but Chinese-OEM skins (MIUI, Funtouch, ColorOS, Realme UI) apply aggressive battery/autostart killing and extra "appear on top / show on lock screen" toggles. No app — including Truecaller — can *guarantee* this purely in code. It is a **runtime device-settings problem**, addressed by onboarding guidance (see §5), not by code alone.
- **True automatic "post-call" popup** (a window that appears by itself after any call ends). This requires reading the call log / call state in a way that needs `READ_CALL_LOG` or default-dialer/role status. `CallScreeningService` is **not** notified when a call ends. So a self-launching post-call card is not available to a non-dialer app.
- **Android 14+ full-screen intent** is revoked by default for non-dialer apps; the app must send users to a settings toggle to re-enable lock-screen alerts (already handled in the native module).

---

## 4. Features Blocked by Google Play Policy (intentionally not built)

These were **deliberately excluded** to keep the app publishable (the project has prior Play rejection history on exactly these):

- `READ_CALL_LOG` / `READ_PHONE_STATE` (call-log access) — would unlock a true post-call popup but triggers the Permissions Declaration / rejection. **Not used.**
- `READ_SMS` — would allow automatic SMS scam scanning but is restricted. Replaced by **share-to-check** (user shares a suspicious SMS into the app). **Not used.**
- `RECORD_AUDIO` — call recording is restricted/illegal in many contexts. **Not used.**
- **Background location** (`ACCESS_BACKGROUND_LOCATION`) — would enable proactive "you've entered a scam hotspot" geofencing, but is a high-scrutiny permission requiring a strong justification and prominent disclosure. Current design uses **foreground-only** location. **Not used** (recommended to keep it that way).

---

## 5. Recommended Alternatives (Play-compliant)

1. **Cross-OEM reliability → onboarding "Make it reliable on your phone" step.** Detect manufacturer and deep-link to the OEM autostart/battery-unrestricted screens (MIUI/ColorOS/Funtouch intents), plus a "test call" self-check that confirms the overlay actually appears. This is what Truecaller does. *(App-only; no new permissions.)*
2. **Post-call reporting → two compliant options:**
   - (a) The screening service already sees every number. Persist recently-screened numbers on-device and show a **"Recent calls — report in one tap"** list in-app.
   - (b) After an alert, post a **local notification** ("Was this a scam? Tap to report") that deep-links into the pre-filled report screen.
   Both avoid call-log permissions entirely. *(Native + app; EAS rebuild.)*
3. **Notification categories → add a `category` field** to broadcasts (Security / Fraud / Scam Campaign / Emergency / Product / Community), an admin dropdown, per-category icons + filter chips in the in-app feed, and map Emergency→high-priority, Product→silent channel. *(Backend DB migration + admin + app.)*
4. **Trial discoverability → home-screen banner** for eligible users (`status.trialEligible`) linking to the no-card trial. *(App-only.)*
5. **Subscription management copy → route by billing source** (Razorpay web subscribers get a "manage on netraksh.com" path; store subscribers get the Play link). *(App-only.)*
6. **Smaller-city location → expand the fallback list** (or only use reverse-geocode and show "nationwide" when offline rather than snapping to a wrong metro). *(App-only.)*

---

## 6. Code Changes Performed in This Review

- **Already shipped this session:** always-on "Do NOT share OTP or send money!" call-alert warning for every caller (Hindi + English), plus call-screening permission-state accuracy fixes and the OTP-login build-config fix. A preview APK build including these is in progress on EAS.
- **This task:** completed the full end-to-end review above. Concrete code changes for the §5 recommendations are **scoped and ready but not yet applied**, because the highest-value ones touch the **production database** (category migration) and the **native module** (post-call list → new EAS build + Play resubmission). I'm holding for your go-ahead on which to implement so we sequence the prod migration and app release deliberately rather than blind-shipping.

---

## 7. Remaining Risks Before Production Release

| Risk | Severity | Mitigation |
| --- | --- | --- |
| OEM battery/autostart killing the screening service on Xiaomi/Vivo/Oppo/Realme | **High** (core feature reliability) | Add the OEM onboarding/self-test step (§5.1); set expectations in-app |
| Android 14+ users never enable full-screen intent → no lock-screen alert | Medium | Already deep-linked to the toggle; add a self-test to confirm |
| Notification categories absent → all alerts look identical, fatigue | Medium | Implement §5.3 |
| No-card trial undiscovered → lost conversions | Medium | Implement §5.4 |
| Web subscribers misdirected to store for management | Low | Implement §5.5 |
| Offline users in small cities mislabelled | Low | Implement §5.6 |
| Permission fatigue (5-step setup) | Low/Med | Keep the guided flow; consider progressive prompting (ask overlay/full-screen only when first relevant) |

---

### Suggested priority order
1. OEM reliability onboarding + self-test (app-only, biggest reliability win)
2. Post-call reporting (compliant recent-calls list / notification)
3. Notification categories (backend + admin + app)
4. Trial home-screen hook + subscription-management routing (app-only, quick)
5. Location fallback polish (app-only, quick)
