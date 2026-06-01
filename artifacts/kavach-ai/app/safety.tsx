import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SAFETY_TOPIC_META } from "@/constants/strings";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const GREEN = "#138808";
const SAFFRON = "#FF6713";

type SafetyTopicCopy = { id: string; title: string; summary: string; tips: string[] };

export default function SafetyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomPad = (insets.bottom || 0) + 24;

  const topics = t("safety.topics", { returnObjects: true }) as SafetyTopicCopy[];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      >
        <Text style={s.intro}>{t("safety.intro")}</Text>

        {SAFETY_TOPIC_META.map((meta, i) => {
          const topic = topics[i];
          if (!topic) return null;
          return (
            <View key={meta.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.iconBox}>
                  <Feather name={meta.icon} size={20} color={NAVY} />
                </View>
                <Text style={s.cardTitle}>{topic.title}</Text>
              </View>
              <Text style={s.cardSummary}>{topic.summary}</Text>
              <Text style={s.tipsHeading}>{t("safety.tipsHeading")}</Text>
              {topic.tips.map((tip, ti) => (
                <View key={ti} style={s.tipRow}>
                  <Feather name="check-circle" size={14} color={GREEN} style={{ marginTop: 2 }} />
                  <Text style={s.tipTxt}>{tip}</Text>
                </View>
              ))}
            </View>
          );
        })}

        <TouchableOpacity
          style={s.helplineCta}
          onPress={() => router.push("/helpline")}
          activeOpacity={0.85}
        >
          <Feather name="phone-call" size={18} color={SAFFRON} />
          <Text style={s.helplineCtaTxt}>{t("services.helpline")}</Text>
          <Feather name="arrow-right" size={16} color={SAFFRON} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  intro: { fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  cardSummary: { fontSize: 13, color: "#475569", lineHeight: 19 },
  tipsHeading: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 1, color: "#94a3b8",
    marginTop: 14, marginBottom: 8,
  },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  tipTxt: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 19 },
  helplineCta: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: NAVY, borderRadius: 16, padding: 16, marginTop: 8,
  },
  helplineCtaTxt: { flex: 1, fontSize: 15, fontWeight: "700" as const, color: "#fff" },
});
