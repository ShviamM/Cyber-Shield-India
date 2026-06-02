import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./logger";
import { config } from "../config";

/**
 * Pluggable SMS sender. The dev mock just logs the code; the Twilio sender
 * delivers a real text. `createSmsSender` picks the implementation from
 * `config.smsProvider`.
 */
export interface SmsSender {
  sendOtp(phone: string, code: string): Promise<void>;
}

/** Shared OTP message body used by every real Twilio sender. */
function buildOtpMessage(code: string): string {
  const minutes = Math.max(1, Math.round(config.otpTtlSeconds / 60));
  return (
    `${code} is your Netraksh verification code. ` +
    `It expires in ${minutes} minute${minutes === 1 ? "" : "s"}. ` +
    `Never share this code with anyone.`
  );
}

class MockSmsSender implements SmsSender {
  async sendOtp(phone: string, code: string): Promise<void> {
    // Only ever log the plaintext code outside production. createSmsSender
    // refuses to return the mock in production, so this can't leak live OTPs.
    logger.info({ phone, code }, "[dev SMS] OTP generated (mock provider)");
  }
}

/**
 * Twilio OTP delivery via the Replit "twilio" connector (@replit/connectors-sdk).
 *
 * Two facts drive this implementation:
 *  - The connector's proxy injects Twilio auth automatically, so all REST calls
 *    must go through `connectors.proxy("twilio", ...)`. Direct calls to
 *    api.twilio.com with the connection's api_key fail (the key is scoped to
 *    the proxy).
 *  - The SDK's `listConnections` does NOT return credential settings, so the
 *    Account SID and the verified "from" number are read from the connectors
 *    "connection" endpoint with `include_secrets=true`.
 */
interface TwilioConfig {
  accountSid: string;
  from: string;
}

class TwilioSmsSender implements SmsSender {
  private readonly connectors = new ReplitConnectors();
  private cached: TwilioConfig | null = null;

  private async loadConfig(): Promise<TwilioConfig> {
    if (this.cached) return this.cached;

    const host = process.env.REPLIT_CONNECTORS_HOSTNAME ?? "connectors.replit.com";
    const identity = process.env.REPL_IDENTITY
      ? `repl ${process.env.REPL_IDENTITY}`
      : process.env.WEB_REPL_RENEWAL
        ? `depl ${process.env.WEB_REPL_RENEWAL}`
        : null;
    if (!identity) {
      throw new Error(
        "Replit identity token not found; cannot read Twilio connection settings.",
      );
    }

    const res = await fetch(
      `https://${host}/api/v2/connection?include_secrets=true&connector_names=twilio`,
      { headers: { Accept: "application/json", "X-Replit-Token": identity } },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to load Twilio connection settings (status ${res.status}). ` +
          "Reconnect the Twilio integration.",
      );
    }
    const data = (await res.json()) as {
      items?: Array<{ settings?: { account_sid?: string; phone_number?: string } }>;
    };
    const settings = data.items?.[0]?.settings ?? {};
    if (!settings.account_sid || !settings.phone_number) {
      throw new Error(
        "Twilio connection is missing account_sid or phone_number. " +
          "Reconnect the Twilio integration.",
      );
    }
    this.cached = { accountSid: settings.account_sid, from: settings.phone_number };
    return this.cached;
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const { accountSid, from } = await this.loadConfig();
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: buildOtpMessage(code),
    }).toString();

    const res = await this.connectors.proxy(
      "twilio",
      `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!res.ok) {
      // Surface Twilio's own error message so delivery failures are diagnosable
      // (e.g. trial-account unverified recipient, DLT/registration issues).
      let detail = "";
      try {
        const err = (await res.json()) as { message?: string; code?: number };
        detail = err.message ? `${err.message} (Twilio code ${err.code})` : "";
      } catch {
        detail = await res.text().catch(() => "");
      }
      logger.error({ phone, status: res.status, detail }, "Twilio SMS send failed");
      throw new Error(
        `Twilio SMS send failed (status ${res.status})${detail ? `: ${detail}` : ""}.`,
      );
    }
  }
}

/**
 * Standard Twilio OTP delivery using your own Twilio credentials. Use this when
 * the app runs OUTSIDE Replit (any third-party host): set TWILIO_ACCOUNT_SID,
 * TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER and calls go straight to
 * api.twilio.com with HTTP Basic auth.
 */
class StandardTwilioSmsSender implements SmsSender {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly from: string,
  ) {}

  async sendOtp(phone: string, code: string): Promise<void> {
    const body = new URLSearchParams({
      To: phone,
      From: this.from,
      Body: buildOtpMessage(code),
    }).toString();

    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      "base64",
    );
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body,
      },
    );

    if (!res.ok) {
      let detail = "";
      try {
        const err = (await res.json()) as { message?: string; code?: number };
        detail = err.message ? `${err.message} (Twilio code ${err.code})` : "";
      } catch {
        detail = await res.text().catch(() => "");
      }
      logger.error({ phone, status: res.status, detail }, "Twilio SMS send failed");
      throw new Error(
        `Twilio SMS send failed (status ${res.status})${detail ? `: ${detail}` : ""}.`,
      );
    }
  }
}

export function createSmsSender(): SmsSender {
  if (config.smsProvider === "twilio") {
    // Prefer standard Twilio credentials when present (off-Replit / third-party
    // hosting). Falls back to the Replit "twilio" connector otherwise.
    const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = config;
    if (twilioAuthToken) {
      if (!twilioAccountSid || !twilioFromNumber) {
        throw new Error(
          "TWILIO_AUTH_TOKEN is set but TWILIO_ACCOUNT_SID and/or " +
            "TWILIO_FROM_NUMBER are missing. Provide all three to send SMS.",
        );
      }
      return new StandardTwilioSmsSender(
        twilioAccountSid,
        twilioAuthToken,
        twilioFromNumber,
      );
    }
    return new TwilioSmsSender();
  }
  // Mock provider: never allowed in production (would log plaintext codes and
  // never actually deliver them).
  if (config.isProduction) {
    throw new Error(
      "No real SMS provider configured. Refusing to use the mock OTP sender " +
        "in production, which would log plaintext codes.",
    );
  }
  return new MockSmsSender();
}

export const smsSender: SmsSender = createSmsSender();
