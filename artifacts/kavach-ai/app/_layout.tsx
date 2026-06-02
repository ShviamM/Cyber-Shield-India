import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import Constants from "expo-constants";
import { Stack, useRouter, useSegments } from "expo-router";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LaunchScreen } from "@/components/LaunchScreen";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { initI18n } from "@/i18n";
import { getToken } from "@/lib/session";

SplashScreen.preventAutoHideAsync();

// Configure the generated API client once, at module load. Expo bundles run
// outside the web proxy and need an absolute URL to reach the API server.
const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
if (apiDomain) {
  setBaseUrl(`https://${apiDomain}`);
}
setAuthTokenGetter(getToken);

const queryClient = new QueryClient();

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
    const id = setTimeout(() => setMinElapsed(true), 2700);
    return () => clearTimeout(id);
  }, []);
  const launchExiting = minElapsed && status !== "loading";

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
    const inAuthGroup = segments[0] === "(auth)";
    if (status === "unauthenticated" && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (status === "authenticated" && inAuthGroup) {
      if (hasShareIntent && !shareHandledRef.current) {
        routeShareToVerify();
      } else if (!shareHandledRef.current) {
        router.replace("/(tabs)");
      }
    }
  }, [status, segments, router, hasShareIntent, routeShareToVerify]);

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
        <Stack.Screen name="screening" options={{ title: t("screening.title") }} />
        <Stack.Screen name="report" options={{ title: t("report.title") }} />
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
                  <AppProvider>
                    <RootLayoutNav />
                  </AppProvider>
                </AuthProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
