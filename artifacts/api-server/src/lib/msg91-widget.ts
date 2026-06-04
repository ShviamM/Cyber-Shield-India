import { config } from "../config";
import { normalizeIndianPhone } from "./phone";
import { HttpError } from "./http-error";

const VERIFY_URL = "https://api.msg91.com/api/v5/widget/verifyAccessToken";

interface VerifyAccessTokenResponse {
  type?: string;
  message?: string;
  data?: {
    mobile?: string;
    email?: string;
    identifier?: string;
    isVerified?: boolean;
  };
}

/**
 * Validate an MSG91 OTP Widget access token server-side.
 *
 * The mobile app runs the MSG91 widget, which sends and verifies the OTP on
 * MSG91's side and returns a short-lived JWT ("access-token"). We forward that
 * token to MSG91's verifyAccessToken API using the account auth key. On success
 * MSG91 returns the verified mobile number, which is the only number we trust —
 * never a phone value supplied by the client.
 *
 * Returns the verified phone normalized to +91XXXXXXXXXX. Throws HttpError on
 * any failure (misconfiguration, invalid/expired token, unverified result).
 */
export async function verifyAccessToken(accessToken: string): Promise<{ phone: string }> {
  if (!config.msg91AuthKey || !config.msg91WidgetId) {
    throw new HttpError(
      503,
      "auth_unavailable",
      "Phone verification is not configured. Please try again later.",
    );
  }

  const token = accessToken.trim();
  if (!token) {
    throw new HttpError(400, "invalid_token", "Missing verification token.");
  }

  let payload: VerifyAccessTokenResponse;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: config.msg91AuthKey,
      },
      body: JSON.stringify({
        "access-token": token,
        widgetId: config.msg91WidgetId,
      }),
    });
    payload = (await res.json().catch(() => ({}))) as VerifyAccessTokenResponse;
    // MSG91 can return HTTP 200 with type:"error" on logical failures, so the
    // status code alone is not sufficient — also inspect the payload.
    if (!res.ok || payload.type === "error") {
      throw new HttpError(
        401,
        "verification_failed",
        "Couldn't verify this code. Please try signing in again.",
      );
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(
      502,
      "verification_unavailable",
      "Couldn't reach the verification service. Please try again shortly.",
    );
  }

  const rawMobile = payload.data?.mobile ?? payload.data?.identifier ?? "";
  const phone = normalizeIndianPhone(rawMobile);
  if (payload.data?.isVerified === false || !phone) {
    throw new HttpError(
      401,
      "verification_failed",
      "Couldn't verify this code. Please try signing in again.",
    );
  }

  return { phone };
}
