import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  PermissionsAndroid,
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
import {
  getScreeningStatus,
  isScreeningSupported,
  requestCallScreeningRole,
  type ScreeningStatus,
} from "@/lib/screening";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

async function requestSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  } catch {
    // ignore
  }
}

export default function ScreeningScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { callScreening, smsScreening, setCallScreening, setSmsScreening } = useAppContext();

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 24;

  const supported = isScreeningSupported();
  const [status, setStatus] = React.useState<ScreeningStatus>(() => getScreeningStatus());

  const refreshStatus = React.useCallback(() => {
    setStatus(getScreeningStatus());
  }, []);

  async function toggleCall(next: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!supported) {
      setCallScreening(next);
      return;
    }
    if (next) {
      const ok = await requestCallScreeningRole();
      await requestNotificationPermission();
      if (!ok) {
        Alert.alert(t("screening.roleDeniedTitle"), t("screening.roleDeniedMsg"));
      }
      setCallScreening(true);
    } else {
      setCallScreening(false);
    }
    refreshStatus();
  }

  async function toggleSms(next: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!supported) {
      setSmsScreening(next);
      return;
    }
    if (next) {
      const granted = await requestSmsPermissions();
      if (!granted) {
        Alert.alert(t("screening.smsDeniedTitle"), t("screening.smsDeniedMsg"));
        return;
      }
      setSmsScreening(true);
    } else {
      setSmsScreening(false);
    }
    refreshStatus();
  }

  const PRIVACY_POINTS = [
    { icon: "smartphone" as const, text: t("screening.privacy.onDevice") },
    { icon: "eye-off" as const, text: t("screening.privacy.noContent") },
    { icon: "sliders" as const, text: t("screening.privacy.userControl") },
    { icon: "phone-call" as const, text: t("screening.privacy.neverBlocks") },
  ];

  const HOW_STEPS = [
    t("screening.how.step1"),
    t("screening.how.step2"),
    t("screening.how.step3"),
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.headerBg, { paddingTop: topInset }]}>
        <View style={s.tricolor}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </View>
        <View style={s.headerContent}>
          <View style={s.headerIcon}>
            <Feather name="shield" size={20} color={SAFFRON} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("screening.title")}</Text>
            <Text style={s.headerSub}>{t("screening.subtitle")}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 16 }}
      >
        {/* Platform availability notice */}
        {!supported && (
          <View style={s.noticeCard}>
            <Feather name="info" size={18} color={NAVY} />
            <View style={{ flex: 1 }}>
              <Text style={s.noticeTitle}>{t("screening.unavailableTitle")}</Text>
              <Text style={s.noticeText}>
                {Platform.OS === "ios"
                  ? t("screening.unavailableIos")
                  : t("screening.unavailableBuild")}
              </Text>
            </View>
          </View>
        )}

        {/* Intro */}
        <Text style={s.intro}>{t("screening.intro")}</Text>

        {/* Protections */}
        <Text style={s.sectionLabel}>{t("screening.sectionProtections")}</Text>
        <View style={s.card}>
          <View style={[s.row, s.rowBorder]}>
            <View style={[s.rowIcon, { backgroundColor: "#EBF0FA" }]}>
              <Feather name="phone-incoming" size={18} color={NAVY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{t("screening.callTitle")}</Text>
              <Text style={s.rowSub}>{t("screening.callSub")}</Text>
            </View>
            <Switch
              value={callScreening}
              onValueChange={toggleCall}
              trackColor={{ false: "#e2e8f0", true: NAVY }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: "#ecfeff" }]}>
              <Feather name="message-square" size={18} color="#0891b2" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{t("screening.smsTitle")}</Text>
              <Text style={s.rowSub}>{t("screening.smsSub")}</Text>
            </View>
            <Switch
              value={smsScreening}
              onValueChange={toggleSms}
              trackColor={{ false: "#e2e8f0", true: NAVY }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Live status (native only) */}
        {supported && (callScreening || smsScreening) && (
          <View style={s.statusCard}>
            <StatusLine
              ok={status.hasCallRole}
              label={t("screening.statusCallRole")}
              show={callScreening}
            />
            <StatusLine
              ok={status.hasSmsPermission}
              label={t("screening.statusSmsPerm")}
              show={smsScreening}
            />
            <StatusLine
              ok={status.hasNotificationPermission}
              label={t("screening.statusNotif")}
              show
            />
            <View style={s.statusMeta}>
              <Feather name="database" size={13} color="#64748b" />
              <Text style={s.statusMetaTxt}>
                {t("screening.statusBlocklist", { n: status.blocklistSize })}
              </Text>
            </View>
          </View>
        )}

        {/* Privacy */}
        <Text style={s.sectionLabel}>{t("screening.sectionPrivacy")}</Text>
        <View style={s.card}>
          {PRIVACY_POINTS.map((p, i) => (
            <View key={i} style={[s.privacyRow, i < PRIVACY_POINTS.length - 1 && s.rowBorder]}>
              <View style={s.privacyIcon}>
                <Feather name={p.icon} size={16} color={GREEN} />
              </View>
              <Text style={s.privacyTxt}>{p.text}</Text>
            </View>
          ))}
        </View>

        {/* How it works */}
        <Text style={s.sectionLabel}>{t("screening.sectionHow")}</Text>
        <View style={s.card}>
          {HOW_STEPS.map((step, i) => (
            <View key={i} style={[s.howRow, i < HOW_STEPS.length - 1 && s.rowBorder]}>
              <View style={s.howNum}>
                <Text style={s.howNumTxt}>{i + 1}</Text>
              </View>
              <Text style={s.howTxt}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Demo (so users can preview the warning UI) */}
        <TouchableOpacity
          style={s.demoBtn}
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/call-alert");
          }}
          activeOpacity={0.85}
        >
          <Feather name="play-circle" size={18} color={SAFFRON} />
          <Text style={s.demoTxt}>{t("screening.previewWarning")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StatusLine({ ok, label, show }: { ok: boolean; label: string; show: boolean }) {
  if (!show) return null;
  return (
    <View style={s.statusLine}>
      <Feather
        name={ok ? "check-circle" : "alert-circle"}
        size={15}
        color={ok ? GREEN : "#ea580c"}
      />
      <Text style={[s.statusTxt, { color: ok ? "#166534" : "#9a3412" }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { backgroundColor: NAVY, paddingBottom: 18 },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  headerContent: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 14, marginTop: 6,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: "#fff", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  noticeCard: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    backgroundColor: "#EBF0FA", borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.15)",
  },
  noticeTitle: { fontSize: 13, fontWeight: "700" as const, color: NAVY, marginBottom: 2 },
  noticeText: { fontSize: 12, color: "#334155", lineHeight: 18 },

  intro: { fontSize: 13, color: "#475569", lineHeight: 20, marginBottom: 18 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 1,
    color: "#94a3b8", marginBottom: 10, marginTop: 4,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.08)",
    marginBottom: 20, overflow: "hidden",
    shadowColor: NAVY, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontWeight: "600" as const, color: "#0f172a" },
  rowSub: { fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 16 },

  statusCard: {
    backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 20, gap: 10,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  statusLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusTxt: { fontSize: 13, fontWeight: "600" as const },
  statusMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  statusMetaTxt: { fontSize: 12, color: "#64748b" },

  privacyRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  privacyIcon: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: "#f0fdf4",
    alignItems: "center", justifyContent: "center",
  },
  privacyTxt: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 19 },

  howRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  howNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: NAVY,
    alignItems: "center", justifyContent: "center",
  },
  howNumTxt: { fontSize: 12, fontWeight: "800" as const, color: "#fff" },
  howTxt: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 19 },

  demoBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff7ed", borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: "rgba(255,103,19,0.3)",
  },
  demoTxt: { fontSize: 14, fontWeight: "700" as const, color: "#9a3412" },
});
