import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Linking } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";
const BLUE = "#5AA9FF";

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const why = t("about.why", { returnObjects: true }) as string[];
  const features = t("about.features", { returnObjects: true }) as {
    title: string;
    body: string;
  }[];

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand header */}
      <View style={s.hero}>
        <View style={s.logoBox}>
          <Feather name="shield" size={30} color={SAFFRON} />
        </View>
        <Text style={s.brand}>
          Netra<Text style={{ color: SAFFRON }}>ksh</Text>
        </Text>
        <View style={s.tricolor}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </View>
        <Text style={s.tagline}>{t("about.tagline")}</Text>
        <Text style={s.taglineEn}>{t("about.taglineEn")}</Text>
      </View>

      <Text style={[s.intro, { color: colors.text }]}>{t("about.intro")}</Text>

      {/* Why */}
      <Text style={s.sectionLabel}>{t("about.whyTitle")}</Text>
      <View style={s.card}>
        {why.map((line, i) => (
          <View key={i} style={[s.bulletRow, i < why.length - 1 && s.rowBorder]}>
            <View style={s.bulletDot}>
              <Feather name="check" size={12} color={GREEN} />
            </View>
            <Text style={s.bulletTxt}>{line}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <Text style={s.sectionLabel}>{t("about.featuresTitle")}</Text>
      <View style={s.card}>
        {features.map((f, i) => (
          <View key={i} style={[s.featRow, i < features.length - 1 && s.rowBorder]}>
            <View style={s.featIcon}>
              <Feather name="zap" size={14} color={NAVY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.featTitle}>{f.title}</Text>
              <Text style={s.featBody}>{f.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Mission */}
      <View style={s.missionCard}>
        <Text style={s.missionLabel}>{t("about.missionTitle")}</Text>
        <Text style={s.missionTxt}>{t("about.mission")}</Text>
      </View>

      {/* Helpline note */}
      <TouchableOpacity
        style={s.helpline}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Linking.openURL("tel:1930").catch(() => {});
        }}
      >
        <Feather name="phone-call" size={16} color="#dc2626" />
        <Text style={s.helplineTxt}>{t("about.helplineNote")}</Text>
      </TouchableOpacity>

      <Text style={s.version}>{t("profile.version")}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: "center", paddingVertical: 18 },
  logoBox: {
    width: 68, height: 68, borderRadius: 20, backgroundColor: NAVY,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  brand: { fontSize: 28, fontWeight: "900", color: NAVY, letterSpacing: -0.5 },
  tricolor: { flexDirection: "row", height: 3, width: 60, marginTop: 10, borderRadius: 2, overflow: "hidden" },
  triStrip: { flex: 1 },
  tagline: { fontSize: 15, fontWeight: "800", color: BLUE, marginTop: 12 },
  taglineEn: { fontSize: 12.5, fontWeight: "600", color: "#64748b", marginTop: 3 },
  intro: { fontSize: 14.5, lineHeight: 22, marginTop: 8, marginBottom: 4 },
  sectionLabel: {
    fontSize: 12, fontWeight: "800", color: "#64748b",
    letterSpacing: 0.8, marginTop: 22, marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 14,
    borderWidth: 1, borderColor: "#eef1f6",
  },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 13, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  bulletDot: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#f0fdf4",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  bulletTxt: { flex: 1, fontSize: 13.5, lineHeight: 20, color: "#334155" },
  featRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 14, gap: 12 },
  featIcon: {
    width: 30, height: 30, borderRadius: 9, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center",
  },
  featTitle: { fontSize: 14.5, fontWeight: "700", color: "#0f172a" },
  featBody: { fontSize: 13, lineHeight: 19, color: "#64748b", marginTop: 3 },
  missionCard: { backgroundColor: NAVY, borderRadius: 16, padding: 18, marginTop: 22 },
  missionLabel: {
    fontSize: 11.5, fontWeight: "800", color: SAFFRON,
    letterSpacing: 0.8, marginBottom: 8,
  },
  missionTxt: { fontSize: 15, lineHeight: 23, fontWeight: "600", color: "#fff" },
  helpline: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16,
    backgroundColor: "#fef2f2", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#fee2e2",
  },
  helplineTxt: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "600", color: "#991b1b" },
  version: { textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24 },
});
