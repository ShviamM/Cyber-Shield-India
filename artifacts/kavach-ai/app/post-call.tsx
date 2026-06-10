import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { listCategories, useCreateReport } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
import { markLegitimate, markReported } from "@/lib/postcall";
import { blockNumber } from "@/lib/screening";

const DEMO_NUMBER = "+91 87654-32100";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

type ReportPhase =
  | "list"
  | "submitting"
  | "success"
  | "duplicate"
  | "rateLimited"
  | "error";

/**
 * Play-safe post-call prompt ("How was this call?"). It is shown when the app
 * is re-opened after the user answered a flagged call through Netraksh's alert
 * (see lib/postcall) — not via any call-state permission. Lets the user report,
 * block, or mark the caller legitimate, then dismisses.
 */
export default function PostCallScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ number?: string | string[] }>();
  const rawNumber = Array.isArray(params.number) ? params.number[0] : params.number;
  const callerNumber = rawNumber && rawNumber.trim() ? rawNumber.trim() : DEMO_NUMBER;

  const bottomInset = (Platform.OS === "web" ? 34 : insets.bottom) + 20;

  const apiPhone = phoneForApi(callerNumber);
  const displayNumber = formatIndianPhone(callerNumber);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportPhase, setReportPhase] = useState<ReportPhase>("list");
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    enabled: reportOpen,
  });
  const categories = categoriesQuery.data?.categories ?? [];
  const createReport = useCreateReport();

  function dismiss() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }

  function openReport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReportPhase(apiPhone ? "list" : "error");
    setReportOpen(true);
  }

  async function handleBlock() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (apiPhone) {
      blockNumber(apiPhone);
      await markReported(apiPhone);
    }
    dismiss();
  }

  async function handleLegitimate() {
    Haptics.selectionAsync();
    if (apiPhone) await markLegitimate(apiPhone);
    dismiss();
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
          description: t("postCall.reportAutoDescription"),
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markReported(apiPhone);
      setReportPhase("success");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await markReported(apiPhone);
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
    const wasDone =
      reportPhase === "success" ||
      reportPhase === "duplicate" ||
      reportPhase === "rateLimited";
    setReportOpen(false);
    setReportPhase("list");
    if (wasDone) dismiss();
  }

  return (
    <View style={[s.root, { paddingBottom: bottomInset }]}>
      <TouchableOpacity style={s.closeBtn} onPress={dismiss} activeOpacity={0.75}>
        <Feather name="x" size={22} color="#94a3b8" />
      </TouchableOpacity>

      <View style={s.header}>
        <View style={s.iconWrap}>
          <Feather name="phone-call" size={28} color={NAVY} />
        </View>
        <Text style={s.title}>{t("postCall.title")}</Text>
        <Text style={s.subtitle}>{t("postCall.subtitle")}</Text>
        <View style={s.numberPill}>
          <Feather name="user" size={14} color="#64748b" />
          <Text style={s.numberTxt}>{displayNumber}</Text>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionRow, s.reportRow]}
          onPress={openReport}
          activeOpacity={0.85}
        >
          <View style={[s.actionIcon, { backgroundColor: "#fee2e2" }]}>
            <Feather name="flag" size={20} color="#dc2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.actionLabel, { color: "#991b1b" }]}>
              {t("postCall.reportTitle")}
            </Text>
            <Text style={s.actionSub}>{t("postCall.reportSub")}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#fca5a5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionRow}
          onPress={handleBlock}
          activeOpacity={0.85}
        >
          <View style={[s.actionIcon, { backgroundColor: "#EBF0FA" }]}>
            <Feather name="shield-off" size={20} color={NAVY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.actionLabel}>{t("postCall.blockTitle")}</Text>
            <Text style={s.actionSub}>{t("postCall.blockSub")}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionRow}
          onPress={handleLegitimate}
          activeOpacity={0.85}
        >
          <View style={[s.actionIcon, { backgroundColor: "#f0fdf4" }]}>
            <Feather name="check-circle" size={20} color={GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.actionLabel}>{t("postCall.legitTitle")}</Text>
            <Text style={s.actionSub}>{t("postCall.legitSub")}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.dismissBtn} onPress={dismiss} activeOpacity={0.8}>
        <Text style={s.dismissTxt}>{t("postCall.dismiss")}</Text>
      </TouchableOpacity>

      {/* Scam-type report popup (mirrors the incoming-call alert flow). */}
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
                    ? t("postCall.reportDuplicateTitle")
                    : reportPhase === "rateLimited"
                      ? t("postCall.reportRateLimitedTitle")
                      : t("postCall.reportSuccessTitle")}
                </Text>
                <Text style={s.resultMsg}>
                  {reportPhase === "duplicate"
                    ? t("postCall.reportDuplicateMsg")
                    : reportPhase === "rateLimited"
                      ? t("postCall.reportRateLimitedMsg")
                      : t("postCall.reportSuccessMsg")}
                </Text>
                <TouchableOpacity
                  style={s.resultBtn}
                  onPress={closeReport}
                  activeOpacity={0.85}
                >
                  <Text style={s.resultBtnTxt}>{t("postCall.reportDone")}</Text>
                </TouchableOpacity>
              </View>
            ) : reportPhase === "error" ? (
              <View style={s.resultBox}>
                <View style={[s.resultIcon, s.resultIconErr]}>
                  <Feather name="alert-triangle" size={40} color="#ef4444" />
                </View>
                <Text style={s.resultTitle}>{t("postCall.reportErrorTitle")}</Text>
                <Text style={s.resultMsg}>
                  {apiPhone
                    ? t("postCall.reportErrorMsg")
                    : t("postCall.reportInvalidNumber")}
                </Text>
                {apiPhone ? (
                  <TouchableOpacity
                    style={s.resultBtn}
                    onPress={() => setReportPhase("list")}
                    activeOpacity={0.85}
                  >
                    <Text style={s.resultBtnTxt}>{t("postCall.reportRetry")}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={s.resultBtn}
                    onPress={closeReport}
                    activeOpacity={0.85}
                  >
                    <Text style={s.resultBtnTxt}>{t("postCall.reportDone")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <View style={s.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sheetTitle}>{t("postCall.reportSheetTitle")}</Text>
                    <Text style={s.sheetSubtitle}>
                      {t("postCall.reportSheetSubtitle")}
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
                    <Text style={s.catErrorTxt}>{t("report.categoryLoadError")}</Text>
                    <TouchableOpacity
                      style={s.catRetryBtn}
                      onPress={() => categoriesQuery.refetch()}
                      activeOpacity={0.85}
                    >
                      <Text style={s.catRetryTxt}>{t("postCall.reportRetry")}</Text>
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
                            <Feather name="chevron-right" size={18} color="#cbd5e1" />
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
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  closeBtn: { alignSelf: "flex-end", padding: 8 },
  header: { alignItems: "center", marginTop: 12, marginBottom: 28 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EBF0FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  numberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  numberTxt: { fontSize: 14, fontWeight: "700" as const, color: "#334155" },

  actions: { gap: 12 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  reportRow: { borderColor: "#fecaca", backgroundColor: "#fef2f2" },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 15, fontWeight: "700" as const, color: "#0f172a" },
  actionSub: { fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 16 },

  dismissBtn: { alignItems: "center", paddingVertical: 18, marginTop: 8 },
  dismissTxt: { fontSize: 14, fontWeight: "600" as const, color: "#94a3b8" },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: "80%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "800" as const, color: "#0f172a" },
  sheetSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  sheetNumber: { fontSize: 14, fontWeight: "700" as const, color: NAVY, marginTop: 6 },
  sheetClose: { padding: 4 },
  sheetLoading: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 12 },
  catErrorTxt: { fontSize: 13, color: "#64748b", textAlign: "center" },
  catRetryBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  catRetryTxt: { fontSize: 13, fontWeight: "700" as const, color: "#fff" },
  catScroll: { marginBottom: 8 },
  catScrollContent: { gap: 8, paddingBottom: 8 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  catRowBusy: { opacity: 0.6 },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { flex: 1, fontSize: 14, fontWeight: "600" as const, color: "#1e293b" },

  resultBox: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 8 },
  resultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultIconWarn: { backgroundColor: "#fef3c7" },
  resultIconErr: { backgroundColor: "#fee2e2" },
  resultTitle: {
    fontSize: 18,
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
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 24,
  },
  resultBtnTxt: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
});
