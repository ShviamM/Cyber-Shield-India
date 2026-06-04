import { logger } from "./logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface SendResult {
  /** Number of messages Expo accepted for delivery. */
  successCount: number;
  /** Tokens Expo reported as no longer registered; safe to delete. */
  invalidTokens: string[];
}

interface ExpoTicket {
  status: "ok" | "error";
  details?: { error?: string };
}

/**
 * Send a push notification to many Expo tokens via the Expo Push API. No
 * FCM/APNs credentials are required — Expo handles delivery. Tokens Expo flags
 * as `DeviceNotRegistered` are returned so the caller can prune them.
 */
export async function sendExpoPush(
  tokens: string[],
  title: string,
  body: string,
): Promise<SendResult> {
  const valid = tokens.filter((t) => t.startsWith("ExponentPushToken"));
  let successCount = 0;
  const invalidTokens: string[] = [];

  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    const messages = chunk.map((to) => ({
      to,
      title,
      body,
      sound: "default" as const,
    }));
    try {
      const resp = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(messages),
      });
      if (!resp.ok) {
        logger.error({ status: resp.status }, "Expo push request failed");
        continue;
      }
      const json = (await resp.json()) as { data?: ExpoTicket[] };
      const data = json.data ?? [];
      data.forEach((ticket, idx) => {
        if (ticket.status === "ok") {
          successCount += 1;
        } else if (ticket.details?.error === "DeviceNotRegistered") {
          invalidTokens.push(chunk[idx]);
        }
      });
    } catch (err) {
      logger.error({ err }, "Expo push request threw");
    }
  }

  return { successCount, invalidTokens };
}
