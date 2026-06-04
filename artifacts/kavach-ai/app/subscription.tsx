import { Feather } from "@expo/vector-icons";
import {
  getGetMySubscriptionQueryKey,
  getListMyPaymentsQueryKey,
  useCancelSubscription,
  useCreateSubscriptionOrder,
  useGetMySubscription,
  useGetSubscriptionPlans,
  useListMyPayments,
  useVerifySubscriptionPayment,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState, LoadingState } from "@/components/StateViews";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { formatIndianPhone } from "@/lib/phone";

const NAVY = "#0B3D91";
const SAFFRON = "#FF6713";
const GREEN = "#138808";

type PlanKey = "free" | "premium" | "family";

// react-native-razorpay is a native module — it only works inside an Android/iOS
// dev/production build, not in Expo Go or the web preview. Load it defensively so
// the screen still renders everywhere; the checkout button explains when it can't
// run natively.
function getRazorpayCheckout():
  | { open: (options: Record<string, unknown>) => Promise<RazorpaySuccess> }
  | null {
  if (Platform.OS === "web") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-razorpay");
    return (mod?.default ?? mod) ?? null;
  } catch {
    return null;
  }
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const PLAN_META: Record<
  PlanKey,
  { icon: keyof typeof Feather.glyphMap; color: string; bg: string }
> = {
  free: { icon: "shield", color: "#64748b", bg: "#f1f5f9" },
  premium: { icon: "star", color: SAFFRON, bg: "#fff7ed" },
  family: { icon: "users", color: NAVY, bg: "#EBF0FA" },
};

function formatINR(paise: number): string {
  const rupees = paise / 100;
  return Number.isInteger(rupees) ? `₹${rupees}` : `₹${rupees.toFixed(2)}`;
}

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [busyPlan, setBusyPlan] = useState<PlanKey | null>(null);

  const statusQuery = useGetMySubscription();
  const plansQuery = useGetSubscriptionPlans();
  const paymentsQuery = useListMyPayments();

  const createOrder = useCreateSubscriptionOrder();
  const verifyPayment = useVerifySubscriptionPayment();
  const cancel = useCancelSubscription();

  const bottomPad = (insets.bottom || 0) + 32;

  function refreshSubscriptionData() {
    queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListMyPaymentsQueryKey() });
  }

  async function handleUpgrade(plan: "premium" | "family", planName: string) {
    const Razorpay = getRazorpayCheckout();
    if (!Razorpay) {
      Alert.alert(
        t("subscription.checkoutUnavailableTitle"),
        t("subscription.checkoutUnavailableMsg"),
      );
      return;
    }

    setBusyPlan(plan);
    try {
      const order = await createOrder.mutateAsync({ data: { plan } });

      const result = await Razorpay.open({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: t("common.appName"),
        description: planName,
        prefill: {
          name: user?.fullName ?? undefined,
          contact: user?.phone ?? undefined,
        },
        theme: { color: NAVY },
      });

      await verifyPayment.mutateAsync({
        data: {
          orderId: order.orderId,
          paymentId: result.razorpay_payment_id,
          signature: result.razorpay_signature,
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refreshSubscriptionData();
      Alert.alert(
        t("subscription.successTitle"),
        t("subscription.successMsg", { plan: planName }),
      );
    } catch (err) {
      // A user-cancelled checkout reports code 0/2 — don't treat that as an error.
      const cancelled =
        err != null &&
        typeof err === "object" &&
        "code" in err &&
        ((err as { code?: number }).code === 0 ||
          (err as { code?: number }).code === 2);
      if (!cancelled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          t("subscription.failedTitle"),
          t("subscription.failedMsg"),
        );
      }
    } finally {
      setBusyPlan(null);
    }
  }

  function confirmCancel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const currentPlan = status.plan as PlanKey;
  const periodEnd = status.currentPeriodEnd
    ? new Date(status.currentPeriodEnd)
    : null;
  const periodEndStr = periodEnd
    ? periodEnd.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const statusBadge = status.isPremium
    ? status.cancelAtPeriodEnd
      ? { label: t("subscription.statusEnding"), color: SAFFRON }
      : { label: t("subscription.statusActive"), color: GREEN }
    : { label: t("subscription.statusFree"), color: "#64748b" };

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
              {status.isPremium
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

        {status.isPremium && periodEndStr ? (
          <Text style={s.renewNote}>
            {status.cancelAtPeriodEnd
              ? t("subscription.accessUntil", { date: periodEndStr })
              : t("subscription.renewsOn", { date: periodEndStr })}
          </Text>
        ) : null}

        {status.isPremium && !status.cancelAtPeriodEnd ? (
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
                {t("subscription.cancelRenewal")}
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
        const isCurrent = key === currentPlan && (status.isPremium || key === "free");
        const features = t(`subscription.plans.${key}.features`, {
          returnObjects: true,
        }) as string[];
        const featureList = Array.isArray(features) ? features : [];

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
                  {plan.premium ? formatINR(plan.amount) : t("subscription.free")}
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
                    key as "premium" | "family",
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
                    {status.isPremium
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
        {t("subscription.secureNote")}
      </Text>
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
});
