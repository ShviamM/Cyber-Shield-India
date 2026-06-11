import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AppState,
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
  needsAutoStartGuidance,
  openAutoStartSettings,
  requestAnswerCallsPermission,
  requestCallScreeningRole,
  requestDisableBatteryOptimization,
  requestFullScreenIntentPermission,
  requestOverlayPermission,
  sendTestAlert,
  syncScreeningApiConfig,
  syncScreeningLanguage,
  type ScreeningStatus,
} from "@/lib/screening";
import { getToken } from "@/lib/session";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

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
  const { t, i18n } = useTranslation();
  const { callScreening, setCallScreening } = useAppContext();

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 24;

  const supported = isScreeningSupported();
  const [status, setStatus] = React.useState<ScreeningStatus>(() => getScreeningStatus());

  const refreshStatus = React.useCallback(() => {
    setStatus(getScreeningStatus());
  }, []);

  // Give the native call-screening service the API base + session token so it can
  // look up an incoming caller's scam reputation (the service runs without a JS
  // bridge and can't reach the JS API client). Premium users get unlimited
  // checks via the bearer token; signed-out users fall back to anonymous quota.
  const syncApiConfig = React.useCallback(async () => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!domain) return;
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      token = null;
    }
    syncScreeningApiConfig(`https://${domain}`, token);
  }, []);

  // Keep the native overlay language in sync, and re-read status whenever the
  // screen regains focus (e.g. returning from the "Display over other apps"
  // settings screen) so the permission state reflects the user's choice.
  useFocusEffect(
    React.useCallback(() => {
      syncScreeningLanguage(i18n.language?.startsWith("hi") ? "hi" : "en");
      void syncApiConfig();
      refreshStatus();
    }, [i18n.language, refreshStatus, syncApiConfig])
  );

  // Re-read permission status when the app returns to the foreground. Granting
  // overlay / full-screen-intent happens on a system Settings activity that
  // backgrounds the whole app — which does NOT trigger useFocusEffect (the
  // navigator screen never lost focus) — so without this the setup steps would
  // keep showing "missing" until the user re-navigated to the screen.
  React.useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshStatus();
    });
    return () => sub.remove();
  }, [refreshStatus]);

  async function grantRole() {
    Haptics.selectionAsync();
    syncScreeningLanguage(i18n.language?.startsWith("hi") ? "hi" : "en");
    void syncApiConfig();
    const ok = await requestCallScreeningRole();
    if (!ok) {
      Alert.alert(t("screening.roleDeniedTitle"), t("screening.roleDeniedMsg"));
    }
    refreshStatus();
  }

  async function grantAnswer() {
    Haptics.selectionAsync();
    await requestAnswerCallsPermission();
    refreshStatus();
  }

  async function grantNotif() {
    Haptics.selectionAsync();
    await requestNotificationPermission();
    refreshStatus();
  }

  async function grantOverlay() {
    Haptics.selectionAsync();
    await requestOverlayPermission();
    refreshStatus();
  }

  async function grantFullScreenIntent() {
    Haptics.selectionAsync();
    await requestFullScreenIntentPermission();
    refreshStatus();
  }

  async function fixBatteryOptimization() {
    Haptics.selectionAsync();
    await requestDisableBatteryOptimization();
    refreshStatus();
  }

  async function openAutoStart() {
    Haptics.selectionAsync();
    await openAutoStartSettings();
    refreshStatus();
  }

  function fireTestAlert() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ok = sendTestAlert();
    if (ok) {
      Alert.alert(t("screening.testAlert.sentTitle"), t("screening.testAlert.sentMsg"));
    } else {
      Alert.alert(t("screening.testAlert.failTitle"), t("screening.testAlert.failMsg"));
    }
  }

  async function toggleCall(next: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!supported) {
      setCallScreening(next);
      return;
    }
    if (next) {
      syncScreeningLanguage(i18n.language?.startsWith("hi") ? "hi" : "en");
      void syncApiConfig();
      // Kick off the guided setup: request the defining role + the two runtime
      // permissions (notifications, answer/decline calls) back-to-back. The two
      // Settings-screen grants (overlay, full-screen) are driven by the guide.
      const ok = await requestCallScreeningRole();
      await requestNotificationPermission();
      await requestAnswerCallsPermission();
      if (!ok) {
        Alert.alert(t("screening.roleDeniedTitle"), t("screening.roleDeniedMsg"));
      }
      // Only mark screening enabled if the defining Call Screening role was
      // actually granted. Without the role the OS never routes incoming calls to
      // us, so a "true" toggle would be a false-positive "protected" state.
      setCallScreening(ok);
    } else {
      setCallScreening(false);
    }
    refreshStatus();
  }

  type SetupStep = { key: string; done: boolean; label: string; action: () => void };
  const setupSteps: SetupStep[] = [
    { key: "role", done: status.hasCallRole, label: t("screening.statusCallRole"), action: grantRole },
    { key: "answer", done: status.hasAnswerCallsPermission, label: t("screening.statusAnswer"), action: grantAnswer },
    { key: "notif", done: status.hasNotificationPermission, label: t("screening.statusNotif"), action: grantNotif },
    { key: "overlay", done: status.hasOverlayPermission, label: t("screening.statusOverlay"), action: grantOverlay },
    { key: "fullscreen", done: status.hasFullScreenIntentPermission, label: t("screening.statusFullScreen"), action: grantFullScreenIntent },
  ];
  const setupDoneCount = setupSteps.filter((x) => x.done).length;
  const nextSetupStep = setupSteps.find((x) => !x.done);

  const batteryOk = status.isIgnoringBatteryOptimizations;
  const needsAutoStart = needsAutoStartGuidance(status.manufacturer);
  // Title-case the manufacturer for display ("xiaomi" -> "Xiaomi").
  const oemBrand = status.manufacturer
    ? status.manufacturer.charAt(0).toUpperCase() + status.manufacturer.slice(1)
    : "";

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
              <Text style={s.rowLabel}>{t("screening.smsShareTitle")}</Text>
              <Text style={s.rowSub}>{t("screening.smsShareSub")}</Text>
            </View>
          </View>
        </View>

        {/* Reliability warning: the lock-screen popup depends on the overlay +
            full-screen-intent grants. Until both are on, nag the user (with a
            one-tap fix) so the caller card actually fronts like Truecaller. */}
        {supported &&
          callScreening &&
          (!status.hasOverlayPermission || !status.hasFullScreenIntentPermission) && (
            <View style={s.warnCard}>
              <View style={s.warnHead}>
                <Feather name="alert-triangle" size={18} color="#b45309" />
                <Text style={s.warnTitle}>{t("screening.popupWarn.title")}</Text>
              </View>
              <Text style={s.warnText}>{t("screening.popupWarn.body")}</Text>
              <TouchableOpacity
                style={s.warnBtn}
                onPress={() => {
                  // grantOverlay / grantFullScreenIntent already trigger haptics.
                  if (!status.hasOverlayPermission) {
                    void grantOverlay();
                  } else {
                    void grantFullScreenIntent();
                  }
                }}
                activeOpacity={0.85}
              >
                <Feather name="zap" size={15} color="#fff" />
                <Text style={s.warnBtnTxt}>{t("screening.popupWarn.cta")}</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Guided, Truecaller-style setup: one card that walks the user through
            each grant in order with a single "Continue" button, instead of
            scattered prompts. */}
        {supported && callScreening && (
          <SetupGuide
            steps={setupSteps}
            doneCount={setupDoneCount}
            nextStep={nextSetupStep}
            blocklistSize={status.blocklistSize}
            t={t}
          />
        )}

        {/* Reliability: on aggressive OEMs the screening service is killed unless
            the app is battery-unrestricted and (on Xiaomi/Oppo/Vivo/etc.) has
            autostart enabled. Surface these as one-tap fixes so the caller popup
            fires consistently — the real cross-device reliability gap. */}
        {supported && callScreening && (
          <>
            <Text style={s.sectionLabel}>{t("screening.sectionReliability")}</Text>
            <View style={s.card}>
              {/* Battery optimization (all OEMs) */}
              <View style={[s.relRow, needsAutoStart && s.rowBorder]}>
                <View
                  style={[
                    s.relIcon,
                    { backgroundColor: batteryOk ? "#f0fdf4" : "#fff7ed" },
                  ]}
                >
                  <Feather
                    name="battery-charging"
                    size={18}
                    color={batteryOk ? GREEN : SAFFRON}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{t("screening.reliability.batteryTitle")}</Text>
                  <Text style={s.rowSub}>
                    {batteryOk
                      ? t("screening.reliability.batteryDone")
                      : t("screening.reliability.batterySub")}
                  </Text>
                </View>
                {batteryOk ? (
                  <Feather name="check-circle" size={20} color={GREEN} />
                ) : (
                  <TouchableOpacity
                    style={s.relFixBtn}
                    onPress={fixBatteryOptimization}
                    activeOpacity={0.85}
                  >
                    <Text style={s.relFixTxt}>{t("screening.reliability.fix")}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* OEM autostart (Xiaomi / Oppo / Vivo / Realme / OnePlus / etc.) */}
              {needsAutoStart && (
                <View style={s.relRow}>
                  <View style={[s.relIcon, { backgroundColor: "#fff7ed" }]}>
                    <Feather name="power" size={18} color={SAFFRON} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{t("screening.reliability.autostartTitle")}</Text>
                    <Text style={s.rowSub}>
                      {t("screening.reliability.autostartSub", { brand: oemBrand })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.relFixBtn}
                    onPress={openAutoStart}
                    activeOpacity={0.85}
                  >
                    <Text style={s.relFixTxt}>{t("screening.reliability.open")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Self-test: fire the real lock-screen alert so the user can verify
                it fronts on their own device. */}
            <TouchableOpacity
              style={s.testBtn}
              onPress={fireTestAlert}
              activeOpacity={0.85}
            >
              <Feather name="bell" size={18} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={s.testTitle}>{t("screening.testAlert.cta")}</Text>
                <Text style={s.testSub}>{t("screening.testAlert.hint")}</Text>
              </View>
              <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </>
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

        {/* Manage the numbers the user has blocked (view + unblock). */}
        {supported && (
          <TouchableOpacity
            style={s.manageBtn}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/blocked-numbers");
            }}
            activeOpacity={0.85}
          >
            <Feather name="slash" size={18} color={NAVY} />
            <Text style={s.manageTxt}>{t("screening.manageBlocked")}</Text>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}

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

type GuideStep = { key: string; done: boolean; label: string; action: () => void };

function SetupGuide({
  steps,
  doneCount,
  nextStep,
  blocklistSize,
  t,
}: {
  steps: GuideStep[];
  doneCount: number;
  nextStep: GuideStep | undefined;
  blocklistSize: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const total = steps.length;
  const allDone = !nextStep;
  return (
    <View style={[s.guideCard, allDone && s.guideCardDone]}>
      <View style={s.guideHead}>
        <View style={[s.guideBadge, allDone && s.guideBadgeDone]}>
          <Feather name={allDone ? "check" : "zap"} size={16} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.guideTitle}>
            {allDone ? t("screening.setup.doneTitle") : t("screening.setup.title")}
          </Text>
          <Text style={s.guideSub}>
            {allDone
              ? t("screening.setup.doneSub")
              : t("screening.setup.progress", { done: doneCount, total })}
          </Text>
        </View>
      </View>

      <View style={s.guideSteps}>
        {steps.map((step) => {
          const isNext = step.key === nextStep?.key;
          return (
            <View key={step.key} style={s.guideStep}>
              <View
                style={[
                  s.guideStepIcon,
                  step.done && s.guideStepIconDone,
                  isNext && s.guideStepIconNext,
                ]}
              >
                <Feather
                  name={step.done ? "check" : "circle"}
                  size={12}
                  color={step.done || isNext ? "#fff" : "#cbd5e1"}
                />
              </View>
              <Text
                style={[
                  s.guideStepTxt,
                  step.done && s.guideStepTxtDone,
                  isNext && s.guideStepTxtNext,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {allDone ? (
        <View style={s.guideDoneMeta}>
          <Feather name="database" size={13} color="#64748b" />
          <Text style={s.statusMetaTxt}>
            {t("screening.statusBlocklist", { n: blocklistSize })}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={s.guideBtn}
          onPress={nextStep?.action}
          activeOpacity={0.85}
        >
          <Text style={s.guideBtnTxt}>{t("screening.setup.cta")}</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      )}
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

  statusMetaTxt: { fontSize: 12, color: "#64748b" },

  warnCard: {
    backgroundColor: "#fffbeb", borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#fcd34d",
  },
  warnHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  warnTitle: { flex: 1, fontSize: 14, fontWeight: "800" as const, color: "#92400e" },
  warnText: { fontSize: 12.5, color: "#78350f", lineHeight: 19, marginBottom: 12 },
  warnBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#d97706", borderRadius: 12, paddingVertical: 12,
  },
  warnBtnTxt: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },

  guideCard: {
    backgroundColor: "#fff7ed", borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: "rgba(255,103,19,0.3)",
  },
  guideCardDone: {
    backgroundColor: "#f0fdf4", borderColor: "rgba(22,163,74,0.3)",
  },
  guideHead: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 14 },
  guideBadge: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: SAFFRON,
    alignItems: "center", justifyContent: "center",
  },
  guideBadgeDone: { backgroundColor: GREEN },
  guideTitle: { fontSize: 15, fontWeight: "800" as const, color: "#1e293b" },
  guideSub: { fontSize: 12, color: "#64748b", marginTop: 1 },
  guideSteps: { gap: 10, marginBottom: 14 },
  guideStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  guideStepIcon: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "#e2e8f0",
    alignItems: "center", justifyContent: "center",
  },
  guideStepIconDone: { backgroundColor: GREEN, borderColor: GREEN },
  guideStepIconNext: { backgroundColor: SAFFRON, borderColor: SAFFRON },
  guideStepTxt: { flex: 1, fontSize: 13, fontWeight: "600" as const, color: "#94a3b8" },
  guideStepTxtDone: { color: "#166534" },
  guideStepTxtNext: { color: "#1e293b", fontWeight: "700" as const },
  guideDoneMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  guideBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: SAFFRON, borderRadius: 12, paddingVertical: 13,
  },
  guideBtnTxt: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },

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

  manageBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  manageTxt: { flex: 1, fontSize: 14, fontWeight: "700" as const, color: "#0B3D91" },

  relRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  relIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  relFixBtn: {
    backgroundColor: SAFFRON, borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  relFixTxt: { fontSize: 13, fontWeight: "700" as const, color: "#fff" },

  testBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 20,
  },
  testTitle: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },
  testSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 16 },
});
