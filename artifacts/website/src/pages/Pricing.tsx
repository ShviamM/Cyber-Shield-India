import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { openCheckout } from "@/lib/razorpay";
import {
  getSubscriptionPlans,
  getMySubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  startSubscriptionTrial,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "@workspace/api-client-react";
import { Check, Loader2, Shield, Users, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

type PaidPlan = "premium" | "family";

const PLAN_META: Record<
  string,
  { icon: typeof Shield; highlight?: boolean }
> = {
  free: {
    icon: Shield,
  },
  premium: {
    icon: Sparkles,
    highlight: true,
  },
  family: {
    icon: Users,
  },
};

function formatPrice(amountPaise: number): string {
  const rupees = amountPaise / 100;
  return `₹${Number.isInteger(rupees) ? rupees : rupees.toFixed(2)}`;
}

function monthlyEquivalent(amountPaise: number): string {
  return `₹${Math.round(amountPaise / 12 / 100)}`;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function Pricing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation("pricing");
  const [, setLocation] = useLocation();

  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
  const [trialPlan, setTrialPlan] = useState<PaidPlan | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { plans: fetched } = await getSubscriptionPlans();
        if (active) setPlans(fetched);
      } catch {
        if (active) setPlans([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const status = await getMySubscription();
        if (active) setSubscription(status);
      } catch {
        if (active) setSubscription(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSubscribe = async (plan: PaidPlan) => {
    if (authLoading) return;
    if (!user) {
      setLocation(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setPendingPlan(plan);
    try {
      const order = await createSubscriptionOrder({ plan });
      const payment = await openCheckout({
        order,
        planLabel: t(`plans.${plan}.name`),
        prefill: { name: user.fullName, contact: user.phone },
      });
      const status = await verifySubscriptionPayment(payment);
      setSubscription(status);
      toast({
        title: t("toast.paymentSuccessTitle"),
        description: t("toast.paymentSuccessDesc", { plan: t(`plans.${plan}.name`) }),
      });
      setLocation("/account");
    } catch (error) {
      const message = errorMessage(error, t("toast.genericError"));
      if (message === "Payment cancelled.") {
        toast({
          title: t("toast.paymentCancelledTitle"),
          description: t("toast.paymentCancelledDesc"),
        });
      } else {
        toast({
          title: t("toast.paymentFailedTitle"),
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setPendingPlan(null);
    }
  };

  const handleTrial = async (plan: PaidPlan) => {
    if (authLoading) return;
    if (!user) {
      setLocation(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setTrialPlan(plan);
    try {
      const status = await startSubscriptionTrial({ plan });
      setSubscription(status);
      toast({
        title: t("toast.trialStartedTitle"),
        description: t("toast.trialStartedDesc", { plan: t(`plans.${plan}.name`) }),
      });
      setLocation("/account");
    } catch (error) {
      toast({
        title: t("toast.trialFailedTitle"),
        description: errorMessage(error, t("toast.trialFailedDesc")),
        variant: "destructive",
      });
    } finally {
      setTrialPlan(null);
    }
  };

  // The plan the user is actively on (active paid OR running trial).
  const currentPlan = subscription?.isPremium ? subscription.plan : "free";
  // Eligible for the one-time free trial. Logged-out visitors see the trial CTA
  // (clicking sends them to login first).
  const trialEligible = subscription ? subscription.trialEligible : true;
  const busy = pendingPlan !== null || trialPlan !== null;

  return (
    <Layout>
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
      />
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("hero.heading")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("hero.subtitle")}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {["free", "premium", "family"].map((key) => {
                const meta = PLAN_META[key];
                const plan = plans?.find((p) => p.key === key);
                const Icon = meta.icon;
                const isCurrent = currentPlan === key;
                const isPaid = key === "premium" || key === "family";
                const planName = t(`plans.${key}.name`);
                const planTagline = t(`plans.${key}.tagline`);
                const planFeatures = t(`plans.${key}.features`, {
                  returnObjects: true,
                }) as string[];

                const featured = !!meta.highlight;

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col rounded-3xl p-8 transition-transform ${
                      featured
                        ? "bg-gradient-to-br from-[#0B3D91] to-[#06245c] text-white shadow-2xl shadow-primary/30 md:-translate-y-4 ring-1 ring-white/10"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-accent text-white text-xs font-bold tracking-wide px-4 py-1.5 rounded-full shadow-lg shadow-accent/40">
                        <Sparkles className="w-3.5 h-3.5" /> {t("mostPopular")}
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          featured ? "bg-accent text-white" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className={`text-xl font-bold ${featured ? "text-white" : "text-gray-900"}`}>
                        {planName}
                      </h2>
                    </div>

                    <p className={`text-sm mb-6 ${featured ? "text-blue-100" : "text-gray-600"}`}>
                      {planTagline}
                    </p>

                    <div className="mb-6">
                      {key === "free" ? (
                        <span className="text-4xl font-bold text-gray-900">{t("freePrice")}</span>
                      ) : (
                        <>
                          <div className="flex items-end gap-1.5">
                            <span className={`text-5xl font-extrabold tracking-tight ${featured ? "text-white" : "text-gray-900"}`}>
                              {plan ? formatPrice(plan.amount) : "—"}
                            </span>
                            <span className={`mb-1.5 ${featured ? "text-blue-200" : "text-gray-500"}`}>{t("perYear")}</span>
                          </div>
                          {plan && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={`text-sm ${featured ? "text-blue-100" : "text-gray-500"}`}>
                                {t("monthlyEquivalent", { price: monthlyEquivalent(plan.amount) })}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  featured ? "bg-accent text-white" : "text-green-700 bg-green-100"
                                }`}
                              >
                                {t("saveTwoMonths")}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {isPaid && (
                      <div
                        className={`flex items-center gap-2 mb-6 rounded-xl px-3 py-2.5 text-sm font-medium ${
                          featured ? "bg-white/10 text-white" : "bg-green-50 text-green-800"
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 shrink-0 ${featured ? "text-accent" : "text-green-600"}`} />
                        <span>{t("trialBadge")}</span>
                      </div>
                    )}

                    <ul className="space-y-3 mb-8 flex-1">
                      {planFeatures.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-3 text-sm ${featured ? "text-blue-50" : "text-gray-700"}`}
                        >
                          <Check className={`w-5 h-5 shrink-0 mt-0.5 ${featured ? "text-accent" : "text-green-600"}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button
                        disabled
                        className={`w-full h-12 rounded-xl ${featured ? "bg-white/15 text-white hover:bg-white/15" : ""}`}
                        variant={featured ? "default" : "secondary"}
                      >
                        {subscription?.status === "trialing"
                          ? t("buttons.trialActive")
                          : t("buttons.currentPlan")}
                      </Button>
                    ) : isPaid && trialEligible ? (
                      <Button
                        className={`w-full h-12 rounded-xl text-base font-semibold ${
                          featured ? "bg-white hover:bg-blue-50 text-primary shadow-lg shadow-black/20" : ""
                        }`}
                        variant={featured ? "default" : "outline"}
                        disabled={busy}
                        onClick={() => handleTrial(key as PaidPlan)}
                      >
                        {trialPlan === key ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          t("buttons.startTrial")
                        )}
                      </Button>
                    ) : isPaid ? (
                      <Button
                        className={`w-full h-12 rounded-xl text-base font-semibold ${
                          featured ? "bg-white hover:bg-blue-50 text-primary shadow-lg shadow-black/20" : ""
                        }`}
                        variant={featured ? "default" : "outline"}
                        disabled={busy}
                        onClick={() => handleSubscribe(key as PaidPlan)}
                      >
                        {pendingPlan === key ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          t("buttons.getPlan", { name: planName })
                        )}
                      </Button>
                    ) : (
                      <Button disabled className="w-full h-12 rounded-xl" variant="outline">
                        {t("buttons.included")}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-10">
            {t("footnote")}
          </p>
        </div>
      </section>
    </Layout>
  );
}
