import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { registerPushToken } from "@workspace/api-client-react";

/**
 * Foreground presentation: show banners/sounds even while the app is open so
 * broadcast alerts aren't silently swallowed.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function resolveProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined
  );
}

/**
 * Best-effort: ask for notification permission, obtain this device's Expo push
 * token, and register it with the API. Safe to call repeatedly. Never throws —
 * push is a non-critical enhancement, so any failure (Expo Go without an EAS
 * projectId, a simulator, denied permission, offline) is swallowed.
 */
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Alerts",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") return;

    const projectId = resolveProjectId();
    if (!projectId) return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    if (!token) return;

    await registerPushToken({
      token,
      platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web",
    });
  } catch {
    // Non-fatal — the app works without push.
  }
}
