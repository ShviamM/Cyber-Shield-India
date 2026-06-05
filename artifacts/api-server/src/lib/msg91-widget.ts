import { config } from "../config";
import { normalizeIndianPhone } from "./phone";
import { HttpError } from "./http-error";
import { logger } from "./logger";

const VERIFY_URL = "https://api.msg91.com/api/v5/widget/verifyAccessToken";

interface VerifyAccessTokenResponse {
  type?: string;
  message?: string;
  code?: string | number;
  data?: {
    mobile?: string;
    email?: string;
    identifier?: string;
    isVerified?: boolean;
  };
}

// Show only the last 4 digits so OTP-flow logs never carry a full phone number.
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***${digits.slice(-4)}`;
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
      // Log MSG91's own code/message (never the token) so OTP verify failures
      // are diagnosable: code 201/418 = authkey problem, 701 = bad/expired token.
      logger.warn(
        { httpStatus: res.status, msg91Type: payload.type, msg91Code: payload.code },
        "MSG91 verifyAccessToken rejected token",
      );
      throw new HttpError(
        401,
        "verification_failed",
        "Couldn't verify this code. Please try signing in again.",
      );
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    logger.error({ err }, "MSG91 verifyAccessToken request failed");
    throw new HttpError(
      502,
      "verification_unavailable",
      "Couldn't reach the verification service. Please try again shortly.",
    );
  }

  // On success MSG91 returns the verified mobile directly in `message`
  // (e.g. { type: "success", message: "919682824432" }). Some responses nest it
  // under data.mobile/identifier instead. We only reach here when type is not
  // "error", so `message` holds the number rather than an error string.
  // Prefer the phone-bearing fields first: data.mobile, then the top-level
  // `message` (observed success shape), then data.identifier last since for
  // phone-only auth an identifier could be a non-phone value (e.g. email).
  const rawMobile =
    payload.data?.mobile ??
    payload.message ??
    payload.data?.identifier ??
    "";
  const phone = normalizeIndianPhone(rawMobile);
  if (payload.data?.isVerified === false || !phone) {
    logger.warn(
      { isVerified: payload.data?.isVerified, hasPhone: Boolean(phone) },
      "MSG91 verifyAccessToken returned no usable verified phone",
    );
    throw new HttpError(
      401,
      "verification_failed",
      "Couldn't verify this code. Please try signing in again.",
    );
  }

  logger.info({ phone: maskPhone(phone) }, "MSG91 access token verified");
  return { phone };
}
