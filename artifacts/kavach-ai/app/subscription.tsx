import { Feather } from "@expo/vector-icons";
import {
  getGetMySubscriptionQueryKey,
  getListMyPaymentsQueryKey,
  useCancelSubscription,
  useGetMySubscription,
  useGetSubscriptionPlans,
  useListMyPayments,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState, LoadingState } from "@/components/StateViews";
import { useColors } from "@/hooks/useColors";
import {
  IS_REVENUECAT_TEST_MODE,
  REVENUECAT_ENTITLEMENT_IDENTIFIER,
  useSubscription,
} from "@/lib/revenuecat";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

type PlanKey = "free" | "premium" | "family";
type PaidPlanKey = "premium" | "family";

const PLAN_META: Record<
  PlanKey,
  { icon: keyof typeof Feather.glyphMap; color: string; bg: string }
> = {
  free: { icon: "shield", color: "#64748b", bg: "#f1f5f9" },
  premium: { icon: "star", color: SAFFRON, bg: "#fff7ed" },
  family: { icon: "users", color: NAVY, bg: "#EBF0FA" },
};

/** RevenueCat package lookup keys, by plan (from the seeded "default" offering). */
const PACKAGE_ID: Record<PaidPlanKey, string> = {
  premium: "$rc_monthly",
  family: "family",
};

