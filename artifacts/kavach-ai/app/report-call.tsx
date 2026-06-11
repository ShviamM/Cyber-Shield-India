import { Feather } from "@expo/vector-icons";
import { useCreateReport } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CALL_REPORT_CATEGORY_KEYS,
  categoryIcon,
  type CallReportCategoryKey,
} from "@/constants/strings";
import { useNearbyCity } from "@/hooks/useNearbyCity";
import { formatIndianPhone, phoneForApi } from "@/lib/phone";

const NAVY = "#0B3D91";
const GREEN = "#138808";

type Phase = "pick" | "submitting" | "success" | "duplicate" | "rateLimited" | "error";

/**
 * One-tap post-call report. Reached from the persistent "report this call"
 * notification the native call-screening service posts at screen-time (it
 * survives the call, giving a Play-compliant post-call reporting moment without
 * any restricted call-state permission). The user taps a single call-type and
 * we submit immediately — minimal effort, maximum community signal.
 */
export default function ReportCallScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ number?: string | string[] }>();
  const rawNumber = Array.isArray(params.number) ? params.number[0] : params.number;
  const callerNumber = rawNumber && rawNumber.trim() ? rawNumber.trim() : "";
  const apiPhone = phoneForApi(callerNumber);
  const displayNumber = callerNumber ? formatIndianPhone(callerNumber) : "";

  // Passive: attach the city only if location was already granted — never
  // prompt for location just to report a call.
  const { city: detectedCity } = useNearbyCity({ prompt: false });
  const createReport = useCreateReport();

  const [phase, setPhase] = useState<Phase>("pick");
  const [pendingKey, setPendingKey] = useState<CallReportCategoryKey | null>(null);

  const bottomPad = (insets.bottom || 0) + 24;

  function dismiss() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }

  async function submit(key: CallReportCategoryKey) {
    if (!apiPhone || createReport.isPending) return;
    Haptics.selectionAsync();
    setPendingKey(key);
    setPhase("submitting");
    try {
      await createReport.mutateAsync({
        data: {
          phone: apiPhone,
          categoryKey: key,
          description: t(`reportCall.descriptions.${key}`),
          city: detectedCity ?? undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase("success");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPhase("duplicate");
      } else if (status === 429) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPhase("rateLimited");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPhase("error");
      }
    } finally {
      setPendingKey(null);
    }
  }

  // Result / terminal states.
  if (phase === "success" || phase === "duplicate" || phase === "rateLimited") {
    const isSuccess = phase === "success";
    return (
      <View style={[s.root, s.center, { paddingBottom: bottomPad }]}>
        <View style={[s.resultIcon, !isSuccess && s.resultIconWarn]}>
          <Feather
            name={isSuccess ? "check-circle" : "info"}
            size={44}
            color={isSuccess ? GREEN : "#f59e0b"}
          />
        </View>
        <Text style={s.resultTitle}>
          {phase === "duplicate"
            ? t("reportCall.duplicateTitle")
            : phase === "rateLimited"
              ? t("reportCall.rateLimitedTitle")
              : t("reportCall.successTitle")}
        </Text>
        <Text style={s.resultMsg}>
          {phase === "duplicate"
            ? t("reportCall.duplicateMsg")
            : phase === "rateLimited"
              ? t("reportCall.rateLimitedMsg")
              : t("reportCall.successMsg")}
        </Text>
        <TouchableOpacity style={s.doneBtn} onPress={dismiss} activeOpacity={0.85}>
          <Text style={s.doneBtnTxt}>{t("reportCall.done")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "error" || !apiPhone) {
    return (
      <View style={[s.root, s.center, { paddingBottom: bottomPad }]}>
        <View style={[s.resultIcon, s.resultIconErr]}>
          <Feather name="alert-triangle" size={44} color="#ef4444" />
        </View>
        <Text style={s.resultTitle}>{t("reportCall.errorTitle")}</Text>
        <Text style={s.resultMsg}>
          {apiPhone ? t("reportCall.errorMsg") : t("reportCall.invalidNumber")}
        </Text>
        {apiPhone ? (
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => setPhase("pick")}
            activeOpacity={0.85}
          >
            <Text style={s.doneBtnTxt}>{t("reportCall.retry")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.doneBtn} onPress={dismiss} activeOpacity={0.85}>
            <Text style={s.doneBtnTxt}>{t("reportCall.done")}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Picker.
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Feather name="phone-missed" size={22} color={NAVY} />
        </View>
        <Text style={s.title}>{t("reportCall.title")}</Text>
        <Text style={s.subtitle}>{t("reportCall.subtitle")}</Text>
        {!!displayNumber && <Text style={s.number}>{displayNumber}</Text>}
      </View>

      <View style={s.list}>
        {CALL_REPORT_CATEGORY_KEYS.map((key) => {
          const busy = pendingKey === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.row, busy && s.rowBusy]}
              onPress={() => submit(key)}
              disabled={createReport.isPending}
              activeOpacity={0.85}
            >
              <View style={s.rowIcon}>
                <Feather name={categoryIcon(key)} size={20} color={NAVY} />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>{t(`reportCall.types.${key}.title`)}</Text>
                <Text style={s.rowDesc} numberOfLines={1}>
                  {t(`reportCall.types.${key}.desc`)}
                </Text>
              </View>
              {busy ? (
                <ActivityIndicator size="small" color={NAVY} />
              ) : (
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={s.dismissBtn} onPress={dismiss} activeOpacity={0.7}>
        <Text style={s.dismissTxt}>{t("reportCall.notNow")}</Text>
      </TouchableOpacity>

      <Text style={s.disclaimer}>{t("reportCall.disclaimer")}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6FB" },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EBF0FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 21, fontWeight: "800" as const, color: "#0f172a", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  number: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: NAVY,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  list: { gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(11,61,145,0.1)",
  },
  rowBusy: { opacity: 0.7 },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF0FA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "700" as const, color: "#0f172a" },
  rowDesc: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  dismissBtn: { alignSelf: "center", marginTop: 22, padding: 10 },
  dismissTxt: { fontSize: 14, fontWeight: "600" as const, color: "#64748b" },
  disclaimer: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
    marginTop: 8,
    textAlign: "center",
  },
  resultIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(19,136,8,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultIconWarn: { backgroundColor: "rgba(245,158,11,0.12)" },
  resultIconErr: { backgroundColor: "rgba(239,68,68,0.12)" },
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
  doneBtn: {
    height: 52,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  doneBtnTxt: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
});
