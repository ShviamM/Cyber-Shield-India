import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { checkNumber, listCategories } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckItem, useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { isValidIndianPhone, phoneForApi } from "@/lib/phone";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

type CheckType = CheckItem["type"];

const TYPE_META: { key: CheckType; icon: string; color: string; bg: string }[] = [
  { key: "number", icon: "phone", color: NAVY, bg: "#EBF0FA" },
  { key: "link", icon: "link", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "upi", icon: "credit-card", color: GREEN, bg: "#f0fdf4" },
  { key: "qr", icon: "maximize", color: SAFFRON, bg: "#fff7ed" },
];

const TYPE_KEY: Record<CheckType, string> = {
  number: "number",
  link: "link",
  upi: "upi",
  qr: "qr",
};

type Result = {
  status: "safe" | "warning" | "danger" | "invalid";
  headline: string;
  detail: string;
  /** Present for number checks fetched from the backend. */
  phone?: string;
  reportCount?: number;
  verifiedScam?: boolean;
  categories?: string[];
};

function doLocalCheck(type: CheckType, raw: string, t: TFunction): Result {
  const v = raw.trim();
  const vl = v.toLowerCase();
  if (!v) return { status: "invalid", headline: t("verify.enterValue"), detail: "" };

  if (type === "link") {
    if (!vl.startsWith("http"))
      return { status: "invalid", headline: t("verify.local.linkInvalidHeadline"), detail: t("verify.local.linkInvalidDetail") };
    const dangerKw = ["paymentupdate", "kyc-verify", "account-suspended", "win-prize", "free-recharge", "refund-process", "aadhaar-link", "update-kyc", "claimreward"];
    const warnKw = ["free", "winner", "prize", "lucky", "cashback", "lottery", "offer"];
    if (dangerKw.some((k) => vl.includes(k)))
      return { status: "danger", headline: t("verify.local.linkDangerHeadline"), detail: t("verify.local.linkDangerDetail") };
    if (!vl.startsWith("https://"))
      return { status: "warning", headline: t("verify.local.linkHttpHeadline"), detail: t("verify.local.linkHttpDetail") };
    if (warnKw.some((k) => vl.includes(k)))
      return { status: "warning", headline: t("verify.local.linkWarnHeadline"), detail: t("verify.local.linkWarnDetail") };
    return { status: "safe", headline: t("verify.local.linkSafeHeadline"), detail: t("verify.local.linkSafeDetail") };
  }

  if (type === "upi") {
    if (!/^[\w.\-]+@[\w]+$/.test(v))
      return { status: "invalid", headline: t("verify.local.upiInvalidHeadline"), detail: t("verify.local.upiInvalidDetail") };
    if (["support", "help", "refund", "paymentgateway", "service", "agent", "care"].some((p) => vl.includes(p)))
      return { status: "danger", headline: t("verify.local.upiDangerHeadline"), detail: t("verify.local.upiDangerDetail") };
    return { status: "safe", headline: t("verify.local.upiSafeHeadline"), detail: t("verify.local.upiSafeDetail") };
  }

  if (type === "qr") {
    if (vl.includes("upi://pay") || vl.startsWith("upi://")) {
      if (["refund", "support", "payment"].some((p) => vl.includes("pn=" + p)))
        return { status: "danger", headline: t("verify.local.qrDangerHeadline"), detail: t("verify.local.qrDangerDetail") };
      return { status: "warning", headline: t("verify.local.qrWarnHeadline"), detail: t("verify.local.qrWarnDetail") };
    }
    return { status: "safe", headline: t("verify.local.qrSafeHeadline"), detail: t("verify.local.qrSafeDetail") };
  }

  return { status: "invalid", headline: t("verify.local.unknownHeadline"), detail: "" };
}

