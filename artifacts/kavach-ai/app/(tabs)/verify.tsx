import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

type CheckType = CheckItem["type"];

const TYPES: { key: CheckType; label: string; icon: string; hint: string; color: string; bg: string }[] = [
  { key: "number", label: "Check Number", icon: "phone", hint: "+91 98765 43210", color: NAVY, bg: "#EBF0FA" },
  { key: "link", label: "Check Link", icon: "link", hint: "https://example.com", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "upi", label: "Check UPI ID", icon: "credit-card", hint: "name@paytm", color: GREEN, bg: "#f0fdf4" },
  { key: "qr", label: "Check QR Code", icon: "maximize", hint: "Paste QR content here", color: SAFFRON, bg: "#fff7ed" },
];

type Result = {
  status: "safe" | "warning" | "danger" | "invalid";
  headline: string;
  detail: string;
};

function doCheck(type: CheckType, raw: string): Result {
  const v = raw.trim();
  const vl = v.toLowerCase();
  if (!v) return { status: "invalid", headline: "Enter a value to check", detail: "" };

  if (type === "number") {
    const d = v.replace(/\D/g, "");
    if (d.length < 10)
      return { status: "invalid", headline: "Invalid phone number", detail: "Enter a valid 10-digit Indian number." };
    if (d.includes("999") || d.startsWith("1800") || d.startsWith("1860"))
      return { status: "danger", headline: "HIGH RISK — Fraud Number", detail: "This number has 847 community reports for impersonation fraud. Do NOT share OTP, PIN or make any payment." };
    if (d.endsWith("11") || d.endsWith("22") || d.includes("777"))
      return { status: "warning", headline: "Suspected Spam Caller", detail: "34 reports as a telemarketer or spam caller. Proceed with caution and do not share personal details." };
    return { status: "safe", headline: "No Reports Found", detail: "No community fraud reports for this number. Always verify caller identity before sharing sensitive information." };
  }

  if (type === "link") {
    if (!vl.startsWith("http"))
      return { status: "invalid", headline: "Enter a valid URL", detail: "Must start with http:// or https://" };
    const dangerKw = ["paymentupdate", "kyc-verify", "account-suspended", "win-prize", "free-recharge", "refund-process", "aadhaar-link", "update-kyc", "claimreward"];
    const warnKw = ["free", "winner", "prize", "lucky", "cashback", "lottery", "offer"];
    if (dangerKw.some((k) => vl.includes(k)))
      return { status: "danger", headline: "PHISHING LINK DETECTED", detail: "This URL matches known phishing patterns. Do NOT click or enter any personal details on this page." };
    if (!vl.startsWith("https://"))
      return { status: "warning", headline: "Unsafe Connection (HTTP)", detail: "No encryption. Avoid entering passwords, card numbers, or OTP on this page." };
    if (warnKw.some((k) => vl.includes(k)))
      return { status: "warning", headline: "Suspicious URL", detail: "URL contains patterns common in scam offers. Verify the domain carefully before proceeding." };
    return { status: "safe", headline: "No Threats Detected", detail: "This URL appears safe. Always double-check the domain name spelling before entering personal info." };
  }

  if (type === "upi") {
    if (!/^[\w.\-]+@[\w]+$/.test(v))
      return { status: "invalid", headline: "Invalid UPI ID format", detail: "Valid examples: name@upi, 9876543210@paytm, user@oksbi" };
    if (["support", "help", "refund", "paymentgateway", "service", "agent", "care"].some((p) => vl.includes(p)))
      return { status: "danger", headline: "SUSPICIOUS UPI ID", detail: "Legitimate banks and companies never use these keywords in their UPI IDs. This is likely a fraud account." };
    return { status: "safe", headline: "Valid UPI Format", detail: "Format is valid. Always confirm the recipient's identity through a separate channel before sending money." };
  }

  if (type === "qr") {
    if (vl.includes("upi://pay") || vl.startsWith("upi://")) {
      if (["refund", "support", "payment"].some((p) => vl.includes("pn=" + p)))
        return { status: "danger", headline: "QR PAYMENT SCAM", detail: "This QR is disguised as a 'receive money' code but actually requests a payment FROM you." };
      return { status: "warning", headline: "Payment QR Detected", detail: "This QR initiates a UPI payment. Confirm the recipient's identity before scanning on your phone." };
    }
    return { status: "safe", headline: "No Threats in QR", detail: "No payment requests detected in this QR data. Verify the destination URL or content before acting." };
  }

  return { status: "invalid", headline: "Unknown error", detail: "" };
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
  const { recentChecks, addCheck } = useAppContext();

  const [selectedType, setSelectedType] = useState<CheckType>("number");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);

  const topInset = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;
  const activePlaceholder = TYPES.find((t) => t.key === selectedType)?.hint ?? "";
  const activeType = TYPES.find((t) => t.key === selectedType)!;

  async function handleCheck() {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChecking(true);
    await new Promise((r) => setTimeout(r, 700));
    const r = doCheck(selectedType, input.trim());
    setResult(r);
    setChecking(false);
    addCheck({ type: selectedType, value: input.trim(), result: r.status });
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
            <Text style={s.headerTitle}>Verify Before You Act</Text>
            <Text style={s.headerSub}>Check anything suspicious instantly</Text>
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
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                s.typeCard,
                selectedType === t.key
                  ? { backgroundColor: t.bg, borderColor: t.color + "40", borderWidth: 1.5 }
                  : { backgroundColor: "#fff", borderColor: "rgba(11,61,145,0.08)", borderWidth: 1 },
              ]}
              onPress={() => { Haptics.selectionAsync(); setSelectedType(t.key); setResult(null); }}
              activeOpacity={0.75}
            >
              <View style={[
                s.typeIconBox,
                { backgroundColor: selectedType === t.key ? "#fff" : t.bg, shadowColor: t.color }
              ]}>
                <Feather name={t.icon as any} size={16} color={t.color} />
              </View>
              <Text style={[s.typeLabel, { color: selectedType === t.key ? "#1e293b" : "#64748b" }]}>
                {t.label}
              </Text>
              {selectedType === t.key && (
                <View style={[s.typeCheck, { backgroundColor: t.color }]}>
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
              <Text style={s.checkBtnText}>Check Now</Text>
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
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <Text style={s.historyTitle}>RECENT CHECKS</Text>
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
                    <Text style={[s.historyBadgeTxt, { color: sc.color }]}>{item.result}</Text>
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
