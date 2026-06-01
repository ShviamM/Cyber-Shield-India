import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import i18n from "i18next";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEMO_NUMBER = "+91 87654-32100";

export default function CallAlertScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n: i18nInstance } = useTranslation();
  const params = useLocalSearchParams<{ number?: string | string[] }>();
  const rawNumber = Array.isArray(params.number) ? params.number[0] : params.number;
  const callerNumber = rawNumber && rawNumber.trim() ? rawNumber.trim() : DEMO_NUMBER;
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = (Platform.OS === "web" ? 34 : insets.bottom) + 20;

  const warnings = t("callAlert.warnings", { returnObjects: true }) as string[];
  const tEn = i18n.getFixedT("en");
  const englishWarnings = tEn("callAlert.warnings", { returnObjects: true }) as string[];
  const showEnglish = i18nInstance.language !== "en";

  const [warningIndex, setWarningIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const warningOpacity = useRef(new Animated.Value(1)).current;

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

  function handleBlock() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleReport() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }

  function handleAnswer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }

  const w = warnings[warningIndex];
  const wEn = englishWarnings[warningIndex];

  return (
    <View style={[s.root, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      {/* Close */}
      <TouchableOpacity
        style={s.closeBtn}
        onPress={() => router.back()}
        activeOpacity={0.75}
      >
        <Feather name="x" size={20} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      {/* Incoming tag */}
      <View style={s.incomingRow}>
        <View style={s.incomingDot} />
        <Text style={s.incomingTxt}>{t("callAlert.incoming")}</Text>
      </View>

      {/* Caller */}
      <View style={s.callerSection}>
        <Animated.View
          style={[s.dangerCircleOuter, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={s.dangerCircleInner}>
            <Feather name="phone-incoming" size={36} color="#FFFFFF" />
          </View>
        </Animated.View>
        <Text style={s.callerNumber}>{callerNumber}</Text>
        <Text style={s.callerUnknown}>{t("callAlert.unknownCaller")}</Text>
      </View>

      {/* Reports stats */}
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

      {/* Rotating warning */}
      <Animated.View style={[s.warningBox, { opacity: warningOpacity }]}>
        <Text style={s.warningHindi}>{w}</Text>
        {showEnglish && <Text style={s.warningEnglish}>{wEn}</Text>}
      </Animated.View>

      {/* Scam type tag */}
      <View style={s.scamTypeRow}>
        <View style={s.scamTypeBadge}>
          <Text style={s.scamTypeTxt}>{t("callAlert.scamType")}</Text>
        </View>
      </View>

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
          <Text style={s.answerRisk}>{t("callAlert.highRisk")}</Text>
        </TouchableOpacity>
      </View>
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
});
