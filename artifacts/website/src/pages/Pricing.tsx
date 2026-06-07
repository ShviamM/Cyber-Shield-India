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

type PaidPlan = "premium" | "family";

const PLAN_META: Record<
  string,
  { name: string; tagline: string; icon: typeof Shield; features: string[]; highlight?: boolean }
> = {
  free: {
    name: "Free",
    tagline: "Essential protection to get started",
    icon: Shield,
    features: [
      "Scam & fraud number lookup",
      "Daily scam alerts for your city",
      "Community fraud reports",
      "Cyber safety knowledge centre",
    ],
  },
  premium: {
    name: "Premium",
    tagline: "Full real-time protection for you",
    icon: Sparkles,
    highlight: true,
    features: [
      "Everything in Free",
      "Real-time call & SMS scam screening",
      "AI fraud analysis for messages & links",
      "Priority scam alerts",
      "Unlimited number checks",
    ],
  },
  family: {
    name: "Family",
    tagline: "Protect your whole family",
    icon: Users,
    features: [
      "Everything in Premium",
      "Cover up to 5 family members",
      "Shared family safety dashboard",
      "Alerts for elderly & children",
    ],
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
        planLabel: PLAN_META[plan]?.name ?? plan,
        prefill: { name: user.fullName, contact: user.phone },
      });
      const status = await verifySubscriptionPayment(payment);
      setSubscription(status);
      toast({
        title: "Payment successful",
        description: `Your ${PLAN_META[plan]?.name ?? plan} plan is now active.`,
      });
      setLocation("/account");
    } catch (error) {
      const message = errorMessage(error, "Something went wrong. Please try again.");
      if (message === "Payment cancelled.") {
        toast({
          title: "Payment cancelled",
          description: "No charge was made. You can try again anytime.",
        });
      } else {
        toast({
          title: "Payment not completed",
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
        title: "Your 7-day free trial is active",
        description: `Enjoy ${PLAN_META[plan]?.name ?? plan} free for 7 days — no card needed.`,
      });
      setLocation("/account");
    } catch (error) {
      toast({
        title: "Couldn't start trial",
        description: errorMessage(error, "Please try again in a moment."),
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
        title="Pricing & Plans | Netraksh"
        description="Start a 7-day free trial of Netraksh — Premium at ₹99/year for full real-time scam protection, or Family at ₹449/year to protect up to 5 loved ones."
      />
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Protection that fits your life
            </h1>
            <p className="text-lg text-gray-600">
              Try Premium free for 7 days — no card needed. After that, keep your
              protection for just ₹99/year. Your plan unlocks instantly in the
              Netraksh app on the same mobile number.
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

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col rounded-3xl border p-8 bg-white ${
                      meta.highlight
                        ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-2"
                        : "border-gray-200 shadow-sm"
                    }`}
                  >
                    {meta.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">
                        Most popular
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          meta.highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{meta.name}</h2>
                    </div>

                    <p className="text-gray-600 text-sm mb-6">{meta.tagline}</p>

                    <div className="mb-6">
                      {key === "free" ? (
                        <span className="text-4xl font-bold text-gray-900">Free</span>
                      ) : (
                        <>
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-bold text-gray-900">
                              {plan ? formatPrice(plan.amount) : "—"}
                            </span>
                            <span className="text-gray-500 mb-1">/ year</span>
                          </div>
                          {plan && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                ≈ {monthlyEquivalent(plan.amount)}/mo, billed yearly
                              </span>
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                2 months free
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {meta.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                          <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button disabled className="w-full h-12 rounded-xl" variant="secondary">
                        {subscription?.status === "trialing"
                          ? "Trial active"
                          : "Current plan"}
                      </Button>
                    ) : isPaid && trialEligible ? (
                      <Button
                        className="w-full h-12 rounded-xl text-base"
                        variant={meta.highlight ? "default" : "outline"}
                        disabled={busy}
                        onClick={() => handleTrial(key as PaidPlan)}
                      >
                        {trialPlan === key ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Start 7-day free trial"
                        )}
                      </Button>
                    ) : isPaid ? (
                      <Button
                        className="w-full h-12 rounded-xl text-base"
                        variant={meta.highlight ? "default" : "outline"}
                        disabled={busy}
                        onClick={() => handleSubscribe(key as PaidPlan)}
                      >
                        {pendingPlan === key ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          `Get ${meta.name}`
                        )}
                      </Button>
                    ) : (
                      <Button disabled className="w-full h-12 rounded-xl" variant="outline">
                        Included
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-10">
            Your 7-day free trial needs no card. After it ends, pay once a year to keep
            premium — there's no auto-charge. Payments are processed securely by Razorpay
            in Indian Rupees, and you're never billed without choosing to.
          </p>
        </div>
      </section>
    </Layout>
  );
}
