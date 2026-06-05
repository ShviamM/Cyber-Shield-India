import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { setAppLanguage } from "@/i18n";
import type { LanguageCode } from "@/i18n/languages";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";
const LOGO = require("../assets/images/icon.png");

/**
 * First-launch onboarding overlay. Shown once (gated by the `kv_onboarded` flag
 * in the root layout) on top of everything, before the login screen, so a new
 * user picks their language first and then sees the plain-language Guardian
 * explainer. Guardian protection is already ON by default (see AppContext); this
 * screen only explains it — no toggle is required.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [step, setStep] = useState<0 | 1>(0);

  async function pickLanguage(code: LanguageCode) {
    Haptics.selectionAsync();
    await setAppLanguage(code);
    setStep(1);
  }

  async function finish() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.setItem("kv_onboarded", "true");
    } catch {
      // ignore persistence failure; still proceed for this session
    }
    onDone();
  }

  return (
    <View
      style={[
        s.root,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={s.brandRow}>
        <View style={s.logoBox}>
          <Image source={LOGO} style={s.logoImg} resizeMode="cover" />
        </View>
        <View>
          <Text style={s.brandName}>
            Netra<Text style={{ color: SAFFRON }}>ksh</Text>
          </Text>
          <Text style={s.brandTag}>{t("auth.tagline")}</Text>
        </View>
      </View>

      {step === 0 ? (
        <View style={s.body}>
          <Text style={s.title}>{t("onboarding.languageTitle")}</Text>
          <Text style={s.sub}>{t("onboarding.languageSub")}</Text>
          <View style={{ height: 20 }} />
          <TouchableOpacity
            style={s.langBtn}
            onPress={() => pickLanguage("hi" as LanguageCode)}
            activeOpacity={0.85}
          >
            <Text style={s.langNative}>{t("onboarding.hindi")}</Text>
            <Feather name="chevron-right" size={22} color={NAVY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.langBtn}
            onPress={() => pickLanguage("en" as LanguageCode)}
            activeOpacity={0.85}
          >
            <Text style={s.langNative}>{t("onboarding.english")}</Text>
            <Feather name="chevron-right" size={22} color={NAVY} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.body}>
          <View style={s.shieldBadge}>
            <Feather name="shield" size={38} color="#fff" />
          </View>
          <Text style={s.title}>{t("onboarding.guardianTitle")}</Text>
          <Text style={s.sub}>{t("onboarding.guardianBody")}</Text>
          <View style={s.points}>
            {[
              t("onboarding.guardianPoint1"),
              t("onboarding.guardianPoint2"),
              t("onboarding.guardianPoint3"),
            ].map((p) => (
              <View key={p} style={s.pointRow}>
                <View style={s.pointTick}>
                  <Feather name="check" size={13} color="#fff" />
                </View>
                <Text style={s.pointTxt}>{p}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.cta} onPress={finish} activeOpacity={0.9}>
            <Text style={s.ctaTxt}>{t("onboarding.getStarted")}</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    zIndex: 60,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EBF0FA",
  },
  logoImg: { width: "100%", height: "100%" },
  brandName: { fontSize: 22, fontWeight: "800" as const, color: NAVY },
  brandTag: { fontSize: 12, color: "#64748b", marginTop: 1 },
  body: { flex: 1, paddingTop: 44 },
  title: { fontSize: 26, fontWeight: "800" as const, color: "#0f172a" },
  sub: { fontSize: 15, color: "#64748b", lineHeight: 22, marginTop: 8 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "rgba(11,61,145,0.12)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  langNative: { fontSize: 20, fontWeight: "700" as const, color: "#0f172a" },
  shieldBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  points: { marginTop: 24, gap: 16 },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pointTick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  pointTxt: { fontSize: 16, color: "#0f172a", fontWeight: "500" as const },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 18,
  },
  ctaTxt: { color: "#fff", fontSize: 17, fontWeight: "700" as const },
});
