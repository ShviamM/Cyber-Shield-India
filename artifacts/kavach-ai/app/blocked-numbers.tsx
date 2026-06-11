import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  blockNumber,
  getBlockedNumbers,
  isScreeningSupported,
  unblockNumber,
} from "@/lib/screening";
import { formatIndianPhone, isValidIndianPhone, phoneForApi } from "@/lib/phone";

const SAFFRON = "#FF6713";
const GREEN = "#138808";

export default function BlockedNumbersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const supported = isScreeningSupported();
  const [numbers, setNumbers] = React.useState<string[]>([]);
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(() => {
    setNumbers(getBlockedNumbers());
  }, []);

  const handleAdd = React.useCallback(() => {
    if (!isValidIndianPhone(input)) {
      setError(t("blockedNumbers.addInvalid"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const api = phoneForApi(input);
    if (!api) {
      setError(t("blockedNumbers.addInvalid"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (getBlockedNumbers().includes(api)) {
      setError(t("blockedNumbers.addDuplicate"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    blockNumber(api);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInput("");
    setError(null);
    refresh();
  }, [input, refresh, t]);

  // Re-read the on-device list every time the screen regains focus so a number
  // just blocked from the call popup shows up immediately.
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const confirmUnblock = (number: string) => {
    Haptics.selectionAsync();
    Alert.alert(
      t("blockedNumbers.unblockTitle"),
      t("blockedNumbers.unblockConfirm", { number: formatIndianPhone(number) }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("blockedNumbers.unblock"),
          style: "destructive",
          onPress: () => {
            unblockNumber(number);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={numbers}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={[s.intro, { color: colors.mutedForeground }]}>
              {supported ? t("blockedNumbers.intro") : t("blockedNumbers.unsupported")}
            </Text>
            {supported && (
              <View style={s.addBox}>
                <Text style={[s.addLabel, { color: colors.text }]}>
                  {t("blockedNumbers.addTitle")}
                </Text>
                <View style={s.addRow}>
                  <View
                    style={[
                      s.inputWrap,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[s.prefix, { color: colors.mutedForeground }]}>
                      +91
                    </Text>
                    <TextInput
                      style={[s.input, { color: colors.text }]}
                      value={input}
                      onChangeText={(v) => {
                        setInput(v);
                        if (error) setError(null);
                      }}
                      placeholder={t("blockedNumbers.addPlaceholder")}
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="phone-pad"
                      maxLength={10}
                      returnKeyType="done"
                      onSubmitEditing={handleAdd}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      s.addBtn,
                      { backgroundColor: input.length ? colors.danger : colors.border },
                    ]}
                    onPress={handleAdd}
                    disabled={!input.length}
                    activeOpacity={0.85}
                  >
                    <Feather name="slash" size={15} color="#fff" />
                    <Text style={s.addBtnTxt}>{t("blockedNumbers.addButton")}</Text>
                  </TouchableOpacity>
                </View>
                {error && <Text style={s.addError}>{error}</Text>}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={s.center}>
            <View style={[s.iconBox, { backgroundColor: "rgba(19,136,8,0.1)" }]}>
              <Feather name="shield" size={28} color={GREEN} />
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>
              {t("blockedNumbers.emptyTitle")}
            </Text>
            <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
              {t("blockedNumbers.emptySub")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              s.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={s.cardIcon}>
              <Feather name="slash" size={16} color={colors.danger} />
            </View>
            <Text style={[s.number, { color: colors.text }]} numberOfLines={1}>
              {formatIndianPhone(item)}
            </Text>
            <TouchableOpacity
              style={[s.unblockBtn, { borderColor: colors.border }]}
              onPress={() => confirmUnblock(item)}
              activeOpacity={0.8}
            >
              <Text style={[s.unblockTxt, { color: SAFFRON }]}>
                {t("blockedNumbers.unblock")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  intro: { fontSize: 13.5, lineHeight: 19, marginBottom: 6 },
  addBox: { marginTop: 10, marginBottom: 10 },
  addLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 6,
  },
  prefix: { fontSize: 15, fontWeight: "600" },
  input: { flex: 1, fontSize: 15, fontWeight: "600", padding: 0 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
  },
  addBtnTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  addError: { color: "#dc2626", fontSize: 12.5, marginTop: 6, fontWeight: "600" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 13.5, textAlign: "center", lineHeight: 19 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  number: { flex: 1, fontSize: 15, fontWeight: "700" },
  unblockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  unblockTxt: { fontSize: 13, fontWeight: "700" },
});