function formatINR(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(2)}`;
}

/** Map a store product identifier back to one of our plans (mirrors the server). */
function planFromProductId(productId?: string): PaidPlanKey | null {
  if (!productId) return null;
  const base = productId.split(":")[0];
  if (base === "premium_monthly") return "premium";
  if (base === "family_monthly") return "family";
  return null;
}

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const rc = useSubscription();

  const [busyPlan, setBusyPlan] = useState<PaidPlanKey | null>(null);
  // The plan awaiting confirmation in the test-mode purchase modal.
  const [pendingPlan, setPendingPlan] = useState<PaidPlanKey | null>(null);

  const statusQuery = useGetMySubscription();
  const plansQuery = useGetSubscriptionPlans();
  const paymentsQuery = useListMyPayments();
  const cancel = useCancelSubscription();

  const bottomPad = (insets.bottom || 0) + 32;

  // In-app subscriptions are sold through Google Play (via RevenueCat) on
  // native; the website keeps using Razorpay. The web preview falls back to a
  // "use the app" message since real billing only exists in the installed app.
  const storeBilling = Platform.OS !== "web" && rc.available;
  const offering = rc.offerings?.current ?? null;

  function packageForPlan(plan: PaidPlanKey): PurchasesPackage | null {
    if (!offering) return null;
    return (
      offering.availablePackages.find((p) => p.identifier === PACKAGE_ID[plan]) ??
      null
    );
  }

  function refreshSubscriptionData() {
    queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
  }

  async function runPurchase(plan: PaidPlanKey, planName: string) {
    const pkg = packageForPlan(plan);
    if (!pkg) {
      Alert.alert(
        t("subscription.checkoutUnavailableTitle"),
        t("subscription.checkoutUnavailableMsg"),
      );
      return;
    }
    setBusyPlan(plan);
    try {
      // The purchase must be attached to this account or the backend webhook
      // can't reconcile it — abort rather than buy anonymously.
      const linked = await rc.ensureIdentified();
      if (!linked) {
        Alert.alert(
          t("subscription.failedTitle"),
          t("subscription.linkAccountFailedMsg"),
        );
        return;
      }
      await rc.purchase(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // The backend reconciles via RevenueCat's webhook; refresh so the screen
      // reflects the new entitlement (RevenueCat state updates immediately).
      refreshSubscriptionData();
      Alert.alert(
        t("subscription.successTitle"),
        t("subscription.successMsg", { plan: planName }),
      );
    } catch (err) {
      // A user-cancelled purchase reports `userCancelled` — not an error.
      const cancelled =
        err != null &&
        typeof err === "object" &&
        "userCancelled" in err &&
        (err as { userCancelled?: boolean }).userCancelled === true;
      if (!cancelled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(t("subscription.failedTitle"), t("subscription.failedMsg"));
      }
    } finally {
      setBusyPlan(null);
    }
  }

  function handleUpgrade(plan: PaidPlanKey, planName: string) {
    if (!storeBilling) {
      Alert.alert(
        t("subscription.checkoutUnavailableTitle"),
        t("subscription.checkoutUnavailableMsg"),
      );
      return;
    }
    // Test/sandbox purchases don't show a native store sheet, so confirm via our
    // own modal first. Real Google Play purchases show the Play sheet directly.
    if (IS_REVENUECAT_TEST_MODE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPendingPlan(plan);
      return;
    }
    void runPurchase(plan, planName);
  }

  async function handleRestore() {
    try {
      const info = await rc.restore();
      const active =
        info.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER] !==
        undefined;
      if (active) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        refreshSubscriptionData();
        Alert.alert(
          t("subscription.restoredTitle"),
          t("subscription.restoredMsg"),
        );
      } else {
        Alert.alert(
          t("subscription.nothingToRestoreTitle"),
          t("subscription.nothingToRestoreMsg"),
        );
      }
    } catch {
      Alert.alert(t("subscription.failedTitle"), t("subscription.failedMsg"));
    }
  }

  function openStoreManagement() {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    Linking.openURL(url).catch(() => {});
  }

  function confirmCancel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // A store-billed subscription can only be cancelled where it was bought.
    if (storeBilling && rc.isSubscribed) {
      openStoreManagement();
      return;
    }
    Alert.alert(
      t("subscription.cancelConfirmTitle"),
      t("subscription.cancelConfirmMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("subscription.cancelConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancel.mutateAsync();
              refreshSubscriptionData();
            } catch {
              Alert.alert(
                t("subscription.failedTitle"),
                t("subscription.cancelFailedMsg"),
              );
            }
          },
        },
      ],
    );
  }

  if (statusQuery.isLoading || plansQuery.isLoading) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <LoadingState />
      </View>
    );
  }
  if (statusQuery.isError || plansQuery.isError) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <ErrorState
          message={t("subscription.loadError")}
          onRetry={() => {
            statusQuery.refetch();
            plansQuery.refetch();
          }}
        />
      </View>
    );
  }

  const status = statusQuery.data!;
  const plans = plansQuery.data!.plans;
  const payments = paymentsQuery.data?.payments ?? [];

  // Premium access is true if either the backend (website/Razorpay) or the
  // on-device RevenueCat entitlement (store purchase) says so.
  const premiumActive = status.isPremium || rc.isSubscribed;
  const currentPlan: PlanKey = status.isPremium
    ? (status.plan as PlanKey)
    : rc.isSubscribed
      ? (planFromProductId(rc.activeProductId) ?? "premium")
      : "free";

  const rcExpiration =
    rc.customerInfo?.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER]
      ?.expirationDate ?? null;
  const periodEnd = status.currentPeriodEnd
    ? new Date(status.currentPeriodEnd)
    : rcExpiration
      ? new Date(rcExpiration)
      : null;
  const periodEndStr = periodEnd
    ? periodEnd.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const statusBadge = premiumActive
    ? status.cancelAtPeriodEnd
      ? { label: t("subscription.statusEnding"), color: SAFFRON }
      : { label: t("subscription.statusActive"), color: GREEN }
    : { label: t("subscription.statusFree"), color: "#64748b" };

  const pendingPlanName = pendingPlan
    ? t(`subscription.plans.${pendingPlan}.name`)
    : "";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Current status */}
      <View style={s.statusCard}>
        <View style={s.statusTop}>
          <View
            style={[
              s.statusIconBg,
              { backgroundColor: PLAN_META[currentPlan].bg },
            ]}
          >
            <Feather
              name={PLAN_META[currentPlan].icon}
              size={22}
              color={PLAN_META[currentPlan].color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.statusPlanName}>
              {t(`subscription.plans.${currentPlan}.name`)}
            </Text>
            <Text style={s.statusSub}>
              {premiumActive
                ? t("subscription.currentPlanSub")
                : t("subscription.freePlanSub")}
            </Text>
          </View>
          <View
            style={[s.badge, { backgroundColor: `${statusBadge.color}1A` }]}
          >
            <Text style={[s.badgeTxt, { color: statusBadge.color }]}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {premiumActive && periodEndStr ? (
          <Text style={s.renewNote}>
            {status.cancelAtPeriodEnd
              ? t("subscription.accessUntil", { date: periodEndStr })
              : t("subscription.renewsOn", { date: periodEndStr })}
          </Text>
        ) : null}

        {premiumActive && !status.cancelAtPeriodEnd ? (
          <TouchableOpacity
            style={s.cancelLink}
            onPress={confirmCancel}
            disabled={cancel.isPending}
            activeOpacity={0.7}
          >
            {cancel.isPending ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Text style={s.cancelLinkTxt}>
                {storeBilling && rc.isSubscribed
                  ? t("subscription.manageOnStore")
                  : t("subscription.cancelRenewal")}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Plan comparison */}
      <Text style={s.sectionLabel}>{t("subscription.choosePlan")}</Text>
      {plans.map((plan) => {
        const key = plan.key as PlanKey;
        const meta = PLAN_META[key];
        const isCurrent =
          key === currentPlan && (premiumActive || key === "free");
        const features = t(`subscription.plans.${key}.features`, {
          returnObjects: true,
        }) as string[];
        const featureList = Array.isArray(features) ? features : [];

        // On native, show the live store price; fall back to server pricing.
        const storePkg = plan.premium
          ? packageForPlan(key as PaidPlanKey)
          : null;
        const priceLabel = plan.premium
          ? (storePkg?.product.priceString ?? formatINR(plan.amount))
          : t("subscription.free");

        return (
          <View
            key={key}
            style={[
              s.planCard,
              isCurrent && { borderColor: meta.color, borderWidth: 2 },
            ]}
          >
            <View style={s.planHeader}>
              <View style={[s.planIconBg, { backgroundColor: meta.bg }]}>
                <Feather name={meta.icon} size={18} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.planName}>
                  {t(`subscription.plans.${key}.name`)}
                </Text>
                <Text style={s.planTagline}>
                  {t(`subscription.plans.${key}.tagline`)}
                </Text>
              </View>
              <View style={s.priceCol}>
                <Text style={[s.price, { color: meta.color }]}>
                  {priceLabel}
                </Text>
                {plan.premium ? (
                  <Text style={s.priceUnit}>{t("subscription.perMonth")}</Text>
                ) : null}
              </View>
            </View>

            <View style={s.featureList}>
              {featureList.map((f, i) => (
                <View key={i} style={s.featureRow}>
                  <Feather name="check" size={14} color={GREEN} />
                  <Text style={s.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>

            {isCurrent ? (
              <View style={s.currentBtn}>
                <Feather name="check-circle" size={16} color={meta.color} />
                <Text style={[s.currentBtnTxt, { color: meta.color }]}>
                  {t("subscription.currentPlan")}
                </Text>
              </View>
            ) : plan.premium ? (
              <TouchableOpacity
                style={[s.upgradeBtn, { backgroundColor: meta.color }]}
                onPress={() =>
                  handleUpgrade(
                    key as PaidPlanKey,
                    t(`subscription.plans.${key}.name`),
                  )
                }
                disabled={busyPlan !== null}
                activeOpacity={0.85}
              >
                {busyPlan === key ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.upgradeBtnTxt}>
                    {premiumActive
                      ? t("subscription.switchTo", {
                          plan: t(`subscription.plans.${key}.name`),
                        })
                      : t("subscription.upgradeTo", {
                          plan: t(`subscription.plans.${key}.name`),
                        })}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {/* Restore purchases (store-billed only) */}
      {storeBilling ? (
        <TouchableOpacity
          style={s.restoreLink}
          onPress={handleRestore}
          disabled={rc.isRestoring}
          activeOpacity={0.7}
        >
          {rc.isRestoring ? (
            <ActivityIndicator size="small" color={NAVY} />
          ) : (
            <Text style={s.restoreLinkTxt}>
              {t("subscription.restorePurchases")}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}

      {/* Payment history */}
      {payments.length > 0 ? (
        <>
          <Text style={s.sectionLabel}>{t("subscription.history")}</Text>
          <View style={s.historyCard}>
            {payments.map((p, i) => {
              const paid = p.status === "paid";
              const created = new Date(p.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <View
                  key={p.id}
                  style={[s.historyRow, i < payments.length - 1 && s.historyBorder]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyPlan}>
                      {t(`subscription.plans.${p.plan as PlanKey}.name`)}
                    </Text>
                    <Text style={s.historyDate}>{created}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.historyAmount}>{formatINR(p.amount)}</Text>
                    <Text
                      style={[
                        s.historyStatus,
                        { color: paid ? GREEN : "#dc2626" },
                      ]}
                    >
                      {t(`subscription.payStatus.${p.status}`)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <Text style={s.secureNote}>
        <Feather name="lock" size={11} color="#94a3b8" />{" "}
        {storeBilling
          ? t("subscription.playSecureNote")
          : t("subscription.secureNote")}
      </Text>

      {/* Test-mode purchase confirmation (sandbox has no native store sheet) */}
      <Modal
        visible={pendingPlan !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingPlan(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              {t("subscription.testPurchaseTitle")}
            </Text>
            <Text style={s.modalMsg}>
              {t("subscription.testPurchaseMsg", { plan: pendingPlanName })}
            </Text>
            <View style={s.modalBtns}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnGhost]}
                onPress={() => setPendingPlan(null)}
                activeOpacity={0.8}
              >
                <Text style={s.modalBtnGhostTxt}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnPrimary]}
                onPress={() => {
                  const plan = pendingPlan;
                  setPendingPlan(null);
                  if (plan) {
                    void runPurchase(
                      plan,
                      t(`subscription.plans.${plan}.name`),
                    );
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={s.modalBtnPrimaryTxt}>
                  {t("subscription.testPurchaseConfirm")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(11,61,145,0.08)",
    shadowColor: NAVY,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 8,
  },
  statusTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusIconBg: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPlanName: { fontSize: 16, fontWeight: "800" as const, color: "#0f172a" },
  statusSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeTxt: { fontSize: 11, fontWeight: "700" as const },
  renewNote: { fontSize: 12, color: "#475569", marginTop: 14 },
  cancelLink: { marginTop: 12, alignSelf: "flex-start" },
  cancelLinkTxt: { fontSize: 13, fontWeight: "600" as const, color: "#dc2626" },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1,
    color: "#94a3b8",
    marginBottom: 10,
    marginTop: 22,
    textTransform: "uppercase",
  },

  planCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(11,61,145,0.08)",
    marginBottom: 12,
    shadowColor: NAVY,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  planName: { fontSize: 15, fontWeight: "800" as const, color: "#0f172a" },
  planTagline: { fontSize: 12, color: "#64748b", marginTop: 1 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 20, fontWeight: "900" as const },
  priceUnit: { fontSize: 10, color: "#94a3b8", marginTop: 1 },

  featureList: { marginTop: 14, gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureTxt: { fontSize: 13, color: "#334155", flex: 1 },

  upgradeBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  upgradeBtnTxt: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
  currentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 14,
    marginTop: 16,
    backgroundColor: "#f8fafc",
  },
  currentBtnTxt: { fontSize: 14, fontWeight: "700" as const },

  restoreLink: {
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  restoreLinkTxt: { fontSize: 13, fontWeight: "700" as const, color: NAVY },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(11,61,145,0.08)",
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  historyPlan: { fontSize: 14, fontWeight: "600" as const, color: "#0f172a" },
  historyDate: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: "700" as const, color: "#0f172a" },
  historyStatus: { fontSize: 11, fontWeight: "600" as const, marginTop: 2 },

  secureNote: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#0f172a",
    marginBottom: 8,
  },
  modalMsg: { fontSize: 14, color: "#475569", lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 22 },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnGhost: { backgroundColor: "#f1f5f9" },
  modalBtnGhostTxt: { fontSize: 14, fontWeight: "700" as const, color: "#475569" },
  modalBtnPrimary: { backgroundColor: NAVY },
  modalBtnPrimaryTxt: { fontSize: 14, fontWeight: "700" as const, color: "#fff" },
});
