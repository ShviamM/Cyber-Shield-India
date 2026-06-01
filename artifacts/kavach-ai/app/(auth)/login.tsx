import { Feather } from "@expo/vector-icons";
import { useRequestOtp, useVerifyOtp } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { isValidIndianPhone, formatIndianPhone } from "@/lib/phone";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

const RESEND_SECONDS = 30;

type Step = "phone" | "details" | "otp";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [code, setCode] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function startResendTimer() {
    setResendIn(RESEND_SECONDS);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function sendOtp(advance: boolean) {
    if (!isValidIndianPhone(phone)) {
      setError(t("auth.invalidPhone"));
      return;
    }
    setError(null);
    try {
      const res = await requestOtp.mutateAsync({ data: { phone } });
      setIsNewUser(res.isNewUser);
      setDevOtp(res.devOtp ?? null);
      startResendTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (advance) setStep(res.isNewUser ? "details" : "otp");
    } catch {
      setError(t("auth.requestFailed"));
    }
  }

  function goToOtpFromDetails() {
    if (!fullName.trim()) {
      setError(t("auth.nameRequired"));
      return;
    }
    setError(null);
    setStep("otp");
  }

  async function handleVerify() {
    if (code.trim().length !== 6) {
      setError(t("auth.invalidOtp"));
      return;
    }
    setError(null);
    try {
      const auth = await verifyOtp.mutateAsync({
        data: {
          phone,
          code: code.trim(),
          fullName: isNewUser ? fullName.trim() : undefined,
          location: isNewUser && location.trim() ? location.trim() : undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await signIn(auth);
      // root layout's auth gate redirects into the app
    } catch {
      setError(t("auth.verifyFailed"));
    }
  }

  function resetToPhone() {
    setStep("phone");
    setCode("");
    setError(null);
  }

  const sending = requestOtp.isPending;
  const verifying = verifyOtp.isPending;

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logoBox}>
            <Feather name="shield" size={30} color={SAFFRON} />
          </View>
          <Text style={s.logoTitle}>
            Kavach<Text style={{ color: SAFFRON }}>AI</Text>
          </Text>
          <View style={s.tricolor}>
            <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
            <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
            <View style={[s.triStrip, { backgroundColor: GREEN }]} />
          </View>
        </View>

        {step === "phone" && (
          <View style={s.card}>
            <Text style={s.title}>{t("auth.welcomeTitle")}</Text>
            <Text style={s.sub}>{t("auth.welcomeSub")}</Text>

            <Text style={s.label}>{t("auth.phoneLabel")}</Text>
            <View style={s.phoneRow}>
              <View style={s.prefixBox}>
                <Text style={s.prefixTxt}>+91</Text>
              </View>
              <TextInput
                style={s.phoneInput}
                placeholder={t("auth.phonePlaceholder")}
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  setError(null);
                }}
                keyboardType="phone-pad"
                maxLength={15}
                returnKeyType="done"
                onSubmitEditing={() => sendOtp(true)}
              />
            </View>
            <Text style={s.hint}>{t("auth.phoneHint")}</Text>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <PrimaryButton
              label={t("auth.sendOtp")}
              loading={sending}
              onPress={() => sendOtp(true)}
            />
          </View>
        )}

        {step === "details" && (
          <View style={s.card}>
            <Text style={s.title}>{t("auth.detailsTitle")}</Text>
            <Text style={s.sub}>{t("auth.detailsSub")}</Text>

            <Text style={s.label}>{t("auth.nameLabel")}</Text>
            <TextInput
              style={s.input}
              placeholder={t("auth.namePlaceholder")}
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                setError(null);
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={s.label}>{t("auth.locationLabel")}</Text>
            <TextInput
              style={s.input}
              placeholder={t("auth.locationPlaceholder")}
              placeholderTextColor="#94a3b8"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={goToOtpFromDetails}
            />
            <Text style={s.hint}>{t("common.optional")}</Text>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <PrimaryButton label={t("common.continue")} onPress={goToOtpFromDetails} />
            <TouchableOpacity style={s.linkBtn} onPress={resetToPhone}>
              <Text style={s.linkTxt}>{t("auth.changeNumber")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "otp" && (
          <View style={s.card}>
            <Text style={s.title}>{t("auth.otpTitle")}</Text>
            <Text style={s.sub}>
              {t("auth.otpSubPrefix")}
              <Text style={s.bold}>{formatIndianPhone(phone)}</Text>
            </Text>

            {devOtp ? (
              <View style={s.devBox}>
                <Feather name="info" size={13} color={NAVY} />
                <Text style={s.devTxt}>
                  {t("auth.devOtpPrefix")}
                  {devOtp}
                </Text>
              </View>
            ) : null}

            <TextInput
              style={s.otpInput}
              placeholder={t("auth.otpPlaceholder")}
              placeholderTextColor="#94a3b8"
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            {error ? <Text style={s.error}>{error}</Text> : null}

            <PrimaryButton label={t("auth.verify")} loading={verifying} onPress={handleVerify} />

            <TouchableOpacity
              style={s.linkBtn}
              disabled={resendIn > 0 || sending}
              onPress={() => sendOtp(false)}
            >
              <Text style={[s.linkTxt, resendIn > 0 && { color: "#94a3b8" }]}>
                {resendIn > 0 ? t("auth.resendIn", { seconds: resendIn }) : t("auth.resend")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.linkBtn} onPress={resetToPhone}>
              <Text style={s.linkTxt}>{t("auth.changeNumber")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PrimaryButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.btn, loading && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={s.btnTxt}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: NAVY },
  scroll: { flexGrow: 1, paddingHorizontal: 22, justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  logoTitle: { fontSize: 28, fontWeight: "900" as const, color: "#fff", letterSpacing: -0.5 },
  tricolor: { flexDirection: "row", height: 3, width: 60, marginTop: 10, borderRadius: 2, overflow: "hidden" },
  triStrip: { flex: 1 },
  card: {
    backgroundColor: "#fff", borderRadius: 22, padding: 22,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: { fontSize: 21, fontWeight: "800" as const, color: "#0f172a", letterSpacing: -0.3 },
  sub: { fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 19, marginBottom: 20 },
  bold: { fontWeight: "700" as const, color: "#0f172a" },
  label: { fontSize: 12, fontWeight: "700" as const, color: "#475569", marginBottom: 8, marginTop: 6 },
  input: {
    height: 52, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    paddingHorizontal: 14, fontSize: 15, color: "#0f172a", backgroundColor: "#fff",
  },
  phoneRow: { flexDirection: "row", gap: 10 },
  prefixBox: {
    height: 52, paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#EBF0FA",
    alignItems: "center", justifyContent: "center",
  },
  prefixTxt: { fontSize: 15, fontWeight: "700" as const, color: NAVY },
  phoneInput: {
    flex: 1, height: 52, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    paddingHorizontal: 14, fontSize: 16, color: "#0f172a", letterSpacing: 1,
  },
  otpInput: {
    height: 56, borderWidth: 1.5, borderColor: "rgba(11,61,145,0.12)", borderRadius: 14,
    paddingHorizontal: 14, fontSize: 22, color: "#0f172a", letterSpacing: 8, textAlign: "center",
    fontWeight: "700" as const,
  },
  hint: { fontSize: 11, color: "#94a3b8", marginTop: 8 },
  error: { fontSize: 13, color: "#dc2626", marginTop: 12, fontWeight: "600" as const },
  btn: {
    height: 52, borderRadius: 14, backgroundColor: NAVY,
    alignItems: "center", justifyContent: "center", marginTop: 20,
  },
  btnTxt: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  linkBtn: { alignItems: "center", paddingVertical: 10, marginTop: 4 },
  linkTxt: { fontSize: 13, fontWeight: "600" as const, color: NAVY },
  devBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#EBF0FA", borderRadius: 10, padding: 10, marginBottom: 16,
  },
  devTxt: { fontSize: 13, fontWeight: "700" as const, color: NAVY, letterSpacing: 1 },
});
