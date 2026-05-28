import { Feather } from "@expo/vector-icons";
import React from "react";
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

const TREND_COLOR = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
};

const SEVERITY_COLOR = {
  critical: "#dc2626",
  important: "#f97316",
  tip: "#3b82f6",
};

export default function ThreatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topInset + 16 }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Threat Feed</Text>
        <View style={[s.liveBadge, { backgroundColor: "rgba(220,38,38,0.15)" }]}>
          <View style={s.liveDot} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad }}
      >
        {/* Scam of the Day */}
        <View
          style={[
            s.featuredCard,
            { backgroundColor: "#0B2D6E", borderColor: "rgba(255,103,19,0.4)" },
          ]}
        >
          <View style={s.featuredTag}>
            <View style={[s.featTagBg, { backgroundColor: colors.primary }]}>
              <Text style={s.featTagTxt}>{SCAM_OF_DAY.tag}</Text>
            </View>
            <Text style={[s.featReports, { color: "rgba(255,255,255,0.6)" }]}>
              {SCAM_OF_DAY.reports.toLocaleString()} reports
            </Text>
          </View>
          <Text style={[s.featTitle, { color: "#FFFFFF" }]}>
            {SCAM_OF_DAY.titleHindi}
          </Text>
          <Text style={[s.featTitleEn, { color: "rgba(255,255,255,0.7)" }]}>
            {SCAM_OF_DAY.title}
          </Text>
          <Text style={[s.featDesc, { color: "rgba(255,255,255,0.8)" }]}>
            {SCAM_OF_DAY.description}
          </Text>
          <View
            style={[
              s.featTip,
              { backgroundColor: "rgba(255,103,19,0.12)", borderColor: "rgba(255,103,19,0.3)" },
            ]}
          >
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={[s.featTipTxt, { color: colors.primary }]}>
              {SCAM_OF_DAY.tip}
            </Text>
          </View>
          <View style={s.citiesRow}>
            {SCAM_OF_DAY.cities.map((c) => (
              <View
                key={c}
                style={[s.cityChip, { backgroundColor: "rgba(255,255,255,0.08)" }]}
              >
                <Text style={[s.cityChipTxt, { color: "rgba(255,255,255,0.7)" }]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* All live threats */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Active Scams Right Now
        </Text>
        {LIVE_THREATS.map((t) => (
          <View
            key={t.id}
            style={[
              s.threatCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={s.threatCardTop}>
              <View
                style={[
                  s.trendBadge,
                  { backgroundColor: TREND_COLOR[t.trend] + "20" },
                ]}
              >
                <View
                  style={[
                    s.trendDot,
                    { backgroundColor: TREND_COLOR[t.trend] },
                  ]}
                />
                <Text
                  style={[
                    s.trendTxt,
                    { color: TREND_COLOR[t.trend] },
                  ]}
                >
                  {t.trend.toUpperCase()}
                </Text>
              </View>
              <Text style={[s.threatTime, { color: colors.mutedForeground }]}>
                {t.time}
              </Text>
            </View>
            <Text style={[s.threatType, { color: colors.text }]}>{t.type}</Text>
            <Text style={[s.threatCity, { color: colors.mutedForeground }]}>
              <Feather name="map-pin" size={11} /> {t.city} ·{" "}
              {t.count.toLocaleString()} community reports
            </Text>
            <Text style={[s.threatDesc, { color: colors.mutedForeground }]}>
              {t.description}
            </Text>
          </View>
        ))}

        {/* City Hotspots */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          City Hotspots
        </Text>
        <View
          style={[
            s.hotspotsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {CITY_HOTSPOTS.map((hs, i) => (
            <View
              key={hs.city}
              style={[
                s.hotspotRow,
                i < CITY_HOTSPOTS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[s.hsRank, { color: colors.mutedForeground }]}>
                #{hs.rank}
              </Text>
              <Text style={[s.hsCity, { color: colors.text }]}>{hs.city}</Text>
              <Text style={[s.hsCases, { color: colors.mutedForeground }]}>
                {hs.cases.toLocaleString()}
              </Text>
              <View style={s.hsChange}>
                <Feather
                  name={hs.up ? "trending-up" : "trending-down"}
                  size={13}
                  color={hs.up ? "#dc2626" : "#22c55e"}
                />
                <Text
                  style={[
                    s.hsChangeTxt,
                    { color: hs.up ? "#dc2626" : "#22c55e" },
                  ]}
                >
                  {hs.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Golden Safety Rules */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Golden Safety Rules
        </Text>
        {GOLDEN_RULES.map((rule) => (
          <View
            key={rule.id}
            style={[
              s.ruleCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: SEVERITY_COLOR[rule.severity],
              },
            ]}
          >
            <View
              style={[
                s.ruleIcon,
                {
                  backgroundColor:
                    SEVERITY_COLOR[rule.severity] + "18",
                },
              ]}
            >
              <Feather
                name={rule.icon as any}
                size={18}
                color={SEVERITY_COLOR[rule.severity]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.ruleHindi, { color: colors.text }]}>
                {rule.hindi}
              </Text>
              <Text style={[s.ruleEnglish, { color: colors.mutedForeground }]}>
                {rule.english}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#dc2626" },
  liveTxt: { fontSize: 11, fontWeight: "700" as const, color: "#dc2626", letterSpacing: 1 },
  featuredCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 24,
    gap: 10,
  },
  featuredTag: { flexDirection: "row", alignItems: "center", gap: 10 },
  featTagBg: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  featTagTxt: { fontSize: 9, color: "#FFFFFF", fontWeight: "700" as const, letterSpacing: 1 },
  featReports: { fontSize: 12 },
  featTitle: { fontSize: 20, fontWeight: "700" as const },
  featTitleEn: { fontSize: 14, fontWeight: "500" as const },
  featDesc: { fontSize: 13, lineHeight: 20 },
  featTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  featTipTxt: { flex: 1, fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  citiesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  cityChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  cityChipTxt: { fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 12,
    marginTop: 4,
  },
  threatCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 6,
  },
  threatCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  trendTxt: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 0.5 },
  threatTime: { fontSize: 11 },
  threatType: { fontSize: 16, fontWeight: "700" as const },
  threatCity: { fontSize: 12 },
  threatDesc: { fontSize: 13, lineHeight: 19 },
  hotspotsCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  hotspotRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  hsRank: { width: 28, fontSize: 13, fontWeight: "600" as const },
  hsCity: { flex: 1, fontSize: 15, fontWeight: "600" as const },
  hsCases: { fontSize: 13 },
  hsChange: { flexDirection: "row", alignItems: "center", gap: 3, width: 56 },
  hsChangeTxt: { fontSize: 13, fontWeight: "600" as const },
  ruleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
    marginBottom: 10,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleHindi: { fontSize: 15, fontWeight: "700" as const, marginBottom: 3 },
  ruleEnglish: { fontSize: 13, lineHeight: 18 },
});
