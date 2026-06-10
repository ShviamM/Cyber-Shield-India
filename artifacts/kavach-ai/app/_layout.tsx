import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import Constants from "expo-constants";
import { Stack, useRouter, useSegments } from "expo-router";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState, type AppStateStatus, LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LaunchScreen } from "@/components/LaunchScreen";
import { Onboarding } from "@/components/Onboarding";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { initI18n } from "@/i18n";
import {
  clearPendingPostCall,
  evaluatePending,
  getPendingPostCall,
  ingestNativePending,
} from "@/lib/postcall";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";
import { syncScreeningApiConfig } from "@/lib/screening";
import { getToken } from "@/lib/session";

SplashScreen.preventAutoHideAsync();

// The MSG91 OTP SDK ships an optional biometric native module we don't use. When
// it isn't linked into the dev build, the SDK logs a console.error at load time
// ("BiometricAuth is undefined..."). OTP send/verify works regardless, so we
// silence this specific, harmless log to avoid a misleading red error overlay.
LogBox.ignoreLogs([/BiometricAuth is undefined/]);

// Configure the generated API client once, at module load. Expo bundles run
// outside the web proxy and need an absolute URL to reach the API server.
const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (apiDomain) {
  setBaseUrl(`https://${apiDomain}`);
}
setAuthTokenGetter(getToken);

const queryClient = new QueryClient();

// Configure RevenueCat once at module load (before any purchase UI mounts). It
// runs in test/preview mode in Expo Go and on web, so this is safe everywhere;
// a failure must never block app startup.
try {
  initializeRevenueCat();
} catch (err) {
  console.warn("RevenueCat unavailable:", err);
}

// Expo Go can't load the share-intent native module; disable it there so the
// preview keeps working. Dev/production builds report a non-"expo" ownership.
const isExpoGo = Constants.appOwnership === "expo";

