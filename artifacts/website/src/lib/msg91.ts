// MSG91 OTP web widget integration. Mirrors the mobile app's flow: the widget
// sends and verifies the OTP entirely on MSG91's side, then returns an access
// token (a short-lived JWT) that the backend verifies via POST /auth/verify-token.
//
// The same WIDGET_ID / TOKEN_AUTH are public client credentials (they ship in
// the bundle by design). The real secret (MSG91_AUTH_KEY) stays server-side.

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID as string | undefined;
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH as string | undefined;

const PROVIDER_SRC = "https://verify.msg91.com/otp-provider.js";

type WidgetCallback = (data: unknown) => void;

interface Msg91Window {
  initSendOTP?: (config: {
    widgetId: string;
    tokenAuth: string;
    exposeMethods?: boolean;
    success?: WidgetCallback;
    failure?: WidgetCallback;
  }) => void;
  sendOtp?: (
    identifier: string,
    success: WidgetCallback,
    failure: WidgetCallback,
  ) => void;
  verifyOtp?: (
    otp: string | number,
    success: WidgetCallback,
    failure: WidgetCallback,
  ) => void;
  retryOtp?: (
    channel: string | null,
    success: WidgetCallback,
    failure: WidgetCallback,
  ) => void;
}

function w(): Msg91Window {
  return window as unknown as Msg91Window;
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const candidate = rec.message ?? rec.msg ?? rec.error;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return fallback;
}

function extractToken(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const candidate = rec.message ?? rec["access-token"] ?? rec.accessToken;
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (w().initSendOTP) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PROVIDER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Could not load the verification service.")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = PROVIDER_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Could not load the verification service."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (!WIDGET_ID || !TOKEN_AUTH) {
    throw new Error("Phone verification is not configured.");
  }
  await loadScript();
  if (initialized) return;
  const win = w();
  if (!win.initSendOTP) {
    throw new Error("Verification service unavailable. Please try again.");
  }
  win.initSendOTP({
    widgetId: WIDGET_ID,
    tokenAuth: TOKEN_AUTH,
    exposeMethods: true,
    success: () => {},
    failure: () => {},
  });
  initialized = true;
  // Give the widget a tick to attach its methods to window.
  await new Promise((resolve) => setTimeout(resolve, 60));
}

/** Send an OTP to the given identifier (e.g. "91XXXXXXXXXX"). */
export async function sendOtp(identifier: string): Promise<void> {
  await ensureInitialized();
  const win = w();
  return new Promise<void>((resolve, reject) => {
    if (!win.sendOtp) {
      reject(new Error("Verification service unavailable. Please try again."));
      return;
    }
    win.sendOtp(
      identifier,
      () => resolve(),
      (data) => reject(new Error(extractMessage(data, "Could not send the code."))),
    );
  });
}

/** Verify the OTP entered by the user; resolves with the MSG91 access token. */
export async function verifyOtp(otp: string): Promise<string> {
  const win = w();
  return new Promise<string>((resolve, reject) => {
    if (!win.verifyOtp) {
      reject(new Error("Verification service unavailable. Please try again."));
      return;
    }
    win.verifyOtp(
      otp,
      (data) => {
        const token = extractToken(data);
        if (token) resolve(token);
        else reject(new Error("Incorrect code. Please try again."));
      },
      (data) => reject(new Error(extractMessage(data, "Incorrect code. Please try again."))),
    );
  });
}

/** Resend the OTP (text channel). */
export async function retryOtp(): Promise<void> {
  const win = w();
  return new Promise<void>((resolve, reject) => {
    if (!win.retryOtp) {
      reject(new Error("Could not resend the code. Please try again."));
      return;
    }
    win.retryOtp(
      null,
      () => resolve(),
      (data) => reject(new Error(extractMessage(data, "Could not resend the code."))),
    );
  });
}
