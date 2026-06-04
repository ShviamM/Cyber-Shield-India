import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  getListNotificationsQueryKey,
  useListNotifications,
} from "@workspace/api-client-react";

import { useAuth } from "@/context/AuthContext";

const READ_AT_KEY = "kv_notif_read_at";

/**
 * Loads the in-app safety broadcast feed and tracks which ones the user has
 * already seen. Read-state is stored locally (the timestamp of the newest
 * broadcast the user has viewed); a broadcast is "unread" when it is newer than
 * that mark. The bell dot on the home header is driven by `hasUnread`.
 */
export function useNotifications() {
  const { status: authStatus } = useAuth();
  const query = useListNotifications({
    query: {
      queryKey: getListNotificationsQueryKey(),
      enabled: authStatus === "authenticated",
    },
  });

  const [readAt, setReadAt] = useState(0);

  // Re-read the stored mark whenever a screen using this hook regains focus, so
  // the bell dot clears after the user returns from the notifications screen.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem(READ_AT_KEY).then((v) => {
        if (active) setReadAt(v ? Number(v) : 0);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const notifications = query.data?.notifications ?? [];
  const latest = notifications.reduce(
    (max, n) => Math.max(max, new Date(n.createdAt).getTime()),
    0,
  );
  const hasUnread = latest > readAt;

  // Persist the newest broadcast's timestamp (not the device clock) as the read
  // mark, so the unread dot stays deterministic even if the device clock is
  // skewed relative to the server that stamps broadcast createdAt.
  const markAllRead = useCallback(async () => {
    if (latest <= readAt) return;
    await AsyncStorage.setItem(READ_AT_KEY, String(latest));
    setReadAt(latest);
  }, [latest, readAt]);

  return { ...query, notifications, hasUnread, markAllRead };
}