function RootLayoutNav() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { t } = useTranslation();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  // Dedupes a single share so the auth-redirect and foreground effects below
  // don't both navigate (which would otherwise let "/(tabs)" override Verify).
  const shareHandledRef = useRef(false);

  // Animated launch overlay lifecycle: it stays fully opaque (a branded loading
  // state with a pulsing ring) until the app is actually ready — auth resolved
  // AND a minimum intro time elapsed — then fades out and unmounts. This keeps a
  // slow cold start from revealing the app underneath prematurely.
  const [minElapsed, setMinElapsed] = useState(false);
  const [launchHidden, setLaunchHidden] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), 5000);
    return () => clearTimeout(id);
  }, []);
  // An incoming-call deep link (kavach-ai://call-alert) must feel like a
  // lightweight Truecaller-style popup, NOT a full app launch. When the app is
  // resolving onto the call-alert route we skip the branded LaunchScreen, the
  // onboarding gate, and the unauthenticated→login redirect so the caller card
  // appears immediately instead of cold-starting into the home screen.
  const isCallAlert = segments[0] === "call-alert";
  const launchExiting = isCallAlert || (minElapsed && status !== "loading");

  // Push the API base + session token to the native call-screening service so it
  // can look up an incoming caller's scam reputation even when no JS is running.
  // The value persists natively, so syncing once on launch (and re-syncing when
  // auth changes) covers calls that arrive long after the app is backgrounded.
  useEffect(() => {
    if (status === "loading") return;
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!domain) return;
    let cancelled = false;
    (async () => {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch {
        token = null;
      }
      if (!cancelled) syncScreeningApiConfig(`https://${domain}`, token);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // First-launch onboarding (language pick + Guardian explainer). Null until the
  // stored flag resolves so we never flash it for a returning user.
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("kv_onboarded")
      .then((v) => setOnboarded(v === "true"))
      .catch(() => setOnboarded(true));
  }, []);

  // Sends a message/link shared into Netraksh from another app (WhatsApp, SMS, a
  // browser, …) to the Verify tab, prefilled and auto-run. Reuses the verify
  // screen's existing `q` prefill (kind is inferred there via detectType).
  const routeShareToVerify = useCallback(() => {
    shareHandledRef.current = true;
    const raw = (shareIntent.text ?? shareIntent.webUrl ?? "").trim();
    // Clear first so re-foregrounding can't re-trigger the same check.
    resetShareIntent();
    if (!raw) {
      router.replace("/(tabs)");
      return;
    }
    router.replace({ pathname: "/(tabs)/verify", params: { q: raw } });
  }, [shareIntent, resetShareIntent, router]);

  // Auth gate + post-login destination. A pending share takes priority over the
  // default tab so shared content survives the login redirect. Once a share has
  // been routed, suppress the generic "/(tabs)" redirect until the navigation
  // settles, otherwise it would clobber the Verify route.
  useEffect(() => {
    if (status === "loading") return;
    // Wait for the router to resolve a concrete route before gating. During the
    // brief unresolved phase `segments` is `[]`, and acting then can fire the
    // login redirect before a `call-alert` deep link resolves — recreating the
    // "wrong first screen" race for an incoming call on a signed-out device.
    if ((segments as string[]).length === 0) return;
    const inAuthGroup = segments[0] === "(auth)";
    // The incoming-call popup must show even when signed out (the reputation
    // lookup works anonymously), so never bounce the call-alert route to login.
    if (status === "unauthenticated" && !inAuthGroup && !isCallAlert) {
      router.replace("/(auth)/login");
    } else if (status === "authenticated" && inAuthGroup) {
      if (hasShareIntent && !shareHandledRef.current) {
        routeShareToVerify();
      } else if (!shareHandledRef.current) {
        router.replace("/(tabs)");
      }
    }
  }, [status, segments, router, hasShareIntent, routeShareToVerify]);

  // Play-safe post-call prompt. We can't detect a call ending without restricted
  // phone permissions, so when the user answers a flagged call through Netraksh's
  // alert we record it (see lib/postcall); here, the FIRST time the app returns
  // to the foreground afterwards, we surface "How was this call?" for that
  // number. We only act on a background→active transition so the prompt can't
  // appear over the live call the user just answered.
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const cameToForeground = prev.match(/inactive|background/) && next === "active";
      if (!cameToForeground) return;
      if (status !== "authenticated") return;
      // Don't interrupt an active incoming-call screen or a prompt already up.
      if (segments[0] === "call-alert" || segments[0] === "post-call") return;
      (async () => {
        // Pull any call the native overlay screened while the app was away into
        // the JS pending record first, so the prompt covers calls the user
        // didn't answer through the in-app alert.
        await ingestNativePending();
        const pending = await getPendingPostCall();
        if (!pending) return;
        const decision = await evaluatePending(pending);
        // Keep the record on "defer" (too soon / feature off) so a later
        // foreground can re-evaluate it within the time window.
        if (decision === "defer") return;
        await clearPendingPostCall();
        if (decision === "show") {
          router.push({ pathname: "/post-call", params: { number: pending.number } });
        }
      })();
    });
    return () => sub.remove();
  }, [status, segments, router]);

  // A share received while already signed in and inside the app (app foregrounded
  // from another app's Share sheet). The auth effect above owns the post-login
  // case; here we only act once we're outside the auth group. The dedupe ref is
  // reset only after we've fully left the auth group so the auth effect can't
  // re-fire its default redirect over a just-routed share.
  useEffect(() => {
    if (!hasShareIntent) {
      if (segments[0] !== "(auth)") shareHandledRef.current = false;
      return;
    }
    if (shareHandledRef.current) return;
    if (status !== "authenticated") return;
    if (segments[0] === "(auth)") return;
    routeShareToVerify();
  }, [hasShareIntent, status, segments, routeShareToVerify]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerBackTitle: t("common.back") }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="call-alert"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="post-call"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{ title: t("notifications.title") }}
        />
        <Stack.Screen name="screening" options={{ title: t("screening.title") }} />
        <Stack.Screen
          name="blocked-numbers"
          options={{ title: t("blockedNumbers.title") }}
        />
        <Stack.Screen name="report" options={{ title: t("report.title") }} />
        <Stack.Screen
          name="subscription"
          options={{ title: t("subscription.title") }}
        />
        <Stack.Screen name="categories" options={{ title: t("categories.title") }} />
        <Stack.Screen name="safety" options={{ title: t("safety.title") }} />
        <Stack.Screen name="helpline" options={{ title: t("helpline.title") }} />
        <Stack.Screen name="language" options={{ title: t("language.title") }} />
        <Stack.Screen name="about" options={{ title: t("about.title") }} />
        <Stack.Screen name="privacy" options={{ title: t("privacy.title") }} />
      </Stack>
      {launchHidden ? null : (
        <LaunchScreen exiting={launchExiting} onHidden={() => setLaunchHidden(true)} />
      )}
      {launchHidden && onboarded === false && !isCallAlert ? (
        <Onboarding onDone={() => setOnboarded(true)} />
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) return null;

  return (
    <ShareIntentProvider options={{ debug: false, resetOnBackground: true, disabled: isExpoGo }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <AppProvider>
                      <RootLayoutNav />
                    </AppProvider>
                  </SubscriptionProvider>
                </AuthProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
