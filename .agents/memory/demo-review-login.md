---
name: Demo / store-review login
description: Production OTP-bypass login for app-store reviewers, and why its number must be a throwaway non-admin one.
---

# Demo / store-review login

App-store reviewers can't receive SMS OTP, so there is a **production** login that
accepts a fixed phone + fixed passcode and issues a normal session
(`POST /auth/demo-login`). This is distinct from `/auth/dev-login`, which is
dev-only and fail-closed.

**Rule:** The demo number must be a throwaway **NON-admin** number — never the
platform owner/admin phone.

**Why:** Admin/owner status is derived from the *phone*, not just a DB flag
(`isSuperAdmin(user) = user.isAdmin && superAdminPhones.includes(user.phone)`, and
`superAdminPhones` falls back to `adminPhones`). The single configured admin phone
is the owner's real number. The demo passcode is published in Google Play's review
notes, which are effectively **semi-public**. If the demo number were the owner
number, anyone who reads those notes could OTP-bypass straight into the
owner/super-admin account and hit every admin API.

**How to apply:**
- Keep the demo number out of `ADMIN_PHONES` / `SUPER_ADMIN_PHONES`.
- Two guards exist and must stay: config resolves the demo phone to `null`
  (disabling the route) if it's a privileged phone; the route also `404`s if the
  resolved account turns out admin/super-admin. Don't remove either.
- Premium for reviewers is unlocked **client-side** (RevenueCat override keyed on
  the demo phone). The backend session grants no paid capability, so a *new*
  server-side paid gate would not auto-apply to the demo account.
- Disable the whole feature by clearing `DEMO_LOGIN_OTP` (route `404`s).
- It's a client change: the demo flow only exists in a build that ships the updated
  mobile code, so a **new AAB/versionCode** is required for reviewers to use it.
- Caveat: the demo number is a syntactically valid mobile number (no reserved test
  range exists for Indian mobiles). If a real subscriber ever owns it, the passcode
  would log into their (non-admin) account, and the app would intercept that number
  for its real owner. Low likelihood, non-admin blast radius — acceptable for launch.
