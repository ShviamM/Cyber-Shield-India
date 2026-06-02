import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";
const BLUE = "#5AA9FF";
const BOOK = require("../assets/images/digital-dhokha.png");
const LOGO = require("../assets/images/icon.png");

/**
 * Animated cold-start splash: the shield "wakes up" with a pulsing protective
 * ring, the wordmark and tricolour sweep in, the tagline fades up, and the book
 * cover flashes in near the end before the whole screen fades out. Rendered as a
 * full-screen overlay by the root layout for a guaranteed minimum duration.
 */
export function LaunchScreen({
  exiting = false,
  onHidden,
}: {
  exiting?: boolean;
  onHidden?: () => void;
}) {
  const { t } = useTranslation();

  const rootOpacity = useSharedValue(1);
  const shieldScale = useSharedValue(0.6);
  const shieldOpacity = useSharedValue(0);
  const ring = useSharedValue(0);
  const titleY = useSharedValue(14);
  const titleOpacity = useSharedValue(0);
  const triW = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);
  const bookOpacity = useSharedValue(0);
  const bookScale = useSharedValue(0.8);

  useEffect(() => {
    shieldOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    shieldScale.value = withSequence(
      withTiming(1.08, { duration: 480, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220 }),
    );
    ring.value = withDelay(
      300,
      withRepeat(withTiming(1, { duration: 1700, easing: Easing.out(Easing.ease) }), -1, false),
    );
    titleOpacity.value = withDelay(450, withTiming(1, { duration: 500 }));
    titleY.value = withDelay(450, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    triW.value = withDelay(750, withTiming(76, { duration: 600, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    taglineY.value = withDelay(1000, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    bookOpacity.value = withDelay(
      1550,
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withDelay(650, withTiming(0, { duration: 450, easing: Easing.in(Easing.cubic) })),
      ),
    );
    bookScale.value = withDelay(
      1550,
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withDelay(650, withTiming(0.92, { duration: 450 })),
      ),
    );
  }, []);

  // The parent decides when the app is ready (auth resolved + minimum intro
  // time). Only then do we fade the overlay out and signal it can be unmounted,
  // so a slow cold start never reveals the app underneath prematurely.
  useEffect(() => {
    if (!exiting) return;
    rootOpacity.value = withTiming(
      0,
      { duration: 300, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished && onHidden) runOnJS(onHidden)();
      },
    );
  }, [exiting, onHidden]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const shieldStyle = useAnimatedStyle(() => ({
    opacity: shieldOpacity.value,
    transform: [{ scale: shieldScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - ring.value) * 0.45,
    transform: [{ scale: 1 + ring.value * 1.7 }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const triStyle = useAnimatedStyle(() => ({ width: triW.value }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const bookStyle = useAnimatedStyle(() => ({
    opacity: bookOpacity.value,
    transform: [{ scale: bookScale.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, s.root, rootStyle]}>
      <LinearGradient colors={["#0A2A6B", NAVY, "#06245C"]} style={StyleSheet.absoluteFill} />
      <View style={s.center}>
        <View style={s.shieldWrap}>
          <Animated.View style={[s.ring, ringStyle]} />
          <Animated.View style={[s.logoBox, shieldStyle]}>
            <Image source={LOGO} style={s.logoImg} resizeMode="cover" />
          </Animated.View>
        </View>
        <Animated.Text style={[s.title, titleStyle]}>
          Netra<Text style={{ color: SAFFRON }}>ksh</Text>
        </Animated.Text>
        <Animated.View style={[s.tricolor, triStyle]}>
          <View style={[s.triStrip, { backgroundColor: SAFFRON }]} />
          <View style={[s.triStrip, { backgroundColor: "#fff" }]} />
          <View style={[s.triStrip, { backgroundColor: GREEN }]} />
        </Animated.View>
        <Animated.Text style={[s.tagline, taglineStyle]}>{t("auth.tagline")}</Animated.Text>
      </View>

      <Animated.View style={[s.bookWrap, bookStyle]}>
        <Image source={BOOK} style={s.bookCover} resizeMode="cover" />
        <Text style={s.bookCaption}>{t("launch.bookCaption")}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { backgroundColor: NAVY, zIndex: 100, elevation: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  shieldWrap: { width: 120, height: 120, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ring: { position: "absolute", width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: SAFFRON },
  logoBox: {
    width: 84, height: 84, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  logoImg: { width: "100%", height: "100%" },
  title: { fontSize: 36, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  tricolor: { flexDirection: "row", height: 4, marginTop: 14, borderRadius: 2, overflow: "hidden" },
  triStrip: { flex: 1 },
  tagline: {
    fontSize: 16, fontWeight: "700", color: BLUE, marginTop: 16,
    letterSpacing: 0.2, textAlign: "center", paddingHorizontal: 24,
  },
  bookWrap: { position: "absolute", bottom: 76, left: 0, right: 0, alignItems: "center" },
  bookCover: {
    width: 92, height: 132, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  bookCaption: {
    color: "rgba(255,255,255,0.88)", fontSize: 12.5, fontWeight: "600",
    marginTop: 10, letterSpacing: 0.3,
  },
});
