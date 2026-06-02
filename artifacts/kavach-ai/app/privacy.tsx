import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const sections = t("privacy.sections", { returnObjects: true }) as {
    heading: string;
    body: string;
  }[];

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <View style={s.iconBox}>
          <Feather name="lock" size={20} color={NAVY} />
        </View>
        <Text style={[s.title, { color: colors.text }]}>{t("privacy.title")}</Text>
        <Text style={s.updated}>{t("privacy.updated")}</Text>
      </View>

      <Text style={[s.intro, { color: colors.text }]}>{t("privacy.intro")}</Text>

      {sections.map((sec, i) => (
        <View key={i} style={s.section}>
          <Text style={[s.heading, { color: colors.text }]}>{sec.heading}</Text>
          <Text style={s.body}>{sec.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 14 },
  iconBox: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  updated: { fontSize: 12.5, color: "#94a3b8", marginTop: 4, fontWeight: "500" },
  intro: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  section: { marginTop: 20 },
  heading: { fontSize: 15.5, fontWeight: "800", marginBottom: 7 },
  body: { fontSize: 13.5, lineHeight: 21, color: "#475569" },
});
