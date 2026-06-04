import { logger } from "./logger";
import { config } from "../config";

/**
 * Pluggable SMS sender. The dev mock just logs the code; the MSG91 sender
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

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

/**
 * MSG91 OTP delivery via the MSG91 Flow API.
 *
 * The app generates and verifies its own OTP, so MSG91 is used purely as a
 * delivery channel: we post the already-generated code as a template variable
 * to a DLT-approved flow template. Mobile numbers must be in country-code form
 * without a leading "+" (e.g. 919876543210), which is how MSG91 expects them.
 */
class Msg91SmsSender implements SmsSender {
  constructor(
    private readonly authKey: string,
    private readonly templateId: string,
    private readonly senderId: string,
    private readonly otpVar: string,
  ) {}

  async sendOtp(phone: string, code: string): Promise<void> {
    // MSG91 wants the mobile as country code + number with no leading "+".
    const mobiles = phone.replace(/^\+/, "");

    const body: Record<string, unknown> = {
      template_id: this.templateId,
      short_url: "0",
      recipients: [{ mobiles, [this.otpVar]: code }],
    };
    if (this.senderId) body.sender = this.senderId;

    const res = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        authkey: this.authKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // MSG91 returns HTTP 200 even for some logical failures, so inspect the
    // payload's `type` field ("success" | "error") as well as the status code.
    let payload: { type?: string; message?: string } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!res.ok || payload.type === "error") {
      const detail = payload.message ?? "";
      logger.error(
        { phone, status: res.status, detail },
        "MSG91 SMS send failed",
      );
      throw new Error(
        `MSG91 SMS send failed (status ${res.status})${detail ? `: ${detail}` : ""}.`,
      );
    }
  }
}

export function createSmsSender(): SmsSender {
  if (config.smsProvider === "msg91") {
    const { msg91AuthKey, msg91TemplateId, msg91SenderId, msg91OtpVar } = config;
    if (!msg91AuthKey || !msg91TemplateId) {
      throw new Error(
        "SMS_PROVIDER=msg91 but MSG91_AUTH_KEY and/or MSG91_TEMPLATE_ID are " +
          "missing. Provide both to send OTPs via MSG91.",
      );
    }
    return new Msg91SmsSender(
      msg91AuthKey,
      msg91TemplateId,
      msg91SenderId,
      msg91OtpVar,
    );
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
