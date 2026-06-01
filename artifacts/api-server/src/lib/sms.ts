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

class MockSmsSender implements SmsSender {
  async sendOtp(phone: string, code: string): Promise<void> {
    // Only ever log the plaintext code outside production. createSmsSender
    // refuses to return the mock in production, so this can't leak live OTPs.
    logger.info({ phone, code }, "[dev SMS] OTP generated (mock provider)");
  }
}

interface TwilioSettings {
  account_sid?: string;
  phone_number?: string;
}

/**
 * Sends OTP codes via Twilio using the Replit Twilio connector.
 * Integration: Replit connector "twilio" (@replit/connectors-sdk). The proxy
 * injects authentication automatically; we only need the account SID (for the
 * REST path) and the verified "from" number from the connection settings.
 */
class TwilioSmsSender implements SmsSender {
  private readonly connectors = new ReplitConnectors();

  private async getSettings(): Promise<{ accountSid: string; from: string }> {
    const connections = await this.connectors.listConnections({
      connector_names: "twilio",
    });
    const connection = connections[0] as
      | { settings?: TwilioSettings }
      | undefined;
    const settings = connection?.settings ?? {};
    const accountSid = settings.account_sid;
    const from = settings.phone_number;
    if (!accountSid || !from) {
      throw new Error(
        "Twilio connection is missing account_sid or phone_number. " +
          "Reconnect the Twilio integration.",
      );
    }
    return { accountSid, from };
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const { accountSid, from } = await this.getSettings();
    const minutes = Math.max(1, Math.round(config.otpTtlSeconds / 60));
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body:
        `${code} is your KavachAI verification code. ` +
        `It expires in ${minutes} minute${minutes === 1 ? "" : "s"}. ` +
        `Never share this code with anyone.`,
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
      const detail = await res.text().catch(() => "");
      logger.error(
        { phone, status: res.status, detail },
        "Twilio SMS send failed",
      );
      throw new Error(`Twilio SMS send failed (status ${res.status}).`);
    }
  }
}

export function createSmsSender(): SmsSender {
  if (config.smsProvider === "twilio") {
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
