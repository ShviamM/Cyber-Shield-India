// MSG91 OTP Widget (web) wrapper. The widget script sends AND verifies the OTP
// on MSG91's side and yields a JWT access-token, which the backend validates via
// verifyAccessToken. widgetId + tokenAuth are PUBLIC client credentials.
const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string | undefined;
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH as string | undefined;

const SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";

type SuccessCb = (data: unknown) => void;
type FailureCb = (error: unknown) => void;

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void;
    sendOtp?: (identifier: string, success?: SuccessCb, failure?: FailureCb) => void;
    verifyOtp?: (
      otp: string | number,
      success?: SuccessCb,
      failure?: FailureCb,
      reqId?: string,
    ) => void;
    retryOtp?: (
      channel: string | null,
      success?: SuccessCb,
      failure?: FailureCb,
      reqId?: string,
    ) => void;
  }
}

let loadPromise: Promise<void> | null = null;
let initialized = false;

export function isOtpConfigured(): boolean {
  return Boolean(WIDGET_ID && TOKEN_AUTH);
}

function loadScript(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.initSendOTP) return resolve();
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      // Allow a later attempt to retry instead of caching the failure forever.
      loadPromise = null;
      reject(new Error("otp_unavailable"));
    };
    document.body.appendChild(el);
  });
  return loadPromise;
}

async function waitFor(check: () => boolean, timeoutMs = 4000): Promise<void> {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) throw new Error("otp_unavailable");
    await new Promise((r) => setTimeout(r, 50));
  }
}

async function ensureInit(): Promise<void> {
  if (!isOtpConfigured()) throw new Error("otp_unavailable");
  await loadScript();
  await waitFor(() => typeof window.initSendOTP === "function");
  if (!initialized) {
    window.initSendOTP!({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      // exposeMethods drives our own UI and exposes sendOtp/verifyOtp/retryOtp.
      exposeMethods: true,
    });
    initialized = true;
  }
  await waitFor(() => typeof window.sendOtp === "function");
}

function extractToken(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const t = d["access-token"] ?? d.message ?? d.token;
    if (typeof t === "string") return t;
  }
  return null;
}

/** Send an OTP via the MSG91 web widget. Identifier carries the country code, no "+". */
export async function sendOtp(phoneE164: string): Promise<void> {
  await ensureInit();
  const identifier = phoneE164.replace(/^\+/, "");
  await new Promise<void>((resolve, reject) => {
    window.sendOtp!(
      identifier,
      () => resolve(),
      () => reject(new Error("send_failed")),
    );
  });
}

/** Resend the OTP on the default channel. */
export async function resendOtp(): Promise<void> {
  await ensureInit();
  await waitFor(() => typeof window.retryOtp === "function");
  await new Promise<void>((resolve, reject) => {
    window.retryOtp!(
      null,
      () => resolve(),
      () => reject(new Error("send_failed")),
    );
  });
}

/** Verify the OTP; resolves with the MSG91 access-token for the backend. */
export async function verifyOtp(code: string): Promise<string> {
  await ensureInit();
  await waitFor(() => typeof window.verifyOtp === "function");
  return await new Promise<string>((resolve, reject) => {
    window.verifyOtp!(
      code,
      (data) => {
        const token = extractToken(data);
        if (!token) reject(new Error("verify_failed"));
        else resolve(token);
      },
      () => reject(new Error("verify_failed")),
    );
  });
}