const STATUS_CONFIG = {
  safe: { color: GREEN, bg: "rgba(19,136,8,0.08)", border: "rgba(19,136,8,0.2)", icon: "check-circle" as const },
  warning: { color: "#ea580c", bg: "rgba(234,88,12,0.08)", border: "rgba(234,88,12,0.2)", icon: "alert-triangle" as const },
  danger: { color: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)", icon: "alert-octagon" as const },
  invalid: { color: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)", icon: "info" as const },
};

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { recentChecks, addCheck } = useAppContext();

  const [selectedType, setSelectedType] = useState<CheckType>("number");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });
  const categoryName = (key: string) =>
    catData?.categories.find((c) => c.key === key)?.nameEn ?? key;

  const types = TYPE_META.map((m) => ({
    ...m,
    label: t(`verify.types.${TYPE_KEY[m.key]}Label`),
    hint: t(`verify.types.${TYPE_KEY[m.key]}Hint`),
  }));

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;
  const activePlaceholder = types.find((x) => x.key === selectedType)?.hint ?? "";
  const activeType = types.find((x) => x.key === selectedType)!;

  async function handleCheck() {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChecking(true);

    let r: Result;
    if (selectedType === "number") {
      if (!isValidIndianPhone(input)) {
        r = { status: "invalid", headline: t("verify.risk.unknown.headline"), detail: t("report.invalidPhone") };
      } else {
        try {
          const res = await checkNumber(phoneForApi(input) as string);
          const status =
            res.riskLevel === "high" ? "danger" : res.riskLevel === "medium" ? "warning" : "safe";
          r = {
            status,
            headline: t(`verify.risk.${res.riskLevel}.headline`),
            detail: t(`verify.risk.${res.riskLevel}.detail`),
            phone: res.phone,
            reportCount: res.reportCount,
            verifiedScam: res.verifiedScam,
            categories: res.categories,
          };
        } catch {
          r = { status: "invalid", headline: t("verify.checkFailed"), detail: "" };
        }
      }
    } else {
      await new Promise((res) => setTimeout(res, 700));
      r = doLocalCheck(selectedType, input.trim(), t);
    }

    setResult(r);
    setChecking(false);
    if (r.status !== "invalid") {
      addCheck({ type: selectedType, value: input.trim(), result: r.status });
    }
    if (r.status === "danger") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (r.status === "warning") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleClear() {
    setInput("");
    setResult(null);
    Haptics.selectionAsync();
  }

  const cfg = result ? STATUS_CONFIG[result.status] : null;
  const history = recentChecks.slice(0, 8);

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
          <View style={s.searchIconBox}>
            <Feather name="search" size={20} color={SAFFRON} />
          </View>
          <View>
            <Text style={s.headerTitle}>{t("verify.title")}</Text>
            <Text style={s.headerSub}>{t("verify.sub")}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tool type selector — 2×2 grid */}
        <View style={s.typeGrid}>
          {types.map((tp) => (
            <TouchableOpacity
              key={tp.key}
              style={[
                s.typeCard,
                selectedType === tp.key
                  ? { backgroundColor: tp.bg, borderColor: tp.color + "40", borderWidth: 1.5 }
                  : { backgroundColor: "#fff", borderColor: "rgba(11,61,145,0.08)", borderWidth: 1 },
              ]}
              onPress={() => { Haptics.selectionAsync(); setSelectedType(tp.key); setResult(null); }}
              activeOpacity={0.75}
            >
              <View style={[
                s.typeIconBox,
                { backgroundColor: selectedType === tp.key ? "#fff" : tp.bg, shadowColor: tp.color }
              ]}>
                <Feather name={tp.icon as any} size={16} color={tp.color} />
              </View>
              <Text style={[s.typeLabel, { color: selectedType === tp.key ? "#1e293b" : "#64748b" }]}>
                {tp.label}
              </Text>
              {selectedType === tp.key && (
                <View style={[s.typeCheck, { backgroundColor: tp.color }]}>
                  <Feather name="check" size={9} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Input field */}
        <View style={s.inputWrapper}>
          <View style={[s.inputPill, { backgroundColor: activeType.bg }]}>
            <Feather name={activeType.icon as any} size={16} color={activeType.color} />
          </View>
          <TextInput
            style={s.textInput}
            placeholder={activePlaceholder}
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={(v) => { setInput(v); setResult(null); }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleCheck}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Check button */}
        <TouchableOpacity
          style={[s.checkBtn, { backgroundColor: input.trim() ? NAVY : "#e2e8f0" }]}
          onPress={handleCheck}
          disabled={!input.trim() || checking}
          activeOpacity={0.85}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="search" size={18} color="#FFFFFF" />
              <Text style={s.checkBtnText}>{t("verify.checkNow")}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result card */}
        {result && cfg && (
          <View style={[s.resultCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <View style={s.resultTop}>
              <View style={[s.resultIconBox, { backgroundColor: cfg.color + "18" }]}>
                <Feather name={cfg.icon} size={20} color={cfg.color} />
              </View>
              <Text style={[s.resultHeadline, { color: cfg.color }]}>{result.headline}</Text>
            </View>
            {result.detail ? (
              <Text style={s.resultDetail}>{result.detail}</Text>
            ) : null}

            {result.reportCount !== undefined && (
              <View style={s.numberMeta}>
                <View style={s.metaRow}>
                  <Feather name="users" size={13} color="#475569" />
                  <Text style={s.metaTxt}>
                    {result.reportCount > 0
                      ? result.reportCount === 1
                        ? t("verify.reportCountOne")
                        : t("verify.reportCount", { n: result.reportCount })
                      : t("verify.noReports")}
                  </Text>
                </View>
                {result.verifiedScam && (
                  <View style={s.verifiedBadge}>
                    <Feather name="alert-octagon" size={11} color="#dc2626" />
                    <Text style={s.verifiedTxt}>{t("verify.verifiedScam")}</Text>
                  </View>
                )}
                {result.categories && result.categories.length > 0 && (
                  <View style={s.catChips}>
                    {result.categories.map((key) => (
                      <View key={key} style={s.catChip}>
                        <Text style={s.catChipTxt}>{categoryName(key)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={s.reportBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(`/report?phone=${encodeURIComponent(input.trim())}`);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="flag" size={14} color={SAFFRON} />
                  <Text style={s.reportBtnTxt}>{t("verify.reportThisNumber")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <Text style={s.historyTitle}>{t("verify.recentChecks")}</Text>
            {history.map((item) => {
              const sc = STATUS_CONFIG[item.result];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={s.historyRow}
                  onPress={() => { setSelectedType(item.type); setInput(item.value); setResult(null); }}
                  activeOpacity={0.75}
                >
                  <View style={[s.historyDot, { backgroundColor: sc.color + "18" }]}>
                    <Feather name={sc.icon} size={14} color={sc.color} />
                  </View>
                  <Text style={s.historyValue} numberOfLines={1}>{item.value}</Text>
                  <View style={[s.historyBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[s.historyBadgeTxt, { color: sc.color }]}>{t(`verify.status.${item.result}`)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { backgroundColor: NAVY, paddingBottom: 20 },
  tricolor: { flexDirection: "row", height: 3 },
  triStrip: { flex: 1 },
  headerContent: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 16, marginTop: 6,
  },
  searchIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: "#fff", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeCard: {
    width: "48.5%", borderRadius: 14, padding: 14, gap: 8, position: "relative",
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  typeIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  typeLabel: { fontSize: 12, fontWeight: "700" as const },
  typeCheck: {
    position: "absolute", top: 10, right: 10,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)",
    paddingHorizontal: 14, marginBottom: 12, height: 54,
    shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputPill: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, height: "100%" as any, color: "#0f172a" },
  clearBtn: { padding: 4 },
  checkBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 16, marginBottom: 16,
    shadowColor: NAVY, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  checkBtnText: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  resultCard: {
    borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 10, marginBottom: 8,
  },
  resultTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  resultIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  resultHeadline: { fontSize: 15, fontWeight: "700" as const, flex: 1 },
  resultDetail: { fontSize: 13, color: "#334155", lineHeight: 20, marginLeft: 50 },
  numberMeta: { marginTop: 4, gap: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaTxt: { fontSize: 13, color: "#475569", fontWeight: "600" as const },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    backgroundColor: "#fef2f2", borderColor: "rgba(220,38,38,0.25)", borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  verifiedTxt: { fontSize: 11, fontWeight: "700" as const, color: "#991b1b" },
  catChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  catChip: {
    backgroundColor: "rgba(11,61,145,0.07)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  catChipTxt: { fontSize: 11, fontWeight: "600" as const, color: NAVY },
  reportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#fff7ed", borderColor: "rgba(255,103,19,0.3)", borderWidth: 1.5,
    borderRadius: 12, paddingVertical: 12, marginTop: 2,
  },
  reportBtnTxt: { fontSize: 14, fontWeight: "700" as const, color: "#9a3412" },
  historyTitle: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 1,
    color: "#94a3b8", marginBottom: 10, marginTop: 8,
  },
  historyRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(11,61,145,0.07)",
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 8,
    shadowColor: NAVY, shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  historyDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  historyValue: { flex: 1, fontSize: 13, color: "#0f172a" },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  historyBadgeTxt: { fontSize: 10, fontWeight: "600" as const, textTransform: "capitalize" as const },
});
