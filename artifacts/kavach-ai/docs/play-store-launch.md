# Netraksh: Google Play launch checklist (Android-first)

App ID: **`com.netraksh.app`** (permanent once the first build is uploaded to Play).
EAS project: `e5d1313b-c177-4200-96df-82bfce6d97ee` (owner `shviam`).

Steps marked **(you)** need an account or console only the owner can access.

## 1. Firebase, for Android push notifications (you)
Push (admin broadcasts, and later Family Guardian alerts) needs Firebase Cloud Messaging.

1. Create a Firebase project at <https://console.firebase.google.com> (Analytics optional).
2. Add an **Android app** with package name `com.netraksh.app`. Download `google-services.json`.
3. Give it to the build. Do one of:
   - `eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production --environment preview` (recommended), or
   - put the file at `artifacts/kavach-ai/google-services.json` (it's not secret).
   `app.config.js` picks it up automatically.
4. Firebase console → Project settings → Service accounts → **Generate new private key**.
   Upload it to Expo: `eas credentials` → Android → production → *Google Service Account* → *Push Notifications (FCM V1)*.

## 2. RevenueCat (you)
The Android app in RevenueCat must use the new package name.
- RevenueCat → Project → Apps → Android app → set package to `com.netraksh.app` (or create a new Android app and update `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` in `eas.json`).
- After the Play app exists, link the Play service account in RevenueCat and create products that match the app's package IDs (Premium annual, Family annual) with entitlement `premium`.

## 3. Google Play Console (you)
1. Create a developer account (one-time US$25) and the app **Netraksh**, default language English (India), free app with in-app purchases.
2. **Upload the first build**: `pnpm --filter @workspace/kavach-ai run build:android:prod` (produces an `.aab`), upload it to **Internal testing**.
3. App content declarations:
   - **Privacy policy**: <https://netraksh.com/privacy-policy>
   - **App access**: provide the demo login number for reviewers (see `lib/demo.ts`).
   - **Ads**: No ads.
   - **Content rating**: questionnaire (utility, no user-generated public content beyond scam reports).
   - **Target audience**: 18+ (the app handles payments and phone numbers).
   - **Data safety**: see section 4.
   - **Full-screen intent** (`USE_FULL_SCREEN_INTENT`): declare it for the incoming-call caller card. Explain it shows a scam warning for an incoming call. Google may question it for non-dialer apps, and the app works without it (falls back to a heads-up notification).
   - **Call screening**: the app uses the `ROLE_CALL_SCREENING` role and `ANSWER_PHONE_CALLS` (Answer button on the caller card). No call-log or SMS permissions are requested.
   - **Financial features**: none (no loans, no money transfer).
4. Store listing: app name "Netraksh: Scam Call Protection" (≤30 chars), short description (≤80), full description, 512×512 icon, 1024×500 feature graphic, at least 4 phone screenshots. Hindi listing recommended.
5. Promote Internal → Closed testing (Play requires 12 testers for 14 days for new personal developer accounts) → Production.

## 4. Data safety answers (from the code)
| Data type | Collected | Why | Shared |
|---|---|---|---|
| Phone number | Yes (account login, OTP) | Account management | No |
| Name | Yes (account, optional family member names) | Account / app functionality | No |
| Approximate location | Yes (city, optional) | Local scam hotspots | No |
| Phone numbers / links / UPI IDs the user checks or reports | Yes | App functionality, fraud prevention | Aggregated, anonymised stats only |
| Device push token | Yes | Notifications | No |
| Purchase history | Yes (via Google Play / RevenueCat) | Subscriptions | With RevenueCat (processor) |

- Data is encrypted in transit (HTTPS). Users can delete their account in the app (Profile → Delete account), which deletes their data.
- Precise location is **not** collected (`ACCESS_FINE_LOCATION` is blocked in `app.json`).
- SMS are **not** read automatically. A message is only checked when the user shares it to the app.

## 5. Before promoting to production
- [ ] Test on 2–3 real phones (incl. Xiaomi/Realme/Vivo): call screening role, lock-screen caller card, post-call report notification, share-to-check SMS, QR scan, login (OTP + demo), subscription purchase in Play's test track, account deletion.
- [ ] Push: send a test broadcast from Admin → Broadcast Center.
- [ ] Email the website launch waitlist (Admin → Launch Waitlist → Export CSV) once the app is live.
