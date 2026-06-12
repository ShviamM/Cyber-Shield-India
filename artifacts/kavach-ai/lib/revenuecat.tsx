import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

import { useAuth } from "@/context/AuthContext";
import { isDemoPhone } from "@/lib/demo";

const REVENUECAT_TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

/** Entitlement that unlocks paid features (matches the RevenueCat project). */
export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "premium";

/**
 * True whenever we talk to the RevenueCat *test store* instead of a real app
 * store — dev builds, Expo Go and web preview all use the sandbox. A sandbox
 * purchase never hits Google Play, so the paywall must add its own confirmation
 * step before "buying" there.
 */
export const IS_REVENUECAT_TEST_MODE =
  __DEV__ ||
  Platform.OS === "web" ||
  Constants.executionEnvironment === "storeClient";

function getRevenueCatApiKey(): string {
  if (
    !REVENUECAT_TEST_API_KEY ||
    !REVENUECAT_IOS_API_KEY ||
    !REVENUECAT_ANDROID_API_KEY
  ) {
    throw new Error("RevenueCat public API keys not found");
  }

  if (IS_REVENUECAT_TEST_MODE) return REVENUECAT_TEST_API_KEY;
  if (Platform.OS === "ios") return REVENUECAT_IOS_API_KEY;
  if (Platform.OS === "android") return REVENUECAT_ANDROID_API_KEY;
  return REVENUECAT_TEST_API_KEY;
}

let configured = false;

export function isRevenueCatConfigured(): boolean {
  return configured;
}

/** Configure the SDK once, at app start. Safe to call more than once. */
export function initializeRevenueCat(): void {
  if (configured) return;
  const apiKey = getRevenueCatApiKey();
  if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  configured = true;
}

/** Associate the RevenueCat customer with our account so purchases (and the
 * server-side webhook's app_user_id) map to this user. Best-effort. */
async function identifyRevenueCatUser(appUserId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(appUserId);
  } catch {
    // Non-fatal: purchases still work anonymously; the webhook just can't map.
  }
}

/** Reset to an anonymous customer on sign-out. Best-effort. */
async function resetRevenueCatUser(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // logOut throws for an already-anonymous user — harmless.
  }
}

function useSubscriptionContext() {
  const enabled = isRevenueCatConfigured();
  const { user } = useAuth();

  // Confirm the RevenueCat customer is our signed-in user before a purchase, so
  // the resulting transaction (and the backend webhook's app_user_id) maps to
  // an account. Returns false if we can't link — callers must abort the buy,
  // otherwise the purchase would be anonymous and never reconcile server-side.
  const ensureIdentified = useCallback(async (): Promise<boolean> => {
    if (!enabled || !user?.id) return false;
    try {
      const current = await Purchases.getAppUserID();
      if (current === user.id) return true;
      await Purchases.logIn(user.id);
      return true;
    } catch {
      return false;
    }
  }, [enabled, user?.id]);

  const customerInfoQuery = useQuery<CustomerInfo>({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: () => Purchases.getCustomerInfo(),
    enabled,
    staleTime: 60 * 1000,
  });

  const offeringsQuery = useQuery<PurchasesOfferings>({
    queryKey: ["revenuecat", "offerings"],
    queryFn: () => Purchases.getOfferings(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const restoreMutation = useMutation({
    mutationFn: () => Purchases.restorePurchases(),
    onSuccess: () => customerInfoQuery.refetch(),
  });

  // App store reviewers sign in to a demo account that has no real store
  // entitlement; unlock Premium for it on the client so every paid feature is
  // visible during review. Purely cosmetic (it grants no server-side paid
  // capability) and only ever matches the one configured demo number.
  const isDemoAccount = isDemoPhone(user?.phone);

  const isSubscribed =
    isDemoAccount ||
    customerInfoQuery.data?.entitlements.active?.[
      REVENUECAT_ENTITLEMENT_IDENTIFIER
    ] !== undefined;

  const activeProductId =
    customerInfoQuery.data?.entitlements.active?.[
      REVENUECAT_ENTITLEMENT_IDENTIFIER
    ]?.productIdentifier;

  return {
    available: enabled,
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    isSubscribed,
    activeProductId,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    ensureIdentified,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSubscriptionContext();
  const { status, user } = useAuth();
  const queryClient = useQueryClient();

  // Keep the RevenueCat customer in sync with our auth state so that store
  // purchases attach to the signed-in account (and the backend webhook can
  // reconcile them). Re-fetch customer info after a (de)identification.
  useEffect(() => {
    if (!isRevenueCatConfigured()) return;
    let cancelled = false;
    const sync = async () => {
      if (status === "authenticated" && user?.id) {
        await identifyRevenueCatUser(user.id);
      } else if (status === "unauthenticated") {
        await resetRevenueCatUser();
      } else {
        return;
      }
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: ["revenuecat"] });
      }
    };
    void sync();
    return () => {
      cancelled = true;
    };
  }, [status, user?.id, queryClient]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
