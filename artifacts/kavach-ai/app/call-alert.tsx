import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  getCheckNumberQueryKey,
  listCategories,
  useCheckNumber,
  useCreateReport,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import i18n from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryIcon } from "@/constants/strings";
import { formatIndianPhone, phoneForApi } from "@/lib/phone";
import { recordAnsweredCall } from "@/lib/postcall";
import { answerCall, blockNumber, endCall } from "@/lib/screening";

const DEMO_NUMBER = "+91 87654-32100";

function prettyCategory(key: string): string | null {
  if (!key.trim()) return null;
  return key
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type ReportPhase =
  | "list"
  | "submitting"
  | "success"
  | "duplicate"
  | "rateLimited"
  | "error";

export default function CallAlertScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n: i18nInstance } = useTranslation();
  const params = useLocalSearchParams<{ number?: string | string[] }>();
  const rawNumber = Array.isArray(params.number) ? params.number[0] : params.number;
  const callerNumber = rawNumber && rawNumber.trim() ? rawNumber.trim() : DEMO_NUMBER;
  const isDemo = !(rawNumber && rawNumber.trim());
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = (Platform.OS === "web" ? 34 : insets.bottom) + 20;

  const warnings = t("callAlert.warnings", { returnObjects: true }) as string[];
  const tEn = i18n.getFixedT("en");
  const englishWarnings = tEn("callAlert.warnings", { returnObjects: true }) as string[];
  const showEnglish = i18nInstance.language !== "en";

  const [warningIndex, setWarningIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const warningOpacity = useRef(new Animated.Value(1)).current;

  const [reportOpen, setReportOpen] = useState(false);
  const [reportPhase, setReportPhase] = useState<ReportPhase>("list");
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);

  const apiPhone = phoneForApi(callerNumber);
  // Always present the caller as "+91 96828 24432" for Indian numbers (the
  // native layer may hand us "919682824432", "+919682824432" or bare digits).
  // Non-Indian / short codes fall back to whatever came in.
  const displayNumber = formatIndianPhone(callerNumber);
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    enabled: reportOpen,
  });
  const categories = categoriesQuery.data?.categories ?? [];
  const createReport = useCreateReport();

  // Live reputation for a real incoming caller. The manual demo (no number)
  // keeps its canned showcase content.
  const checkEnabled = !isDemo && !!apiPhone;
  const checkQuery = useCheckNumber(apiPhone ?? "", {
    query: {
      queryKey: getCheckNumberQueryKey(apiPhone ?? ""),
      enabled: checkEnabled,
      staleTime: 60_000,
    },
  });
  const rep = checkQuery.data;
  const checking = checkEnabled && checkQuery.isLoading;
  const isRisky = isDemo
    ? true
    : !!rep &&
      (rep.verifiedScam ||
        rep.riskLevel === "high" ||
        rep.riskLevel === "medium");
  const accent = isRisky ? "#dc2626" : "#16a34a";
  const rootBg = isRisky ? "#1a0000" : "#04122b";
  const topCategory =
    !isDemo && rep && rep.categories.length > 0
      ? prettyCategory(rep.categories[0].key)
      : null;
  const riskText = rep ? t(`callAlert.risk_${rep.riskLevel}`) : "";
  const statusText = rep
    ? rep.verifiedScam
      ? t("callAlert.statusVerified")
      : rep.reportCount > 0
        ? t("callAlert.statusReported")
        : t("callAlert.statusClean")
    : "";
  // Honest non-risky headline: only claim "clean" when we actually confirmed
  // zero reports. Reported-but-not-risky stays cautious; lookup failures are
  // explicitly neutral rather than reassuring.
  const safeHeadlineText = checking
    ? t("callAlert.checking")
    : rep
      ? rep.reportCount > 0
        ? t("callAlert.cautionHeadline")
        : t("callAlert.safeHeadline")
      : t("callAlert.unknownHeadline");

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const interval = setInterval(() => {
      Animated.timing(warningOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setWarningIndex((i) => (i + 1) % warnings.length);
        Animated.timing(warningOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => {
      pulse.stop();
      clearInterval(interval);
    };
  }, []);

  // The screen is launched both as a modal (from the in-app demo, with a back
  // stack) and via a deep link from the native service (no back stack — where
  // router.back() is a no-op). Fall back to the tabs so the popup always closes.
  function dismiss() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }

  function handleBlock() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // For a real incoming call, hang it up and remember the number so future
    // calls from it are auto-rejected. The demo (no live call) just dismisses.
    if (!isDemo) {
      endCall();
      if (apiPhone) blockNumber(apiPhone);
    }
    dismiss();
  }

  function handleReport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!apiPhone) {
      setReportPhase("error");
    } else {
      setReportPhase("list");
    }
    setReportOpen(true);
  }

  async function handlePickCategory(categoryKey: string) {
    if (!apiPhone || createReport.isPending) return;
    Haptics.selectionAsync();
    setSubmittingKey(categoryKey);
    setReportPhase("submitting");
    try {
      await createReport.mutateAsync({
        data: {
          phone: apiPhone,
          categoryKey,
          description: t("callAlert.reportAutoDescription"),
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReportPhase("success");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setReportPhase("duplicate");
      } else if (status === 429) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setReportPhase("rateLimited");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setReportPhase("error");
      }
    } finally {
      setSubmittingKey(null);
    }
  }

  function closeReport() {
    const wasDone = reportPhase === "success" || reportPhase === "duplicate";
    setReportOpen(false);
    setReportPhase("list");
    // After a successful report, dismiss the call alert too.
    if (wasDone) dismiss();
  }

  function handleAnswer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Accept the live ringing call; the system in-call UI then comes forward.
    // Remember the answered number so that — when the user returns to Netraksh
    // after the call — we can ask how it went (Play-safe post-call prompt; we
    // can't detect call-end without restricted phone permissions).
    if (!isDemo) {
      const answered = answerCall();
      // Only remember the call if the system actually accepted it; otherwise we'd
      // ask "How was this call?" about a call that never connected.
      if (answered && apiPhone) void recordAnsweredCall(apiPhone);
    }
    dismiss();
  }

  const w = warnings[warningIndex];
  const wEn = englishWarnings[warningIndex];

  return (
    <View
      style={[
        s.root,
        { paddingTop: topInset, paddingBottom: bottomInset, backgroundColor: rootBg },
      ]}
    >
      {/* Close */}
      <TouchableOpacity
        style={s.closeBtn}
        onPress={dismiss}
        activeOpacity={0.75}
      >
        <Feather name="x" size={20} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      {/* Incoming tag */}
      <View style={s.incomingRow}>
        <View style={[s.incomingDot, { backgroundColor: accent }]} />
        <Text style={[s.incomingTxt, { color: accent }]}>{t("callAlert.incoming")}</Text>
      </View>

      {/* Caller */}
      <View style={s.callerSection}>
        <Animated.View
          style={[
            s.dangerCircleOuter,
            { backgroundColor: `${accent}2e`, transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={[s.dangerCircleInner, { backgroundColor: accent }]}>
            <Feather
              name={isRisky ? "phone-incoming" : "shield"}
              size={36}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>
        <Text style={s.callerNumber}>{displayNumber}</Text>
        <Text style={s.callerUnknown}>{t("callAlert.unknownCaller")}</Text>
      </View>

      {/* Reports stats */}
      {isDemo ? (
        <View style={s.statsCard}>
          <View style={s.statItem}>
            <Feather name="alert-octagon" size={16} color="#f87171" />
            <Text style={s.statNum}>2,341</Text>
            <Text style={s.statLbl}>{t("callAlert.scamReports")}</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Feather name="users" size={16} color="#fb923c" />
            <Text style={s.statNum}>892</Text>
            <Text style={s.statLbl}>{t("callAlert.victimsReported")}</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Feather name="map-pin" size={16} color="#fbbf24" />
            <Text style={s.statNum}>Mumbai</Text>
            <Text style={s.statLbl}>{t("callAlert.topCity")}</Text>
          </View>
        </View>
      ) : checking ? (
        <View style={[s.statsCard, s.statsCardLoading, { borderColor: `${accent}40` }]}>
          <ActivityIndicator color={accent} />
          <Text style={s.checkingTxt}>{t("callAlert.checking")}</Text>
        </View>
      ) : rep ? (
        <View
          style={[
            s.statsCard,
            { borderColor: `${accent}40`, backgroundColor: `${accent}1f` },
          ]}
        >
          <View style={s.statItem}>
            <Feather name="alert-octagon" size={16} color={accent} />
            <Text style={s.statNum}>{String(rep.reportCount)}</Text>
            <Text style={s.statLbl}>{t("callAlert.scamReports")}</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Feather name="activity" size={16} color={accent} />
            <Text style={s.statNum}>{riskText}</Text>
            <Text style={s.statLbl}>{t("callAlert.riskLabel")}</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Feather name="shield" size={16} color={accent} />
            <Text style={s.statNum}>{statusText}</Text>
            <Text style={s.statLbl}>{t("callAlert.statusLabel")}</Text>
          </View>
        </View>
      ) : null}

      {/* Headline */}
      {isRisky ? (
        <Animated.View style={[s.warningBox, { opacity: warningOpacity }]}>
          <Text style={s.warningHindi}>{w}</Text>
          {showEnglish && <Text style={s.warningEnglish}>{wEn}</Text>}
        </Animated.View>
      ) : (
        <View style={s.warningBox}>
          <Text style={[s.warningHindi, { color: accent }]}>{safeHeadlineText}</Text>
        </View>
      )}

      {/* Scam type tag */}
      {isDemo || topCategory ? (
        <View style={s.scamTypeRow}>
          <View
            style={[
              s.scamTypeBadge,
              !isDemo && {
                backgroundColor: `${accent}33`,
                borderColor: `${accent}59`,
              },
            ]}
          >
            <Text style={[s.scamTypeTxt, !isDemo && { color: accent }]}>
              {isDemo ? t("callAlert.scamType") : topCategory}
            </Text>
          </View>
        </View>
      ) : (
        <View style={s.scamTypeRow} />
      )}

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.blockBtn}
          onPress={handleBlock}
          activeOpacity={0.8}
        >
          <Feather name="shield-off" size={22} color="#FFFFFF" />
          <Text style={s.blockTxt}>{t("callAlert.block")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.reportBtn}
          onPress={handleReport}
          activeOpacity={0.8}
        >
          <Feather name="flag" size={22} color="#FFFFFF" />
          <Text style={s.reportTxt}>{t("callAlert.report")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.answerBtn}
          onPress={handleAnswer}
          activeOpacity={0.8}
        >
          <Feather name="phone" size={22} color="rgba(255,255,255,0.5)" />
          <Text style={s.answerTxt}>{t("callAlert.answer")}</Text>
          {isRisky && (
            <Text style={[s.answerRisk, { color: accent }]}>
              {t("callAlert.highRisk")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Scam-type report popup */}
      <Modal
        visible={reportOpen}
        transparent
        animationType="slide"
        onRequestClose={closeReport}
      >
        <View style={s.sheetBackdrop}>
          <View style={[s.sheet, { paddingBottom: bottomInset }]}>
            <View style={s.sheetHandle} />

            {reportPhase === "success" ||
            reportPhase === "duplicate" ||
            reportPhase === "rateLimited" ? (
              <View style={s.resultBox}>
                <View
                  style={[
                    s.resultIcon,
                    reportPhase !== "success" && s.resultIconWarn,
                  ]}
                >
                  <Feather
                    name={reportPhase === "success" ? "check-circle" : "info"}
                    size={40}
                    color={reportPhase === "success" ? "#22c55e" : "#f59e0b"}
                  />
                </View>
                <Text style={s.resultTitle}>
                  {reportPhase === "duplicate"
                    ? t("callAlert.reportDuplicateTitle")
                    : reportPhase === "rateLimited"
                      ? t("callAlert.reportRateLimitedTitle")
                      : t("callAlert.reportSuccessTitle")}
                </Text>
                <Text style={s.resultMsg}>
                  {reportPhase === "duplicate"
                    ? t("callAlert.reportDuplicateMsg")
                    : reportPhase === "rateLimited"
                      ? t("callAlert.reportRateLimitedMsg")
                      : t("callAlert.reportSuccessMsg")}
                </Text>
                <TouchableOpacity
                  style={s.resultBtn}
                  onPress={closeReport}
                  activeOpacity={0.85}
                >
                  <Text style={s.resultBtnTxt}>{t("callAlert.reportDone")}</Text>
                </TouchableOpacity>
              </View>
            ) : reportPhase === "error" ? (
              <View style={s.resultBox}>
                <View style={[s.resultIcon, s.resultIconErr]}>
                  <Feather name="alert-triangle" size={40} color="#ef4444" />
                </View>
                <Text style={s.resultTitle}>
                  {t("callAlert.reportErrorTitle")}
                </Text>
                <Text style={s.resultMsg}>
                  {apiPhone
                    ? t("callAlert.reportErrorMsg")
                    : t("callAlert.reportInvalidNumber")}
                </Text>
                {apiPhone ? (
                  <TouchableOpacity
                    style={s.resultBtn}
                    onPress={() => setReportPhase("list")}
                    activeOpacity={0.85}
                  >
                    <Text style={s.resultBtnTxt}>
                      {t("callAlert.reportRetry")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={s.resultBtn}
                    onPress={closeReport}
                    activeOpacity={0.85}
                  >
                    <Text style={s.resultBtnTxt}>
                      {t("callAlert.reportDone")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <View style={s.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sheetTitle}>
                      {t("callAlert.reportSheetTitle")}
                    </Text>
                    <Text style={s.sheetSubtitle}>
                      {t("callAlert.reportSheetSubtitle")}
                    </Text>
                    <Text style={s.sheetNumber}>{displayNumber}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeReport}
                    style={s.sheetClose}
                    activeOpacity={0.75}
                  >
                    <Feather name="x" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {categoriesQuery.isLoading ? (
                  <View style={s.sheetLoading}>
                    <ActivityIndicator color="#dc2626" />
                  </View>
                ) : categoriesQuery.isError ? (
                  <View style={s.sheetLoading}>
                    <Feather name="wifi-off" size={28} color="#94a3b8" />
                    <Text style={s.catErrorTxt}>
                      {t("report.categoryLoadError")}
                    </Text>
                    <TouchableOpacity
                      style={s.catRetryBtn}
                      onPress={() => categoriesQuery.refetch()}
                      activeOpacity={0.85}
                    >
                      <Text style={s.catRetryTxt}>
                        {t("callAlert.reportRetry")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView
                    style={s.catScroll}
                    contentContainerStyle={s.catScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {categories.map((c) => {
                      const busy = submittingKey === c.key;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[s.catRow, busy && s.catRowBusy]}
                          onPress={() => handlePickCategory(c.key)}
                          disabled={createReport.isPending}
                          activeOpacity={0.8}
                        >
                          <View style={s.catIcon}>
                            <Feather
                              name={categoryIcon(c.key)}
                              size={18}
                              color="#dc2626"
                            />
                          </View>
                          <Text style={s.catName} numberOfLines={1}>
                            {c.nameEn}
                          </Text>
                          {busy ? (
                            <ActivityIndicator size="small" color="#dc2626" />
                          ) : (
                            <Feather
                              name="chevron-right"
                              size={18}
                              color="#cbd5e1"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a0000",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 8,
    marginTop: 8,
  },
  incomingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  incomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  incomingTxt: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#f87171",
    letterSpacing: 2,
  },
  callerSection: { alignItems: "center", gap: 12, marginBottom: 28 },
  dangerCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(220,38,38,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  callerNumber: {
    fontSize: 30,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  callerUnknown: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(220,38,38,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.25)",
    paddingVertical: 14,
    width: "100%",
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statsCardLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  checkingTxt: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  statNum: { fontSize: 16, fontWeight: "700" as const, color: "#FFFFFF" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  statDiv: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 4,
  },
  warningBox: {
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  warningHindi: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#FF6713",
    textAlign: "center",
  },
  warningEnglish: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  scamTypeRow: { marginBottom: 28 },
  scamTypeBadge: {
    backgroundColor: "rgba(220,38,38,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scamTypeTxt: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#f87171",
    letterSpacing: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: "auto" as any,
  },
  blockBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  blockTxt: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  reportBtn: {
    flex: 1,
    backgroundColor: "rgba(249,115,22,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.4)",
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  reportTxt: {
    color: "#f97316",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  answerBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  answerTxt: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  answerRisk: {
    color: "#dc2626",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "80%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "800" as const,
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  sheetNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#dc2626",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  sheetClose: {
    padding: 6,
    marginLeft: 8,
    marginTop: -2,
  },
  sheetLoading: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
  catErrorTxt: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  catRetryBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#0B3D91",
    alignItems: "center",
    justifyContent: "center",
  },
  catRetryTxt: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  catScroll: {
    flexGrow: 0,
  },
  catScrollContent: {
    paddingBottom: 8,
    gap: 8,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  catRowBusy: {
    backgroundColor: "#fef2f2",
    borderColor: "rgba(220,38,38,0.25)",
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1e293b",
  },
  resultBox: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34,197,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  resultIconWarn: {
    backgroundColor: "rgba(245,158,11,0.12)",
  },
  resultIconErr: {
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#0f172a",
    textAlign: "center",
  },
  resultMsg: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  resultBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0B3D91",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: 24,
  },
  resultBtnTxt: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
