const WIDGET_ID = process.env.EXPO_PUBLIC_MSG91_WIDGET_ID ?? "";
const TOKEN_AUTH = process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH ?? "";

type OtpWidget = {
  initializeWidget: (widgetId: string, tokenAuth: string) => void;
  sendOTP: (data: { identifier: string }) => Promise<unknown>;
  retryOTP: (data: { reqId: string; retryChannel?: number }) => Promise<unknown>;
  verifyOTP: (data: { reqId: string; otp: string }) => Promise<unknown>;
};

let widgetRef: OtpWidget | null = null;
let triedLoad = false;
let initialized = false;

/**
 * The MSG91 widget ships native modules, so it only works in a real dev/release
 * build — not Expo Go or the web preview. Load it lazily inside a try/catch so
 * those environments never crash on import or use.
 */
function getWidget(): OtpWidget | null {
  if (triedLoad) return widgetRef;
  triedLoad = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@msg91comm/sendotp-react-native") as {
      OTPWidget?: OtpWidget;
    };
    const w = mod?.OTPWidget;
    if (w && typeof w.initializeWidget === "function") widgetRef = w;
  } catch {
    widgetRef = null;
  }
  return widgetRef;
}

export function isOtpAvailable(): boolean {
  return Boolean(WIDGET_ID && TOKEN_AUTH && getWidget());
}

function ensureInit(w: OtpWidget) {
  if (!initialized) {
    w.initializeWidget(WIDGET_ID, TOKEN_AUTH);
    initialized = true;
  }
}

/** Send an OTP via the MSG91 widget. Returns the reqId needed to verify/retry. */
export async function sendWidgetOtp(phoneE164: string): Promise<string> {
  const w = getWidget();
  if (!w) throw new Error("otp_unavailable");
  ensureInit(w);
  // MSG91 expects the identifier without a leading "+", e.g. 91XXXXXXXXXX.
  const identifier = phoneE164.replace(/^\+/, "");
  const res = (await w.sendOTP({ identifier })) as {
    reqId?: string;
    type?: string;
  } | null;
  if (!res || res.type === "error" || !res.reqId) {
    throw new Error("send_failed");
  }
  return res.reqId;
}

/** Verify an OTP via the MSG91 widget. Returns the access token for the backend. */
export async function verifyWidgetOtp(
  reqId: string,
  otp: string,
): Promise<string> {
  const w = getWidget();
  if (!w) throw new Error("otp_unavailable");
  const res = (await w.verifyOTP({ reqId, otp })) as {
    type?: string;
    "access-token"?: string;
  } | null;
  const token = res?.["access-token"];
  if (!res || res.type !== "success" || !token) {
    throw new Error("verify_failed");
  }
  return token;
}
