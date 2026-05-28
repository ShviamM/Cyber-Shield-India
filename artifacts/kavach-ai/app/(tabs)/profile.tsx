import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guardianActive, language, toggleGuardian, toggleLanguage } =
    useAppContext();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 80;

  const [notifications, setNotifications] = React.useState(true);

  function callHelpline() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL("tel:1930").catch(() => {});
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topInset + 16 }]}>
        <Text style={[s.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad }}
      >
        {/* User card */}
        <View
          style={[
            s.userCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[s.userAvatar, { backgroundColor: "rgba(255,103,19,0.15)" }]}>
            <Text style={[s.userAvatarTxt, { color: colors.primary }]}>R</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.userName, { color: colors.text }]}>
              Rahul Sharma
            </Text>
            <Text style={[s.userPhone, { color: colors.mutedForeground }]}>
              +91 98765 43210
            </Text>
          </View>
          <View
            style={[
              s.userBadge,
              {
                backgroundColor: guardianActive
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(100,116,139,0.12)",
              },
            ]}
          >
            <Feather
              name="shield"
              size={14}
              color={guardianActive ? "#4ade80" : colors.mutedForeground}
            />
            <Text
              style={[
                s.userBadgeTxt,
                {
                  color: guardianActive ? "#4ade80" : colors.mutedForeground,
                },
              ]}
            >
              {guardianActive ? "Protected" : "Paused"}
            </Text>
          </View>
        </View>

        {/* SOS button */}
        <TouchableOpacity
          style={[s.sosCard, { backgroundColor: "#7f1d1d", borderColor: "#dc262640" }]}
          onPress={callHelpline}
          activeOpacity={0.8}
        >
          <View style={[s.sosIconBg, { backgroundColor: "#dc2626" }]}>
            <Feather name="phone-call" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.sosTitle, { color: "#FFFFFF" }]}>
              Cyber Crime Helpline
            </Text>
            <Text style={[s.sosNumber, { color: "#fca5a5" }]}>
              Call 1930 immediately if you've been scammed
            </Text>
          </View>
          <Text style={[s.sosBigNum, { color: "#FFFFFF" }]}>1930</Text>
        </TouchableOpacity>

        {/* Settings */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
          PROTECTION
        </Text>
        <View
          style={[
            s.settingsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="shield"
            label="Guardian Mode"
            sub="Real-time scam call warnings"
            colors={colors}
            right={
              <Switch
                value={guardianActive}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleGuardian();
                }}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            isLast={false}
          />
          <SettingRow
            icon="bell"
            label="Threat Notifications"
            sub="Alerts for new scams in your city"
            colors={colors}
            right={
              <Switch
                value={notifications}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setNotifications(v);
                }}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            isLast={true}
          />
        </View>

        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
          LANGUAGE
        </Text>
        <View
          style={[
            s.settingsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => {
              Haptics.selectionAsync();
              toggleLanguage();
            }}
            activeOpacity={0.75}
          >
            <View
              style={[
                s.settingIconBg,
                { backgroundColor: "rgba(255,103,19,0.1)" },
              ]}
            >
              <Feather name="globe" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.settingLabel, { color: colors.text }]}>
                Display Language
              </Text>
              <Text style={[s.settingSub, { color: colors.mutedForeground }]}>
                {language === "hi" ? "हिंदी (Hindi)" : "English"}
              </Text>
            </View>
            <View
              style={[
                s.langToggle,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  s.langOption,
                  language === "hi" && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    s.langTxt,
                    { color: language === "hi" ? "#FFFFFF" : colors.mutedForeground },
                  ]}
                >
                  हि
                </Text>
              </View>
              <View
                style={[
                  s.langOption,
                  language === "en" && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    s.langTxt,
                    { color: language === "en" ? "#FFFFFF" : colors.mutedForeground },
                  ]}
                >
                  EN
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
          ABOUT
        </Text>
        <View
          style={[
            s.settingsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="info"
            label="About KavachAI"
            sub="Prevention-first cyber safety for India"
            colors={colors}
            right={<Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
            isLast={false}
          />
          <SettingRow
            icon="file-text"
            label="Privacy Policy"
            sub="How we protect your data"
            colors={colors}
            right={<Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
            isLast={false}
          />
          <SettingRow
            icon="star"
            label="Rate KavachAI"
            sub="Help us protect more Indians"
            colors={colors}
            right={<Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
            isLast={true}
          />
        </View>

        <Text style={[s.version, { color: colors.mutedForeground }]}>
          KavachAI v1.0.0 · Made with ❤️ for India
        </Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  sub,
  colors,
  right,
  isLast,
}: {
  icon: string;
  label: string;
  sub: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  right: React.ReactNode;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        s.settingRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[
          s.settingIconBg,
          { backgroundColor: "rgba(255,103,19,0.1)" },
        ]}
      >
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[s.settingSub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    marginBottom: 14,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarTxt: { fontSize: 22, fontWeight: "700" as const },
  userName: { fontSize: 18, fontWeight: "700" as const },
  userPhone: { fontSize: 13, marginTop: 2 },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  userBadgeTxt: { fontSize: 12, fontWeight: "600" as const },
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  sosIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sosTitle: { fontSize: 16, fontWeight: "700" as const },
  sosNumber: { fontSize: 12, marginTop: 2 },
  sosBigNum: { fontSize: 28, fontWeight: "800" as const },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  settingIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontWeight: "600" as const },
  settingSub: { fontSize: 12, marginTop: 1 },
  langToggle: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    gap: 2,
    padding: 2,
  },
  langOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  langTxt: { fontSize: 13, fontWeight: "700" as const },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
  },
});
