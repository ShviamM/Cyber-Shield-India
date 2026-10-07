import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken, unregisterPushToken } from "@workspace/api-client-react";

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
const PUSH_TOKEN_KEY = "kv_push_token";

/**
 * Detach this phone from the signed-in account on the server, so it stops
 * receiving that account's alerts after sign-out. Best effort: call it while
 * the session token is still valid.
 */
export async function unregisterThisDevice(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!token) return;
    await unregisterPushToken({ token });
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  } catch {
    // Non-fatal.
  }
}

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
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  } catch {
    // Non-fatal — the app works without push.
  }
}

/**
 * Call [onOpen] when the user taps a Family Guardian alert notification,
 * including the tap that cold-started the app. Returns an unsubscribe function.
 */
export function onFamilyAlertOpened(onOpen: () => void): () => void {
  if (Platform.OS === "web") return () => {};
  const isFamilyAlert = (r: Notifications.NotificationResponse | null) =>
    r?.notification.request.content.data?.type === "family_alert";
  Notifications.getLastNotificationResponseAsync()
    .then((r) => {
      if (isFamilyAlert(r)) onOpen();
    })
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    if (isFamilyAlert(r)) onOpen();
  });
  return () => sub.remove();
}
