---
name: OTP delivery via MSG91
description: How OTP login SMS is sent and why the self-managed code path was kept over MSG91's widget.
---

The app owns the OTP lifecycle: it generates a 6-digit code, stores only a
phone-bound sha256 hash, enforces expiry / attempt caps / per-phone + per-IP
rate limits, and consumes the code single-use. The SMS provider is ONLY a
delivery channel behind the `SmsSender` interface.

MSG91 is the provider, called via the Flow API (one POST per send) with the
account auth key and a DLT-approved template; the generated code is injected as
a template variable. The provider can return HTTP 200 on logical failures, so
delivery success must also check the response body's `type` field.

**Why:** When asked to "use MSG91", the user was offered (A) MSG91 as delivery
only vs (B) MSG91's OTP Widget SDK that sends+verifies on MSG91's side. The user
chose A — it keeps our rate-limiting/code control and works on the server with
no native dev build (the widget needs a native build, like Razorpay).

**How to apply:** Keep OTP generation/verification server-side; only swap the
delivery implementation if changing providers. Don't reintroduce a provider that
also verifies (would bypass our rate limits). Twilio was fully removed; its
connector binding in `.replit` can only be disconnected via the Replit UI.
