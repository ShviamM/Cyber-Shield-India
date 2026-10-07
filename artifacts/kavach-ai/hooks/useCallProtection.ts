import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { getScreeningStatus, isScreeningSupported, type ScreeningStatus } from "@/lib/screening";

export type CallProtectionGap = "role" | "enabled" | "notifications" | "display";

/**
 * Whether incoming-call protection can actually work on this phone, read from
 * the native screener (Android only). The call card only appears when:
 * - Netraksh holds the call-screening role (Android only then passes calls on),
 * - call protection is switched on in the app,
 * - notifications are allowed, and
 * - Netraksh may show the card (display over other apps, or full-screen alerts).
 * Re-read whenever the screen gains focus or the app returns to the foreground,
 * because these are granted in system settings outside the app.
 */
export function useCallProtection() {
  const supported = isScreeningSupported();
  const [status, setStatus] = useState<ScreeningStatus | null>(() =>
    supported ? getScreeningStatus() : null,
  );

  const refresh = useCallback(() => {
    if (supported) setStatus(getScreeningStatus());
  }, [supported]);

  useFocusEffect(refresh);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const gaps: CallProtectionGap[] = [];
  if (status) {
    if (!status.hasCallRole) gaps.push("role");
    if (!status.callScreening) gaps.push("enabled");
    if (!status.hasNotificationPermission) gaps.push("notifications");
    if (!status.hasOverlayPermission && !status.hasFullScreenIntentPermission) gaps.push("display");
  }

  return { supported, status, ready: supported && status !== null && gaps.length === 0, gaps, refresh };
}
