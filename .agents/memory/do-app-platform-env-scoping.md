---
name: DigitalOcean App Platform env var scoping
description: Component-level env vars override app-level ones with the same key; debugging when "I set the secret but the app ignores it".
---

On DigitalOcean App Platform, an env var defined at the **component (service)
level overrides** an app-level env var with the same key for that component.

**Why it bites:** if a component was created with SECRET *placeholder* env vars,
and the user later adds the real values at the **app level** in the dashboard,
the component keeps using its own placeholders — the real values silently have no
effect. Symptoms: app behaves as if the secret is empty/wrong even though the
dashboard "has" it. (Here: admin-login returned a configured-as-missing 503
because the api component's placeholder ADMIN_PASSWORD + placeholder ADMIN_PHONES
shadowed the real app-level values.)

**Fix:** keep each secret in ONE place. Either remove the component-level
duplicate so the app-level value is inherited, or set the real value directly on
the component. After consolidating, redeploy.

**Also:** values entered with type GENERAL are stored as plaintext in the app
spec (visible via `doctl apps spec get`); only type SECRET is encrypted at rest.
To encrypt an existing plaintext var, switch its type GENERAL→SECRET and re-apply
the spec — DO encrypts the value on update. `doctl apps spec get` returns SECRET
values as `EV[...]` ciphertext (safe to re-submit) and binding refs like
`${db-name.DATABASE_URL}` literally (preserve them — never replace with the
resolved URL).
