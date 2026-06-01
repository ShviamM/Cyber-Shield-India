import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCurrentLanguage, setAppLanguage } from "@/i18n";
import { LANGUAGES, type LanguageCode } from "@/i18n/languages";
import { useColors } from "@/hooks/useColors";

const NAVY = "#0B3D91";
const GREEN = "#138808";

export default function LanguageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const active = (i18n.language as LanguageCode) ?? getCurrentLanguage();

  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 24;

  async function pick(code: LanguageCode) {
    Haptics.selectionAsync();
    await setAppLanguage(code);
    router.back();
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: bottomPad }}
      >
        <Text style={s.intro}>{t("language.intro")}</Text>

        <View style={s.card}>
          {LANGUAGES.map((lang, i) => {
            const isActive = active === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[s.row, i < LANGUAGES.length - 1 && s.rowBorder]}
                onPress={() => pick(lang.code)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.native, lang.rtl && s.rtl]}>{lang.native}</Text>
                  <Text style={s.label}>{lang.label}</Text>
                </View>
                {isActive ? (
                  <View style={s.check}>
                    <Feather name="check" size={16} color="#fff" />
                  </View>
                ) : (
                  <View style={s.circle} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  intro: { fontSize: 13, color: "#64748b", lineHeight: 19, marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
    shadowColor: NAVY,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  native: { fontSize: 16, fontWeight: "700" as const, color: "#0f172a" },
  rtl: { writingDirection: "rtl", textAlign: "right" },
  label: { fontSize: 12, color: "#64748b", marginTop: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
});
