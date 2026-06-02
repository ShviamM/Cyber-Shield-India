import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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

import { BookPromo } from "@/components/BookPromo";
import { LANGUAGES } from "@/i18n/languages";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { formatIndianPhone } from "@/lib/phone";

const HELPLINE_NUMBER = "1930";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { guardianActive, toggleGuardian } = useAppContext();
  const { user, signOut } = useAuth();

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;
  const [notifications, setNotifications] = React.useState(true);

  const displayName = user?.fullName ?? t("profile.member");
  const displayPhone = user ? formatIndianPhone(user.phone) : "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "K";

  const activeLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  function callHelpline() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${HELPLINE_NUMBER}`).catch(() => {});
  }

  // Opens the platform store so users can rate Netraksh. No numeric App Store id
  // exists yet, so iOS falls back to an App Store search for the brand.
  function rateApp() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const primary =
      Platform.OS === "ios"
        ? "itms-apps://apps.apple.com/search?term=Netraksh"
        : "market://details?id=com.kavachai.app";
    const web =
      Platform.OS === "ios"
        ? "https://apps.apple.com/in/search?term=Netraksh"
        : "https://play.google.com/store/apps/details?id=com.kavachai.app";
    Linking.openURL(primary).catch(() => Linking.openURL(web).catch(() => {}));
  }

  function confirmSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t("profile.signOutConfirmTitle"), t("profile.signOutConfirmMsg"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.signOut"), style: "destructive", onPress: () => signOut() },
    ]);
  }

  const QUICK_SERVICES = [
    { icon: "flag" as const, label: t("services.reportFraud"), sublabel: t("services.reportFraudSub"), color: "#dc2626", bg: "#fef2f2", route: "/report" },
    { icon: "grid" as const, label: t("services.scamCategories"), sublabel: t("services.scamCategoriesSub"), color: "#7c3aed", bg: "#f5f3ff", route: "/categories" },
    { icon: "book-open" as const, label: t("services.safetyTips"), sublabel: t("services.safetyTipsSub"), color: GREEN, bg: "#f0fdf4", route: "/safety" },
    { icon: "phone-call" as const, label: t("services.helpline"), sublabel: t("services.helplineSub"), color: NAVY, bg: "#EBF0FA", route: "/helpline" },
  ];

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
              <Text style={s.userAvatarTxt}>{initial}</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>{displayName}</Text>
              {displayPhone ? <Text style={s.headerSub}>{displayPhone}</Text> : null}
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
              {guardianActive ? t("profile.protected") : t("profile.paused")}
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
            <Text style={s.sosTitle}>{t("profile.helplineCardTitle")}</Text>
            <Text style={s.sosDesc}>{t("profile.helplineCardSub")}</Text>
          </View>
          <Text style={s.sosBigNum}>1930</Text>
        </TouchableOpacity>

        {/* Protection section */}
        <Text style={s.sectionLabel}>{t("profile.sectionProtection")}</Text>
        <View style={s.settingsCard}>
          <SettingRow
            icon="shield"
            iconColor={NAVY}
            iconBg="#EBF0FA"
            label={t("profile.guardianMode")}
            sub={t("profile.guardianModeSub")}
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
            label={t("profile.notifications")}
            sub={t("profile.notificationsSub")}
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setNotifications(v); }}
                trackColor={{ false: "#e2e8f0", true: NAVY }}
                thumbColor="#FFFFFF"
              />
            }
            isLast={false}
          />
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => { Haptics.selectionAsync(); router.push("/screening"); }}
            activeOpacity={0.75}
          >
            <View style={[s.settingIconBg, { backgroundColor: "#ecfeff" }]}>
              <Feather name="phone-incoming" size={18} color="#0891b2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.settingLabel}>{t("profile.screening")}</Text>
              <Text style={s.settingSub}>{t("profile.screeningSub")}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Language section */}
        <Text style={s.sectionLabel}>{t("profile.sectionLanguage")}</Text>
        <View style={s.settingsCard}>
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => { Haptics.selectionAsync(); router.push("/language"); }}
            activeOpacity={0.75}
          >
            <View style={[s.settingIconBg, { backgroundColor: "#f0fdf4" }]}>
              <Feather name="globe" size={18} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.settingLabel}>{t("profile.displayLanguage")}</Text>
              <Text style={s.settingSub}>
                {activeLang.native}
                {activeLang.code !== "en" ? ` (${activeLang.label})` : ""}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Quick services */}
        <Text style={s.sectionLabel}>{t("profile.sectionLearn")}</Text>
        <View style={s.servicesGrid}>
          {QUICK_SERVICES.map((svc, i) => (
            <TouchableOpacity
              key={i}
              style={[s.svcCard, { backgroundColor: svc.bg }]}
              activeOpacity={0.75}
              onPress={() => { Haptics.selectionAsync(); router.push(svc.route as any); }}
            >
              <View style={[s.svcIconBox, { shadowColor: svc.color }]}>
                <Feather name={svc.icon} size={18} color={svc.color} />
              </View>
              <Text style={s.svcLabel}>{svc.label}</Text>
              <Text style={s.svcSublabel}>{svc.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* From the founder: book */}
        <Text style={s.sectionLabel}>{t("book.sectionLabel")}</Text>
        <View style={{ marginBottom: 20 }}>
          <BookPromo />
        </View>

        {/* About section */}
        <Text style={s.sectionLabel}>{t("profile.sectionAbout")}</Text>
        <View style={s.settingsCard}>
          <SettingRow
            icon="info"
            iconColor={NAVY}
            iconBg="#EBF0FA"
            label={t("profile.aboutTitle")}
            sub={t("profile.aboutSub")}
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={false}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/about");
            }}
          />
          <SettingRow
            icon="file-text"
            iconColor="#7c3aed"
            iconBg="#f5f3ff"
            label={t("profile.privacyTitle")}
            sub={t("profile.privacySub")}
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={false}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/privacy");
            }}
          />
          <SettingRow
            icon="star"
            iconColor={SAFFRON}
            iconBg="#fff7ed"
            label={t("profile.rateTitle")}
            sub={t("profile.rateSub")}
            right={<Feather name="chevron-right" size={16} color="#94a3b8" />}
            isLast={true}
            onPress={rateApp}
          />
        </View>

        <TouchableOpacity style={s.signOutBtn} onPress={confirmSignOut} activeOpacity={0.8}>
          <Feather name="log-out" size={17} color="#dc2626" />
          <Text style={s.signOutTxt}>{t("profile.signOut")}</Text>
        </TouchableOpacity>

        <Text style={s.version}>{t("profile.version")}</Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon, iconColor, iconBg, label, sub, right, isLast, onPress,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sub: string;
  right: React.ReactNode;
  isLast: boolean;
  onPress?: () => void;
}) {
  const inner = (
    <>
      <View style={[s.settingIconBg, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.settingLabel}>{label}</Text>
        <Text style={s.settingSub}>{sub}</Text>
      </View>
      {right}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[s.settingRow, !isLast && s.settingRowBorder]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return <View style={[s.settingRow, !isLast && s.settingRowBorder]}>{inner}</View>;
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

  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fef2f2", borderRadius: 14, paddingVertical: 14, marginTop: 4,
    borderWidth: 1, borderColor: "rgba(220,38,38,0.2)",
  },
  signOutTxt: { fontSize: 15, fontWeight: "700" as const, color: "#dc2626" },
  version: { textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16, marginBottom: 8 },
});
