---
name: KavachAI incoming-call alert (React screen, not native card)
description: On a real incoming call the native service launches the React call-alert.tsx screen; reputation is fetched in JS, not Kotlin
---

# Incoming-call alert — now a React screen

On a real incoming call the native `CallScreeningService` no longer draws a Kotlin
overlay card. It launches the full React screen `app/call-alert.tsx` (the same one
the home-screen DEMO button opens) over the lock screen via deep link
`kavach-ai://call-alert?number=<urlencoded>`.

**User-chosen behavior:** JUST show the screen automatically — NO auto-answer. The
user still taps Answer/Block. Do not add ANSWER_PHONE_CALLS / RECORD_AUDIO (keeps
the Play-safe policy; see play-permissions-policy.md).

**Native launch (KavachCallScreeningService.kt):**
- `respondToCall` is always an empty builder → never blocks/rejects/silences.
- Two launch paths: (a) direct `startActivity` of the deep link when `canDraw`
  (overlay permission grants the background-activity-launch exemption), and
  (b) ALWAYS post a full-screen-intent notification fallback
  (`USE_FULL_SCREEN_INTENT`, added in app.json) so it still fires without overlay
  permission / on stricter OEMs.
- The service NO LONGER does the HTTP lookup or any card drawing. All the old
  lookup/overlay/prettyCategory helpers were removed.

**KavachCallOverlay.kt** is trimmed to ONLY `canDraw` (still used by the module +
service to decide the direct-launch path). All show/update/Risk/view code is gone.

**Reputation is fetched in JS now (call-alert.tsx):**
- `isDemo = no number param`. Demo keeps the canned red showcase content unchanged
  (2,341 / 892 / Mumbai, FedEx badge, rotating red warnings).
- Real caller: `useCheckNumber(apiPhone)` (enabled only when `!isDemo && apiPhone`,
  explicit `getCheckNumberQueryKey`, `staleTime: 60s`). Renders REAL stats:
  reportCount, risk band, status (Verified/Reported/Clean), top category as badge.
- Risk band drives the theme (same rule as before): red when
  `verifiedScam || riskLevel in [high, medium]`, calmer navy otherwise. Caller
  circle shows a shield icon (not phone-incoming) when safe.
- **Honesty rule for the non-risky headline:** only show "No scam reports" when
  `rep && reportCount === 0`. Reported-but-low-risk → cautionHeadline; lookup
  failed / unknown / query disabled (rep undefined) → unknownHeadline ("couldn't
  verify — stay cautious"). Never show a reassuring "clean" line on an error or a
  reported number. (This was a code-review P1 — keep it.)

**Dead config left in place (minor):** `ScreeningStore` apiBaseUrl/authToken and
JS `syncScreeningApiConfig` are now UNUSED by native (JS does its own fetch via the
hook). Left to minimize churn; safe to remove later.

**i18n:** new callAlert keys (riskLabel/statusLabel/risk_*/status*/safeHeadline/
cautionHeadline/unknownHeadline/checking) added to en + hi only; other ~10 locales
rely on i18next fallbackLng → en (see kavach-ai-i18n.md).

**Can't be e2e tested here** — native auto-launch needs a real EAS device build (no
call simulation; Expo web preview is behind a proxy security block). Verify via
typecheck + architect.
