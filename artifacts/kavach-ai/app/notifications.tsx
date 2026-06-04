import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTimeAgo } from "@/lib/format";

const SAFFRON = "#FF6713";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { notifications, isLoading, isError, refetch, markAllRead } =
    useNotifications();

  // Mark everything as read once the feed has loaded and the user is viewing it.
  useEffect(() => {
    if (!isLoading && !isError) {
      void markAllRead();
    }
  }, [isLoading, isError, notifications.length, markAllRead]);

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={SAFFRON} />
        </View>
      ) : isError ? (
        <View style={s.center}>
          <View style={[s.iconBox, { backgroundColor: "rgba(220,38,38,0.1)" }]}>
            <Feather name="wifi-off" size={28} color={colors.danger} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.text }]}>
            {t("notifications.errorTitle")}
          </Text>
          <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
            {t("notifications.errorSub")}
          </Text>
          <Text
            onPress={() => refetch()}
            style={[s.retry, { color: SAFFRON }]}
          >
            {t("common.retry")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <View
                style={[s.iconBox, { backgroundColor: "rgba(255,103,19,0.1)" }]}
              >
                <Feather name="bell" size={28} color={SAFFRON} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>
                {t("notifications.emptyTitle")}
              </Text>
              <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
                {t("notifications.emptySub")}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={s.cardIcon}>
                <Feather name="shield" size={16} color={SAFFRON} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[s.cardBody, { color: colors.mutedForeground }]}>
                  {item.body}
                </Text>
                <Text style={[s.cardTime, { color: colors.mutedForeground }]}>
                  {formatTimeAgo(t, item.createdAt)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 13.5, textAlign: "center", lineHeight: 19 },
  retry: { fontSize: 14, fontWeight: "700", marginTop: 12 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,103,19,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  cardBody: { fontSize: 13.5, lineHeight: 19 },
  cardTime: { fontSize: 11.5, marginTop: 6, fontWeight: "600" },
});
