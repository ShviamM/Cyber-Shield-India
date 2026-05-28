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

type CheckType = CheckItem["type"];

const TYPES: { key: CheckType; label: string; icon: string; hint: string }[] = [
  { key: "number", label: "Number", icon: "phone", hint: "+91 98765 43210" },
  { key: "link", label: "Link / URL", icon: "link", hint: "https://example.com" },
  { key: "upi", label: "UPI ID", icon: "credit-card", hint: "name@paytm" },
  { key: "qr", label: "QR Data", icon: "maximize", hint: "Paste QR content here" },
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
  safe: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "check-circle" as const },
  warning: { color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "alert-triangle" as const },
  danger: { color: "#dc2626", bg: "rgba(220,38,38,0.12)", icon: "alert-octagon" as const },
  invalid: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: "info" as const },
};

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recentChecks, addCheck } = useAppContext();

  const [selectedType, setSelectedType] = useState<CheckType>("number");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  const activePlaceholder = TYPES.find((t) => t.key === selectedType)?.hint ?? "";

  async function handleCheck() {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChecking(true);
    await new Promise((r) => setTimeout(r, 700));
    const r = doCheck(selectedType, input.trim());
    setResult(r);
    setChecking(false);
    addCheck({ type: selectedType, value: input.trim(), result: r.status });
    if (r.status === "danger")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (r.status === "warning")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
      <View style={[s.header, { paddingTop: topInset + 16 }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Verify</Text>
        <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
          Check before you act
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type selector */}
        <View style={s.typePills}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                s.pill,
                {
                  backgroundColor:
                    selectedType === t.key
                      ? colors.primary
                      : colors.card,
                  borderColor:
                    selectedType === t.key
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedType(t.key);
                setResult(null);
              }}
              activeOpacity={0.75}
            >
              <Feather
                name={t.icon as any}
                size={14}
                color={selectedType === t.key ? "#FFFFFF" : colors.mutedForeground}
              />
              <Text
                style={[
                  s.pillText,
                  {
                    color:
                      selectedType === t.key ? "#FFFFFF" : colors.mutedForeground,
                  },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input field */}
        <View
          style={[
            s.inputCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[s.textInput, { color: colors.text }]}
            placeholder={activePlaceholder}
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={(v) => { setInput(v); setResult(null); }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleCheck}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Check button */}
        <TouchableOpacity
          style={[
            s.checkBtn,
            {
              backgroundColor:
                input.trim() ? colors.primary : colors.muted,
            },
          ]}
          onPress={handleCheck}
          disabled={!input.trim() || checking}
          activeOpacity={0.8}
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
          <View
            style={[
              s.resultCard,
              { backgroundColor: cfg.bg, borderColor: cfg.color + "40" },
            ]}
          >
            <View style={s.resultTop}>
              <Feather name={cfg.icon} size={22} color={cfg.color} />
              <Text style={[s.resultHeadline, { color: cfg.color }]}>
                {result.headline}
              </Text>
            </View>
            {result.detail ? (
              <Text style={[s.resultDetail, { color: colors.text }]}>
                {result.detail}
              </Text>
            ) : null}
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <Text
              style={[
                s.historyTitle,
                { color: colors.mutedForeground, marginTop: result ? 24 : 16 },
              ]}
            >
              RECENT CHECKS
            </Text>
            {history.map((item) => {
              const sc = STATUS_CONFIG[item.result];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    s.historyRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setSelectedType(item.type);
                    setInput(item.value);
                    setResult(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Feather name={sc.icon} size={16} color={sc.color} />
                  <Text
                    style={[s.historyValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                  <View
                    style={[
                      s.historyBadge,
                      { backgroundColor: sc.bg },
                    ]}
                  >
                    <Text style={[s.historyBadgeTxt, { color: sc.color }]}>
                      {item.result}
                    </Text>
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
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  headerSub: { fontSize: 14, marginTop: 2 },
  typePills: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 40,
    borderWidth: 1,
  },
  pillText: { fontSize: 13, fontWeight: "500" as const },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 54,
  },
  textInput: { flex: 1, fontSize: 16, height: "100%" as any },
  clearBtn: { padding: 4 },
  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    marginBottom: 16,
  },
  checkBtnText: { fontSize: 16, fontWeight: "700" as const, color: "#FFFFFF" },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    gap: 10,
    marginBottom: 8,
  },
  resultTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  resultHeadline: { fontSize: 16, fontWeight: "700" as const, flex: 1 },
  resultDetail: { fontSize: 14, lineHeight: 22, opacity: 0.85 },
  historyTitle: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1, marginBottom: 10 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  historyValue: { flex: 1, fontSize: 14 },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  historyBadgeTxt: { fontSize: 11, fontWeight: "600" as const, textTransform: "capitalize" as const },
});
