import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CYBERCRIME_PORTAL_URL,
  HELPLINE_NUMBER,
  HELPLINE_STEPS,
  STRINGS,
} from "@/constants/strings";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";

export default function HelplineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = (insets.bottom || 0) + 24;

  function call1930() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${HELPLINE_NUMBER}`).catch(() => {});
  }

  function openPortal() {
    Linking.openURL(CYBERCRIME_PORTAL_URL).catch(() => {});
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      >
        {/* SOS card */}
        <TouchableOpacity style={s.sosCard} onPress={call1930} activeOpacity={0.85}>
          <View style={s.sosIconBg}>
            <Feather name="phone-call" size={26} color="#fff" />
          </View>
          <Text style={s.sosTitle}>{STRINGS.helpline.sosTitle}</Text>
          <Text style={s.sosSub}>{STRINGS.helpline.sosSub}</Text>
          <View style={s.callBtn}>
            <Feather name="phone" size={16} color="#fff" />
            <Text style={s.callBtnTxt}>{STRINGS.helpline.callNow}</Text>
          </View>
        </TouchableOpacity>

        {/* Portal */}
        <TouchableOpacity style={s.portalCard} onPress={openPortal} activeOpacity={0.85}>
          <View style={s.portalIcon}>
            <Feather name="globe" size={20} color={NAVY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.portalTitle}>{STRINGS.helpline.portalTitle}</Text>
            <Text style={s.portalSub}>{STRINGS.helpline.portalSub}</Text>
          </View>
          <Feather name="external-link" size={18} color={NAVY} />
        </TouchableOpacity>

        {/* Steps */}
        <Text style={s.sectionLabel}>{STRINGS.helpline.stepsTitle}</Text>
        <View style={s.stepsCard}>
          {HELPLINE_STEPS.map((step, i) => (
            <View key={i} style={[s.stepRow, i < HELPLINE_STEPS.length - 1 && s.stepRowBorder]}>
              <View style={s.stepNum}>
                <Text style={s.stepNumTxt}>{i + 1}</Text>
              </View>
              <Text style={s.stepTxt}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Report a number CTA */}
        <TouchableOpacity
          style={s.reportCta}
          onPress={() => router.push("/report")}
          activeOpacity={0.85}
        >
          <Feather name="flag" size={18} color={SAFFRON} />
          <Text style={s.reportCtaTxt}>{STRINGS.services.reportFraud}</Text>
          <Feather name="arrow-right" size={16} color={SAFFRON} />
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <View style={s.disclaimerTop}>
            <Feather name="shield" size={15} color={NAVY} />
            <Text style={s.disclaimerTitle}>{STRINGS.helpline.disclaimerTitle}</Text>
          </View>
          <Text style={s.disclaimerTxt}>{STRINGS.helpline.disclaimer}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  sosCard: {
    backgroundColor: "#7f1d1d", borderRadius: 20, padding: 22, alignItems: "center",
    marginBottom: 14,
    shadowColor: "#dc2626", shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sosIconBg: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#dc2626",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  sosTitle: { fontSize: 18, fontWeight: "800" as const, color: "#fff", textAlign: "center" },
  sosSub: { fontSize: 13, color: "#fca5a5", textAlign: "center", marginTop: 6, lineHeight: 18 },
  callBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#dc2626",
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginTop: 16,
  },
  callBtnTxt: { fontSize: 16, fontWeight: "800" as const, color: "#fff" },
  portalCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
  },
  portalIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center",
  },
  portalTitle: { fontSize: 14, fontWeight: "700" as const, color: "#0f172a" },
  portalSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 1, color: "#94a3b8", marginBottom: 10,
  },
  stepsCard: {
    backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: NAVY,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepNumTxt: { fontSize: 13, fontWeight: "800" as const, color: "#fff" },
  stepTxt: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 19, paddingTop: 3 },
  reportCta: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff7ed", borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,103,19,0.25)",
  },
  reportCtaTxt: { flex: 1, fontSize: 14, fontWeight: "700" as const, color: "#9a3412" },
  disclaimer: {
    backgroundColor: "#EBF0FA", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.12)",
  },
  disclaimerTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  disclaimerTitle: { fontSize: 13, fontWeight: "700" as const, color: NAVY },
  disclaimerTxt: { fontSize: 12, color: "#334155", lineHeight: 18 },
});
