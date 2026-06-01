import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "@/context/AppContext";
import { CITY_HOTSPOTS, GOLDEN_RULES, LIVE_THREATS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const SAFFRON = "#FF6713";
const NAVY = "#0B3D91";
const GREEN = "#138808";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { guardianActive, familyMembers, recentChecks, toggleGuardian } = useAppContext();

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  const SERVICE_LINKS = [
    { icon: "flag" as const, label: t("services.reportFraud"), color: "#dc2626", bg: "#fef2f2", route: "/report" },
    { icon: "grid" as const, label: t("services.scamCategories"), color: "#7c3aed", bg: "#f5f3ff", route: "/categories" },
    { icon: "book-open" as const, label: t("services.safetyTips"), color: "#138808", bg: "#f0fdf4", route: "/safety" },
    { icon: "phone-call" as const, label: t("services.helpline"), color: "#0B3D91", bg: "#EBF0FA", route: "/helpline" },
  ];

  const QUICK_TOOLS = [
    { icon: "phone" as const, label: t("home.quickTools.numberLabel"), sublabel: t("home.quickTools.numberSub"), bg: "#EBF0FA", color: NAVY },
    { icon: "link" as const, label: t("home.quickTools.linkLabel"), sublabel: t("home.quickTools.linkSub"), bg: "#f5f3ff", color: "#7c3aed" },
    { icon: "credit-card" as const, label: t("home.quickTools.upiLabel"), sublabel: t("home.quickTools.upiSub"), bg: "#f0fdf4", color: GREEN },
    { icon: "maximize" as const, label: t("home.quickTools.qrLabel"), sublabel: t("home.quickTools.qrSub"), bg: "#fff7ed", color: SAFFRON },
  ];

  const todayChecks = recentChecks.filter((c) => Date.now() - c.timestamp < 86400000);
  const threatsFound = todayChecks.filter((c) => c.result === "danger").length;

  function callSOS() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL("tel:1930").catch(() => {});
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* ── Navy Header ── */}
      <View style={[s.headerBg, { paddingTop: topInset }]}>
        {/* Tricolor strip */}
        <View style={s.tricolor}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#FFFFFF" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </View>

        {/* Branding row */}
        <View style={s.brandRow}>
          <View style={s.brandLeft}>
            <View style={s.logoBox}>
              <Feather name="shield" size={20} color={SAFFRON} />
            </View>
            <View>
              <Text style={s.logoTitle}>
                Netra<Text style={{ color: SAFFRON }}>ksh</Text>
              </Text>
              <Text style={s.logoSub}>{t("home.logoSub")}</Text>
            </View>
          </View>
          <View style={s.headerIcons}>
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                router.push("/call-alert");
              }}
              style={s.headerIconBtn}
              activeOpacity={0.75}
            >
              <View style={s.bellDot} />
              <Feather name="bell" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/profile"); }}
              activeOpacity={0.75}
            >
              <Feather name="user" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SOS + Stats */}
        <View style={s.sosRow}>
          <TouchableOpacity style={s.sosBtn} onPress={callSOS} activeOpacity={0.85}>
            <Feather name="phone-call" size={20} color="#fff" fill="rgba(255,255,255,0.3)" />
            <Text style={s.sosBigNum}>1930</Text>
            <Text style={s.sosSubLabel}>{t("home.sosHelpline")}</Text>
          </TouchableOpacity>
          <View style={s.statsBox}>
            <TouchableOpacity
              style={[s.guardianToggle, { borderColor: guardianActive ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.15)" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleGuardian(); }}
              activeOpacity={0.8}
            >
              <View style={[s.guardianDot, { backgroundColor: guardianActive ? "#4ade80" : "#94a3b8" }]} />
              <Text style={s.guardianLabel}>
                {guardianActive ? t("home.guardianActive") : t("home.guardianPaused")}
              </Text>
            </TouchableOpacity>
            <View style={s.headerStats}>
              <View style={s.hStat}>
                <Text style={s.hStatNum}>{todayChecks.length}</Text>
                <Text style={s.hStatLbl}>{t("home.statChecked")}</Text>
              </View>
              <View style={s.hStatDiv} />
              <View style={s.hStat}>
                <Text style={[s.hStatNum, threatsFound > 0 && { color: "#fca5a5" }]}>{threatsFound}</Text>
                <Text style={s.hStatLbl}>{t("home.statThreats")}</Text>
              </View>
              <View style={s.hStatDiv} />
              <View style={s.hStat}>
                <Text style={[s.hStatNum, { color: "#86efac" }]}>{familyMembers.length}</Text>
                <Text style={s.hStatLbl}>{t("home.statProtected")}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Verify Before You Act */}
        <View style={[s.section, s.verifyCard]}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconBox, { backgroundColor: "#EBF0FA" }]}>
              <Feather name="search" size={14} color={NAVY} />
            </View>
            <View>
              <Text style={[s.sectionTitle, { color: "#0f172a" }]}>{t("home.verifyTitle")}</Text>
              <Text style={[s.sectionSub, { color: "#64748b" }]}>{t("home.verifySub")}</Text>
            </View>
          </View>
          <View style={s.toolGrid}>
            {QUICK_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.label}
                style={[s.toolBtn, { backgroundColor: tool.bg }]}
                onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/verify"); }}
                activeOpacity={0.75}
              >
                <View style={[s.toolIconBox, { shadowColor: tool.color }]}>
                  <Feather name={tool.icon} size={16} color={tool.color} />
                </View>
                <Text style={s.toolLabel}>{tool.label}</Text>
                <Text style={s.toolSublabel}>{tool.sublabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Learn & Report quick links */}
        <View style={s.serviceRow}>
          {SERVICE_LINKS.map((svc) => (
            <TouchableOpacity
              key={svc.route}
              style={s.serviceChip}
              onPress={() => { Haptics.selectionAsync(); router.push(svc.route as any); }}
              activeOpacity={0.75}
            >
              <View style={[s.serviceIconBox, { backgroundColor: svc.bg }]}>
                <Feather name={svc.icon} size={18} color={svc.color} />
              </View>
              <Text style={s.serviceLabel} numberOfLines={2}>{svc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Scams Today */}
        <View style={s.sectionOuterHeader}>
          <View style={s.liveRow}>
            <View style={s.livePulse} />
            <Text style={s.outerSectionTitle}>{t("home.activeScamsToday")}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/threats")}>
            <Text style={[s.seeAll, { color: NAVY }]}>{t("home.allCount", { n: 23 })}</Text>
          </TouchableOpacity>
        </View>

        {LIVE_THREATS.slice(0, 2).map((item) => {
          const color = item.trend === "critical" ? "#dc2626" : item.trend === "high" ? "#ea580c" : "#d97706";
          const bg = item.trend === "critical" ? "#fff1f1" : item.trend === "high" ? "#fff7ed" : "#fefce8";
          return (
            <View key={item.id} style={[s.scamCard, { borderColor: color + "30" }]}>
              <View style={s.scamCardTop}>
                <View style={[s.scamIconBox, { backgroundColor: bg }]}>
                  <Feather name="phone-off" size={18} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.scamTagRow}>
                    <View style={[s.scamTag, { backgroundColor: bg }]}>
                      <Text style={[s.scamTagTxt, { color }]}>{item.trend.toUpperCase()}</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color="#94a3b8" />
                  </View>
                  <Text style={s.scamType}>{item.type}</Text>
                  <Text style={s.scamDesc} numberOfLines={2}>{item.description}</Text>
                  <View style={s.scamMeta}>
                    <Feather name="alert-triangle" size={10} color={color} />
                    <Text style={[s.scamMetaTxt, { color }]}>
                      {t("threats.reports", { n: item.count.toLocaleString() })} · {item.city}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.scamTip}>
                <Feather name="check-circle" size={13} color={GREEN} />
                <Text style={s.scamTipTxt}>
                  {item.trend === "critical"
                    ? t("home.tipCritical")
                    : t("home.tipDefault")}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Family Shield preview */}
        {familyMembers.length > 0 && (
          <>
            <View style={s.sectionOuterHeader}>
              <Text style={s.outerSectionTitle}>{t("home.familyShield")}</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/family")}>
                <Text style={[s.seeAll, { color: NAVY }]}>{t("home.seeAll")}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.familyCard}>
              {familyMembers.slice(0, 3).map((m, i) => (
                <View
                  key={m.id}
                  style={[
                    s.memberRow,
                    i < Math.min(familyMembers.length, 3) - 1 && s.memberRowBorder,
                  ]}
                >
                  <View style={[s.memberAvatar, {
                    backgroundColor: m.status === "warning" ? "rgba(249,115,22,0.15)" : "rgba(19,136,8,0.1)",
                  }]}>
                    <Text style={[s.memberAvatarTxt, {
                      color: m.status === "warning" ? "#ea580c" : GREEN,
                    }]}>{m.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.memberName}>{m.name}</Text>
                    <Text style={s.memberRel}>
                      {t(`family.relations.${m.relation.toLowerCase()}`, { defaultValue: m.relation })}
                    </Text>
                  </View>
                  <View style={[s.memberBadge, {
                    backgroundColor: m.status === "warning" ? "rgba(249,115,22,0.12)" : "rgba(19,136,8,0.08)",
                  }]}>
                    <Feather
                      name={m.status === "warning" ? "alert-triangle" : "shield"}
                      size={11}
                      color={m.status === "warning" ? "#ea580c" : GREEN}
                    />
                    <Text style={[s.memberBadgeTxt, {
                      color: m.status === "warning" ? "#ea580c" : GREEN,
                    }]}>
                      {m.status === "warning" ? t("family.statusShortAlert") : t("family.statusShortSafe")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Golden Rules */}
        <View style={s.sectionOuterHeader}>
          <View style={s.rowCenter}>
            <Feather name="book-open" size={14} color={NAVY} />
            <Text style={[s.outerSectionTitle, { marginLeft: 6 }]}>{t("home.goldenRules")}</Text>
          </View>
        </View>
        <View style={s.rulesCard}>
          {GOLDEN_RULES.slice(0, 4).map((r, i) => {
            const c = r.severity === "critical" ? "#dc2626" : r.severity === "important" ? SAFFRON : GREEN;
            const bg = r.severity === "critical" ? "#fee2e2" : r.severity === "important" ? "#fff7ed" : "#f0fdf4";
            return (
              <View key={r.id} style={[s.ruleRow, i < 3 && s.ruleRowBorder]}>
                <View style={[s.ruleIcon, { backgroundColor: bg }]}>
                  <Feather name={r.icon as any} size={14} color={c} />
                </View>
                <Text style={s.ruleTxt} numberOfLines={2}>{r.english}</Text>
                <View style={[s.ruleDot, { backgroundColor: c }]} />
              </View>
            );
          })}
        </View>

        {/* City Hotspots */}
        <View style={s.sectionOuterHeader}>
          <View style={s.rowCenter}>
            <Feather name="map-pin" size={14} color={NAVY} />
            <Text style={[s.outerSectionTitle, { marginLeft: 6 }]}>{t("home.hotspots")}</Text>
          </View>
        </View>
        <View style={s.hotspotsCard}>
          {CITY_HOTSPOTS.slice(0, 4).map((hs, i) => (
            <View key={hs.city} style={[s.hotspotRow, i < 3 && s.hotspotRowBorder]}>
              <View style={s.hotspotRank}>
                <Text style={s.hotspotRankTxt}>{hs.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hotspotCity}>{hs.city}</Text>
                <Text style={s.hotspotCases}>{t("home.casesReported", { n: hs.cases.toLocaleString() })}</Text>
              </View>
              <View style={s.hotspotBadge}>
                <Text style={s.hotspotBadgeTxt}>{hs.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Protect Your Circle CTA */}
        <TouchableOpacity
          style={s.ctaCard}
          onPress={() => router.push("/(tabs)/family")}
          activeOpacity={0.85}
        >
          <View style={s.ctaGlow} />
          <View style={s.ctaIconBox}>
            <Feather name="users" size={22} color={SAFFRON} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>{t("home.protectCircleTitle")}</Text>
            <Text style={s.ctaSub}>{t("home.protectCircleSub")}</Text>
          </View>
          <Feather name="arrow-right" size={18} color={SAFFRON} />
        </TouchableOpacity>

        {/* Demo call alert */}
        <TouchableOpacity
          style={s.demoBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push("/call-alert");
          }}
          activeOpacity={0.8}
        >
          <View style={s.demoBtnIcon}>
            <Feather name="phone-incoming" size={18} color={SAFFRON} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.demoBtnTitle}>{t("home.demoTitle")}</Text>
            <Text style={s.demoBtnSub}>{t("home.demoSub")}</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  headerBg: {
    backgroundColor: NAVY,
    paddingBottom: 16,
    paddingHorizontal: 0,
  },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 6,
  },
  brandLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  logoTitle: { fontSize: 18, fontWeight: "900" as const, color: "#fff", letterSpacing: -0.4 },
  logoSub: { fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 1, marginTop: 1 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIconBtn: { position: "relative" },
  bellDot: {
    position: "absolute", top: -3, right: -3,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#fbbf24", borderWidth: 2, borderColor: NAVY, zIndex: 1,
  },
  sosRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 16 },
  sosBtn: {
    width: 80, borderRadius: 14,
    backgroundColor: "#dc2626",
    alignItems: "center", justifyContent: "center",
    paddingVertical: 12, gap: 2,
    shadowColor: "#dc2626", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sosBigNum: { fontSize: 20, fontWeight: "900" as const, color: "#fff" },
  sosSubLabel: { fontSize: 8, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  statsBox: { flex: 1, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, gap: 8 },
  guardianToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: "flex-start",
  },
  guardianDot: { width: 7, height: 7, borderRadius: 4 },
  guardianLabel: { fontSize: 11, fontWeight: "700" as const, color: "#fff" },
  headerStats: { flexDirection: "row", alignItems: "center" },
  hStat: { flex: 1, alignItems: "center" },
  hStatNum: { fontSize: 18, fontWeight: "800" as const, color: "#fff" },
  hStatLbl: { fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  hStatDiv: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.15)" },

  // Section wrappers
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionOuterHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 20, marginBottom: 10,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionIconBox: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "800" as const },
  sectionSub: { fontSize: 10, marginTop: 1 },
  outerSectionTitle: { fontSize: 13, fontWeight: "800" as const, color: "#0f172a" },
  seeAll: { fontSize: 11, fontWeight: "600" as const },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  livePulse: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: "#dc2626",
    shadowColor: "#dc2626", shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },

  // Verify card
  verifyCard: {
    backgroundColor: "#fff",
    borderRadius: 18, padding: 16,
    shadowColor: NAVY, shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 2 },
    elevation: 2, borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
  },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toolBtn: {
    width: "48.5%",
    borderRadius: 12, padding: 12, gap: 6,
  },
  toolIconBox: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toolLabel: { fontSize: 11, fontWeight: "700" as const, color: "#1e293b" },
  toolSublabel: { fontSize: 9, color: "#64748b" },

  // Service quick links
  serviceRow: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 12 },
  serviceChip: { flex: 1, alignItems: "center", gap: 6 },
  serviceIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  serviceLabel: { fontSize: 10, fontWeight: "600" as const, color: "#475569", textAlign: "center", lineHeight: 13 },

  // Scam cards
  scamCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1.5, padding: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scamCardTop: { flexDirection: "row", gap: 12 },
  scamIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  scamTagRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scamTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  scamTagTxt: { fontSize: 9, fontWeight: "800" as const, letterSpacing: 0.8 },
  scamType: { fontSize: 13, fontWeight: "700" as const, color: "#0f172a", marginTop: 4, lineHeight: 18 },
  scamDesc: { fontSize: 11, color: "#64748b", lineHeight: 16, marginTop: 2 },
  scamMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  scamMetaTxt: { fontSize: 10, fontWeight: "600" as const },
  scamTip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 10, padding: 8, backgroundColor: "#f0fdf4",
    borderRadius: 10, borderWidth: 1, borderColor: "#bbf7d0",
  },
  scamTipTxt: { fontSize: 10, color: "#166534", fontWeight: "600" as const, flex: 1, lineHeight: 14 },

  // Family card
  familyCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  memberRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  memberAvatarTxt: { fontSize: 16, fontWeight: "700" as const },
  memberName: { fontSize: 14, fontWeight: "600" as const, color: "#0f172a" },
  memberRel: { fontSize: 11, color: "#64748b", marginTop: 1 },
  memberBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  memberBadgeTxt: { fontSize: 11, fontWeight: "600" as const },

  // Rules card
  rulesCard: {
    marginHorizontal: 16, backgroundColor: "#fff",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  ruleRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  ruleRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  ruleIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ruleTxt: { flex: 1, fontSize: 11, color: "#334155", lineHeight: 15 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },

  // Hotspots card
  hotspotsCard: {
    marginHorizontal: 16, backgroundColor: "#fff",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  hotspotRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  hotspotRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  hotspotRank: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: "#EBF0FA", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  hotspotRankTxt: { fontSize: 11, fontWeight: "800" as const, color: NAVY },
  hotspotCity: { fontSize: 12, fontWeight: "700" as const, color: "#1e293b" },
  hotspotCases: { fontSize: 10, color: "#94a3b8", marginTop: 1 },
  hotspotBadge: { backgroundColor: "#fee2e2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  hotspotBadgeTxt: { fontSize: 10, fontWeight: "800" as const, color: "#dc2626" },

  // CTA card
  ctaCard: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: NAVY, borderRadius: 18, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
    overflow: "hidden", position: "relative",
    shadowColor: NAVY, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaGlow: {
    position: "absolute", right: -20, top: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,103,19,0.15)",
  },
  ctaIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  ctaTitle: { fontSize: 13, fontWeight: "800" as const, color: "#fff" },
  ctaSub: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 3, lineHeight: 14 },

  // Demo btn
  demoBtn: {
    marginHorizontal: 16, marginTop: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(255,103,19,0.2)",
    padding: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  demoBtnIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,103,19,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  demoBtnTitle: { fontSize: 13, fontWeight: "600" as const, color: "#0f172a" },
  demoBtnSub: { fontSize: 11, color: "#64748b", marginTop: 2 },
});
