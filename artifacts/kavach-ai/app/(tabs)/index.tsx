import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "@/context/AppContext";
import { LIVE_THREATS, SCAM_OF_DAY } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guardianActive, familyMembers, recentChecks } = useAppContext();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  const todayChecks = recentChecks.filter(
    (c) => Date.now() - c.timestamp < 86400000
  );
  const threatsFound = todayChecks.filter((c) => c.result === "danger").length;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topInset + 16 }]}>
        <View style={s.headerLeft}>
          <Feather name="shield" size={22} color={colors.primary} />
          <Text style={[s.headerTitle, { color: colors.text }]}>KavachAI</Text>
        </View>
        <TouchableOpacity
          style={[s.bellBtn, { backgroundColor: colors.card }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push("/call-alert");
          }}
          activeOpacity={0.75}
        >
          <Feather name="bell" size={18} color={colors.text} />
          <View style={[s.badge, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad }}
      >
        {/* Guardian hero card */}
        <View
          style={[
            s.guardianCard,
            {
              backgroundColor: guardianActive ? "#0B2D6E" : colors.card,
              borderColor: guardianActive
                ? "rgba(255,103,19,0.5)"
                : colors.border,
            },
          ]}
        >
          <View style={s.guardianTop}>
            <View
              style={[
                s.shieldCircle,
                {
                  backgroundColor: guardianActive
                    ? colors.primary
                    : colors.muted,
                },
              ]}
            >
              <Feather name="shield" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.statusRow}>
                <View
                  style={[
                    s.dot,
                    {
                      backgroundColor: guardianActive ? "#4ade80" : "#94a3b8",
                    },
                  ]}
                />
                <Text
                  style={[
                    s.statusLabel,
                    {
                      color: guardianActive ? "#4ade80" : colors.mutedForeground,
                    },
                  ]}
                >
                  {guardianActive ? "GUARDIAN ACTIVE" : "GUARDIAN PAUSED"}
                </Text>
              </View>
              <Text style={[s.guardianDesc, { color: "#ffffff" }]}>
                {guardianActive
                  ? "KavachAI is watching out for you"
                  : "Tap Shield to reactivate protection"}
              </Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statNum}>{todayChecks.length}</Text>
              <Text style={s.statLbl}>Checked Today</Text>
            </View>
            <View style={[s.statDiv, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
            <View style={s.stat}>
              <Text style={[s.statNum, threatsFound > 0 ? { color: "#f87171" } : {}]}>
                {threatsFound}
              </Text>
              <Text style={s.statLbl}>Threats Found</Text>
            </View>
            <View style={[s.statDiv, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
            <View style={s.stat}>
              <Text style={[s.statNum, { color: "#4ade80" }]}>
                {familyMembers.length}
              </Text>
              <Text style={s.statLbl}>Protected</Text>
            </View>
          </View>
        </View>

        {/* SOS + Scam of Day */}
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.sosBtn, { backgroundColor: "#dc2626" }]}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            }
            activeOpacity={0.75}
          >
            <Feather name="phone-call" size={22} color="#FFFFFF" />
            <Text style={s.sosLabel}>SOS</Text>
            <Text style={s.sosNum}>1930</Text>
          </TouchableOpacity>

          <View
            style={[
              s.scamCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[s.scamTag, { backgroundColor: colors.primary }]}>
              <Text style={s.scamTagTxt}>{SCAM_OF_DAY.tag}</Text>
            </View>
            <Text
              style={[s.scamTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {SCAM_OF_DAY.titleHindi}
            </Text>
            <Text style={[s.scamReports, { color: colors.mutedForeground }]}>
              {SCAM_OF_DAY.reports.toLocaleString()} reports today
            </Text>
          </View>
        </View>

        {/* Quick Verify */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Verify Before You Act
        </Text>
        <View style={s.quickGrid}>
          {QUICK_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={[
                s.quickItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(tabs)/verify");
              }}
              activeOpacity={0.75}
            >
              <View
                style={[
                  s.quickIcon,
                  { backgroundColor: "rgba(255,103,19,0.12)" },
                ]}
              >
                <Feather name={tool.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={[s.quickLabel, { color: colors.text }]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Family Shield preview */}
        {familyMembers.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
                Family Shield
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/family")}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                s.familyCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {familyMembers.slice(0, 3).map((m, i) => (
                <View
                  key={m.id}
                  style={[
                    s.memberRow,
                    i < Math.min(familyMembers.length, 3) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      s.avatar,
                      {
                        backgroundColor:
                          m.status === "warning"
                            ? "rgba(249,115,22,0.18)"
                            : "rgba(74,222,128,0.12)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.avatarText,
                        {
                          color:
                            m.status === "warning" ? "#f97316" : "#4ade80",
                        },
                      ]}
                    >
                      {m.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.memberName, { color: colors.text }]}>
                      {m.name}
                    </Text>
                    <Text style={[s.memberRel, { color: colors.mutedForeground }]}>
                      {m.relation}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.statusBadge,
                      {
                        backgroundColor:
                          m.status === "warning"
                            ? "rgba(249,115,22,0.15)"
                            : "rgba(74,222,128,0.1)",
                      },
                    ]}
                  >
                    <Feather
                      name={m.status === "warning" ? "alert-triangle" : "shield"}
                      size={11}
                      color={m.status === "warning" ? "#f97316" : "#4ade80"}
                    />
                    <Text
                      style={[
                        s.statusBadgeTxt,
                        {
                          color:
                            m.status === "warning" ? "#f97316" : "#4ade80",
                        },
                      ]}
                    >
                      {m.status === "warning" ? "Alert" : "Safe"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Live threats */}
        <View style={[s.sectionHeader, { marginTop: 4 }]}>
          <Text style={[s.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
            Live Threat Feed
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/threats")}>
            <Text style={[s.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {LIVE_THREATS.slice(0, 3).map((t) => (
          <View
            key={t.id}
            style={[
              s.threatRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                s.threatDot,
                {
                  backgroundColor:
                    t.trend === "critical"
                      ? "#dc2626"
                      : t.trend === "high"
                      ? "#f97316"
                      : "#eab308",
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[s.threatType, { color: colors.text }]}>
                {t.type}
              </Text>
              <Text style={[s.threatMeta, { color: colors.mutedForeground }]}>
                {t.city} · {t.count.toLocaleString()} reports
              </Text>
            </View>
            <Text style={[s.threatTime, { color: colors.mutedForeground }]}>
              {t.time}
            </Text>
          </View>
        ))}

        {/* Demo call alert */}
        <TouchableOpacity
          style={[
            s.demoBtn,
            { backgroundColor: colors.card, borderColor: "rgba(249,115,22,0.3)" },
          ]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push("/call-alert");
          }}
          activeOpacity={0.8}
        >
          <View style={[s.demoBtnIcon, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
            <Feather name="phone-incoming" size={18} color="#f97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.demoBtnTitle, { color: colors.text }]}>
              Demo: Incoming Scam Call
            </Text>
            <Text style={[s.demoBtnSub, { color: colors.mutedForeground }]}>
              See how KavachAI warns you in real-time
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const QUICK_TOOLS = [
  { icon: "phone", label: "Number" },
  { icon: "link", label: "Link" },
  { icon: "credit-card", label: "UPI" },
  { icon: "maximize", label: "QR Code" },
];

const ITEM_W = (width - 32 - 30) / 4;

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700" as const },
  bellBtn: { padding: 10, borderRadius: 12 },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  guardianCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
  },
  guardianTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1 },
  guardianDesc: { fontSize: 14, fontWeight: "500" as const },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 26, fontWeight: "700" as const, color: "#FFFFFF" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 },
  statDiv: { width: 1, marginVertical: 4 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sosBtn: {
    width: 96,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  sosLabel: { fontSize: 10, color: "#FFFFFF", fontWeight: "700" as const, letterSpacing: 2 },
  sosNum: { fontSize: 24, color: "#FFFFFF", fontWeight: "800" as const },
  scamCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    justifyContent: "center",
  },
  scamTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scamTagTxt: { fontSize: 9, color: "#FFFFFF", fontWeight: "700" as const, letterSpacing: 1 },
  scamTitle: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  scamReports: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const, marginTop: 8, marginBottom: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  seeAll: { fontSize: 13, fontWeight: "500" as const },
  quickGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickItem: {
    width: ITEM_W,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    gap: 8,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 11, fontWeight: "500" as const },
  familyCard: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" as const },
  memberName: { fontSize: 15, fontWeight: "600" as const },
  memberRel: { fontSize: 12, marginTop: 1 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeTxt: { fontSize: 11, fontWeight: "600" as const },
  threatRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  threatDot: { width: 10, height: 10, borderRadius: 5 },
  threatType: { fontSize: 14, fontWeight: "600" as const },
  threatMeta: { fontSize: 12, marginTop: 2 },
  threatTime: { fontSize: 11 },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  demoBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  demoBtnTitle: { fontSize: 14, fontWeight: "600" as const },
  demoBtnSub: { fontSize: 12, marginTop: 2 },
});
