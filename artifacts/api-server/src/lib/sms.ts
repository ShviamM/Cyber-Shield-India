import { logger } from "./logger";
import { config } from "../config";

/**
 * Pluggable SMS sender. Swap the dev mock for a real provider (e.g. an Indian
 * SMS gateway) by implementing this interface and returning it from
 * `createSmsSender` based on environment configuration.
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

export function createSmsSender(): SmsSender {
  // Future: inspect env (provider keys) and return a real implementation.
  if (config.isProduction) {
    throw new Error(
      "No real SMS provider configured. Refusing to use the mock OTP sender " +
        "in production, which would log plaintext codes.",
    );
  }
  return new MockSmsSender();
}

export const smsSender: SmsSender = createSmsSender();
