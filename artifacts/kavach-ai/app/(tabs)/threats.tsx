import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CITY_HOTSPOTS,
  GOLDEN_RULES,
  LIVE_THREATS,
  SCAM_OF_DAY,
} from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

const TREND_COLOR = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
};
const TREND_BG = {
  critical: "#fee2e2",
  high: "#fff7ed",
  medium: "#fefce8",
};

const SEVERITY_COLOR = {
  critical: "#dc2626",
  important: SAFFRON,
  tip: NAVY,
};
const SEVERITY_BG = {
  critical: "#fee2e2",
  important: "#fff7ed",
  tip: "#EBF0FA",
};

export default function ThreatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Navy header */}
      <View style={[s.headerBg, { paddingTop: topInset }]}>
        <View style={s.tricolor}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </View>
        <View style={s.headerContent}>
          <View style={s.headerLeft}>
            <View style={s.threatIconBox}>
              <Feather name="alert-triangle" size={20} color={SAFFRON} />
            </View>
            <View>
              <Text style={s.headerTitle}>{t("threats.headerTitle")}</Text>
              <Text style={s.headerSub}>{t("threats.headerSub")}</Text>
            </View>
          </View>
          <View style={s.liveBadge}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>{t("threats.live")}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Scam of the Day — featured */}
        <View style={s.featuredCard}>
          <View style={s.featuredInner}>
            <View style={s.featTop}>
              <View style={[s.featTagPill, { backgroundColor: "#fee2e2" }]}>
                <Text style={[s.featTagTxt, { color: "#dc2626" }]}>{SCAM_OF_DAY.tag}</Text>
              </View>
              <Text style={s.featReports}>{t("threats.reports", { n: SCAM_OF_DAY.reports.toLocaleString() })}</Text>
            </View>
            <Text style={s.featTitleHindi}>{SCAM_OF_DAY.titleHindi}</Text>
            <Text style={s.featTitleEn}>{SCAM_OF_DAY.title}</Text>
            <Text style={s.featDesc}>{SCAM_OF_DAY.description}</Text>
            <View style={s.featTip}>
              <Feather name="shield" size={13} color={GREEN} />
              <Text style={s.featTipTxt}>{SCAM_OF_DAY.tip}</Text>
            </View>
            <View style={s.citiesRow}>
              {SCAM_OF_DAY.cities.map((c) => (
                <View key={c} style={s.cityChip}>
                  <Feather name="map-pin" size={9} color={NAVY} />
                  <Text style={s.cityChipTxt}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Trending threats */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t("threats.activeScamsNow")}</Text>
          <View style={s.liveBadgeSmall}>
            <View style={s.liveDotSmall} />
            <Text style={s.liveTxtSmall}>{t("threats.live")}</Text>
          </View>
        </View>
        {LIVE_THREATS.map((item) => (
          <View key={item.id} style={s.threatCard}>
            <View style={s.threatCardTop}>
              <View style={[s.trendPill, { backgroundColor: TREND_BG[item.trend] }]}>
                <View style={[s.trendDot, { backgroundColor: TREND_COLOR[item.trend] }]} />
                <Text style={[s.trendTxt, { color: TREND_COLOR[item.trend] }]}>{item.trend.toUpperCase()}</Text>
              </View>
              <Text style={s.threatTime}>{item.time}</Text>
            </View>
            <Text style={s.threatType}>{item.type}</Text>
            <View style={s.threatMetaRow}>
              <Feather name="map-pin" size={11} color="#94a3b8" />
              <Text style={s.threatMeta}>{t("threats.communityReports", { city: item.city, n: item.count.toLocaleString() })}</Text>
            </View>
            <Text style={s.threatDesc}>{item.description}</Text>
          </View>
        ))}

        {/* City Hotspots */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <Feather name="map-pin" size={14} color={NAVY} />
            <Text style={[s.sectionTitle, { marginLeft: 6 }]}>{t("threats.cityHotspots")}</Text>
          </View>
        </View>
        <View style={s.hotspotsCard}>
          {CITY_HOTSPOTS.map((hs, i) => (
            <View
              key={hs.city}
              style={[s.hotspotRow, i < CITY_HOTSPOTS.length - 1 && s.hotspotBorder]}
            >
              <View style={s.hsRankBox}>
                <Text style={s.hsRank}>{hs.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hsCity}>{hs.city}</Text>
                <Text style={s.hsCases}>{t("threats.cases", { n: hs.cases.toLocaleString() })}</Text>
              </View>
              <View style={s.hsChangePill}>
                <Feather name={hs.up ? "trending-up" : "trending-down"} size={11} color={hs.up ? "#dc2626" : GREEN} />
                <Text style={[s.hsChange, { color: hs.up ? "#dc2626" : GREEN }]}>{hs.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Golden Safety Rules */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <Feather name="book-open" size={14} color={NAVY} />
            <Text style={[s.sectionTitle, { marginLeft: 6 }]}>{t("threats.goldenRules")}</Text>
          </View>
        </View>
        {GOLDEN_RULES.map((rule) => (
          <View key={rule.id} style={[s.ruleCard, { borderLeftColor: SEVERITY_COLOR[rule.severity] }]}>
            <View style={[s.ruleIcon, { backgroundColor: SEVERITY_BG[rule.severity] }]}>
              <Feather name={rule.icon as any} size={16} color={SEVERITY_COLOR[rule.severity]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.ruleHindi}>{rule.hindi}</Text>
              <Text style={s.ruleEnglish}>{rule.english}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { backgroundColor: NAVY, paddingBottom: 18 },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  headerContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14, marginTop: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  threatIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: "#fff", letterSpacing: -0.3 },
  headerSub: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(220,38,38,0.2)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#f87171" },
  liveTxt: { fontSize: 11, fontWeight: "700" as const, color: "#fca5a5", letterSpacing: 1 },

  // Featured scam card
  featuredCard: {
    margin: 16,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  featuredInner: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(220,38,38,0.2)",
    gap: 10,
  },
  featTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  featTagPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  featTagTxt: { fontSize: 9, fontWeight: "800" as const, letterSpacing: 1 },
  featReports: { fontSize: 11, color: "#94a3b8" },
  featTitleHindi: { fontSize: 20, fontWeight: "800" as const, color: "#0f172a", lineHeight: 26 },
  featTitleEn: { fontSize: 13, fontWeight: "500" as const, color: "#64748b" },
  featDesc: { fontSize: 13, color: "#334155", lineHeight: 20 },
  featTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#f0fdf4", padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  featTipTxt: { flex: 1, fontSize: 12, fontWeight: "500" as const, color: "#166534", lineHeight: 17 },
  citiesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  cityChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#EBF0FA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  cityChipTxt: { fontSize: 11, color: NAVY, fontWeight: "500" as const },

  // Section headers
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginTop: 8, marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "800" as const, color: "#0f172a" },
  liveBadgeSmall: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fee2e2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#dc2626" },
  liveTxtSmall: { fontSize: 9, fontWeight: "700" as const, color: "#dc2626", letterSpacing: 1 },

  // Threat cards
  threatCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.07)",
    padding: 14, gap: 6,
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  threatCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  trendTxt: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 0.5 },
  threatTime: { fontSize: 11, color: "#94a3b8" },
  threatType: { fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  threatMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  threatMeta: { fontSize: 12, color: "#94a3b8" },
  threatDesc: { fontSize: 12, color: "#64748b", lineHeight: 18 },

  // Hotspots
  hotspotsCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.07)",
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  hotspotRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  hotspotBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  hsRankBox: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: "#EBF0FA", alignItems: "center", justifyContent: "center",
  },
  hsRank: { fontSize: 11, fontWeight: "800" as const, color: NAVY },
  hsCity: { fontSize: 13, fontWeight: "700" as const, color: "#1e293b" },
  hsCases: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  hsChangePill: { flexDirection: "row", alignItems: "center", gap: 3 },
  hsChange: { fontSize: 12, fontWeight: "700" as const },

  // Golden rules
  ruleCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.07)",
    borderLeftWidth: 3,
    padding: 14,
    shadowColor: NAVY, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  ruleIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  ruleHindi: { fontSize: 14, fontWeight: "700" as const, color: "#0f172a", marginBottom: 3 },
  ruleEnglish: { fontSize: 12, color: "#64748b", lineHeight: 17 },
});
