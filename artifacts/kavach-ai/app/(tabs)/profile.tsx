import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guardianActive, language, toggleGuardian, toggleLanguage } = useAppContext();

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;
  const [notifications, setNotifications] = React.useState(true);

  function callHelpline() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL("tel:1930").catch(() => {});
  }

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
            <View style={[s.userAvatar, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={s.userAvatarTxt}>R</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>Rahul Sharma</Text>
              <Text style={s.headerSub}>+91 98765 43210</Text>
            </View>
          </View>
          <View style={[
            s.guardianBadge,
            { backgroundColor: guardianActive ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.12)" },
          ]}>
            <Feather name="shield" size={13} color={guardianActive ? "#4ade80" : "rgba(255,255,255,0.5)"} />
            <Text style={[s.guardianBadgeTxt, {
              color: guardianActive ? "#4ade80" : "rgba(255,255,255,0.5)",
            }]}>
              {guardianActive ? "Protected" : "Paused"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 16 }}
      >
        {/* SOS card */}
        <TouchableOpacity style={s.sosCard} onPress={callHelpline} activeOpacity={0.85}>
          <View style={s.sosIconBg}>
            <Feather name="phone-call" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sosTitle}>Cyber Crime Helpline</Text>
            <Text style={s.sosDesc}>Call immediately if you've been scammed</Text>
          </View>
          <Text style={s.sosBigNum}>1930</Text>
        </TouchableOpacity>

        {/* Protection section */}
        <Text style={s.sectionLabel}>PROTECTION</Text>
        <View style={s.settingsCard}>
          <SettingRow
            icon="shield"
            iconColor={NAVY}
            iconBg="#EBF0FA"
            label="Guardian Mode"
            sub="Real-time scam call warnings"
            right={
              <Switch
                value={guardianActive}
                onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleGuardian(); }}
                trackColor={{ false: "#e2e8f0", true: NAVY }}
                thumbColor="#FFFFFF"
              />
            }
            isLast={false}
          />
          <SettingRow
            icon="bell"
            iconColor={SAFFRON}
            iconBg="#fff7ed"
            label="Threat Notifications"
            sub="Alerts for new scams in your city"
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setNotifications(v); }}
                trackColor={{ false: "#e2e8f0", true: NAVY }}
                thumbColor="#FFFFFF"
              />
            }
            isLast={true}
          />
        </View>

        {/* Language section */}
        <Text style={s.sectionLabel}>LANGUAGE</Text>
        <View style={s.settingsCard}>
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => { Haptics.selectionAsync(); toggleLanguage(); }}
            activeOpacity={0.75}
          >
            <View style={[s.settingIconBg, { backgroundColor: "#f0fdf4" }]}>
              <Feather name="globe" size={18} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.settingLabel}>Display Language</Text>
              <Text style={s.settingSub}>{language === "hi" ? "हिंदी (Hindi)" : "English"}</Text>
            </View>
            <View style={s.langToggle}>
              <View style={[s.langOption, language === "hi" && { backgroundColor: NAVY }]}>
                <Text style={[s.langTxt, { color: language === "hi" ? "#fff" : "#94a3b8" }]}>हि</Text>
              </View>
              <View style={[s.langOption, language === "en" && { backgroundColor: NAVY }]}>
                <Text style={[s.langTxt, { color: language === "en" ? "#fff" : "#94a3b8" }]}>EN</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick services */}
        <Text style={s.sectionLabel}>QUICK SERVICES</Text>
        <View style={s.servicesGrid}>
          {[
            { icon: "file-text" as const, label: "File Complaint", sublabel: "Cyber crime portal", color: "#7c3aed", bg: "#f5f3ff" },
            { icon: "phone-off" as const, label: "DND Registry", sublabel: "Block telemarketing", color: "#b45309", bg: "#fffbeb" },
            { icon: "flag" as const, label: "Report Spam", sublabel: "Report a number", color: GREEN, bg: "#f0fdf4" },
            { icon: "info" as const, label: "Safety Tips", sublabel: "Stay protected", color: NAVY, bg: "#EBF0FA" },
          ].map((svc, i) => (
            <TouchableOpacity key={i} style={[s.svcCard, { backgroundColor: svc.bg }]} activeOpacity={0.75}>
              <View style={[s.svcIconBox, { shadowColor: svc.color }]}>
                <Feather name={svc.icon} size={18} color={svc.color} />
              </View>
              <Text style={s.svcLabel}>{svc.label}</Text>
              <Text style={s.svcSublabel}>{svc.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About section */}
        <Text style={s.sectionLabel}>ABOUT</Text>
        <View style={s.settingsCard}>
          <SettingRow
            icon="info"
            iconColor={NAVY}
            iconBg="#EBF0FA"
            label="About KavachAI"
            sub="Prevention-first cyber safety for India"
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={false}
          />
          <SettingRow
            icon="file-text"
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
            label="Privacy Policy"
            sub="How we protect your data"
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={false}
          />
          <SettingRow
            icon="star"
            iconColor={SAFFRON}
            iconBg="#fff7ed"
            label="Rate KavachAI"
            sub="Help us protect more Indians"
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={true}
          />
        </View>

        <Text style={s.version}>KavachAI v1.0.0 · Made with ❤️ for India</Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon, iconColor, iconBg, label, sub, right, isLast,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sub: string;
  right: React.ReactNode;
  isLast: boolean;
}) {
  return (
    <View style={[s.settingRow, !isLast && s.settingRowBorder]}>
      <View style={[s.settingIconBg, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.settingLabel}>{label}</Text>
        <Text style={s.settingSub}>{sub}</Text>
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { backgroundColor: NAVY, paddingBottom: 20 },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  headerContent: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14, marginTop: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  userAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  userAvatarTxt: { fontSize: 18, fontWeight: "800" as const, color: "#fff" },
  headerTitle: { fontSize: 17, fontWeight: "800" as const, color: "#fff", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  guardianBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  guardianBadgeTxt: { fontSize: 12, fontWeight: "600" as const },

  sosCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#7f1d1d", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(220,38,38,0.3)",
    padding: 16, marginBottom: 24,
    shadowColor: "#dc2626", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sosIconBg: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#dc2626",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#dc2626", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sosTitle: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
  sosDesc: { fontSize: 12, color: "#fca5a5", marginTop: 2 },
  sosBigNum: { fontSize: 28, fontWeight: "900" as const, color: "#fff" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 1,
    color: "#94a3b8", marginBottom: 10, marginTop: 4,
  },
  settingsCard: {
    backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    marginBottom: 20, overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  settingRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  settingIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 14, fontWeight: "600" as const, color: "#0f172a" },
  settingSub: { fontSize: 12, color: "#64748b", marginTop: 1 },
  langToggle: {
    flexDirection: "row", borderRadius: 10, overflow: "hidden",
    backgroundColor: "#f1f5f9", gap: 2, padding: 2,
  },
  langOption: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  langTxt: { fontSize: 13, fontWeight: "700" as const },

  servicesGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20,
  },
  svcCard: {
    width: "47.5%", borderRadius: 16, padding: 14, gap: 8,
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  svcIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  svcLabel: { fontSize: 12, fontWeight: "700" as const, color: "#1e293b" },
  svcSublabel: { fontSize: 10, color: "#64748b" },

  version: { textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 8, marginBottom: 8 },
});
