import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";

const BOOK_URL =
  "https://www.amazon.in/DIGITAL-DHOKHA-Unmasking-Frauds-Stealing/dp/B0GHYST8VT";

const COVER = require("../assets/images/digital-dhokha.png");

export function BookPromo() {
  const { t } = useTranslation();

  function buy() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(BOOK_URL).catch(() => {});
  }

  return (
    <View style={s.card}>
      <View style={s.row}>
        <Image
          source={COVER}
          style={s.cover}
          resizeMode="cover"
          accessible
          accessibilityLabel={t("book.title")}
        />
        <View style={s.info}>
          <Text style={s.eyebrow} numberOfLines={2}>
            {t("book.eyebrow")}
          </Text>
          <Text style={s.title} numberOfLines={1}>
            {t("book.title")}
          </Text>
          <Text style={s.author} numberOfLines={1}>
            {t("book.author")}
          </Text>
          <Text style={s.tagline} numberOfLines={3}>
            {t("book.tagline")}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={s.btn}
        onPress={buy}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("book.cta")}
      >
        <Feather name="shopping-cart" size={15} color="#fff" />
        <Text style={s.btnTxt}>{t("book.cta")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(90,169,255,0.25)",
    shadowColor: NAVY,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: { flexDirection: "row", gap: 14 },
  cover: {
    width: 84,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#060b18",
  },
  info: { flex: 1, justifyContent: "center" },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: SAFFRON,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: { fontSize: 19, fontWeight: "900", color: "#fff", letterSpacing: -0.4 },
  author: { fontSize: 12, fontWeight: "600", color: "#5AA9FF", marginTop: 2 },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    lineHeight: 17,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: SAFFRON,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  btnTxt: { fontSize: 14, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
});
