import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <View style={s.wrap}>
      <ActivityIndicator color={NAVY} size="large" />
      <Text style={s.muted}>{label ?? t("common.loading")}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={s.wrap}>
      <View style={[s.iconBox, { backgroundColor: "#fee2e2" }]}>
        <Feather name="wifi-off" size={26} color="#dc2626" />
      </View>
      <Text style={s.title}>{t("common.somethingWrong")}</Text>
      <Text style={s.muted}>{message ?? t("common.checkConnection")}</Text>
      {onRetry && (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Feather name="refresh-cw" size={15} color="#fff" />
          <Text style={s.retryTxt}>{t("common.retry")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  message,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  message?: string;
}) {
  return (
    <View style={s.wrap}>
      <View style={[s.iconBox, { backgroundColor: "rgba(255,103,19,0.1)" }]}>
        <Feather name={icon} size={26} color={SAFFRON} />
      </View>
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.muted}>{message}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  iconBox: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700" as const, color: "#0f172a", textAlign: "center" },
  muted: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 19 },
  retryBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: NAVY, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12, marginTop: 4,
  },
  retryTxt: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },
});
