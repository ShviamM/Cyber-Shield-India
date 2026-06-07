import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  getMySubscription,
  listMyPayments,
  cancelSubscription,
  type SubscriptionStatus,
  type Payment,
} from "@workspace/api-client-react";
import {
  Loader2,
  ShieldCheck,
  LogOut,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  family: "Family",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  canceled: "Cancelled",
  expired: "Expired",
  past_due: "Past due",
  trialing: "Free trial",
};

function daysLeft(value?: string | null): number | null {
  if (!value) return null;
  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return null;
  const ms = end - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amountPaise: number, currency: string): string {
  const symbol = currency?.toUpperCase() === "INR" ? "₹" : `${currency} `;
  const value = amountPaise / 100;
  return `${symbol}${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function Account() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLocation(`/login?next=${encodeURIComponent("/account")}`);
      return;
    }
    let active = true;
    (async () => {
      try {
        const [status, paymentList] = await Promise.all([
          getMySubscription(),
          listMyPayments(),
        ]);
        if (active) {
          setSubscription(status);
          setPayments(paymentList.payments);
        }
      } catch {
        // Leave defaults; the page still renders the account shell.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, setLocation]);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const status = await cancelSubscription();
      setSubscription(status);
      toast({
        title: "Subscription cancelled",
        description: "You'll keep access until the end of your billing period.",
      });
    } catch (error) {
      toast({
        title: "Could not cancel",
        description: errorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (authLoading || (user && loading)) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const isPremium = subscription?.isPremium ?? false;
  const isTrial = subscription?.status === "trialing";
  const planLabel = PLAN_LABELS[subscription?.plan ?? "free"] ?? "Free";
  const statusLabel = STATUS_LABELS[subscription?.status ?? "active"] ?? "—";
  const canCancel =
    isPremium && subscription?.status === "active" && !subscription?.cancelAtPeriodEnd;
  const trialDaysLeft = isTrial ? daysLeft(subscription?.currentPeriodEnd) : null;

  return (
    <Layout>
      <SEOHead
        title="My Account | Netraksh"
        description="Manage your Netraksh subscription, view your payment history and account details."
      />
      <section className="py-16 px-4 bg-gray-50 min-h-[80vh]">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-1">
                {user.fullName} · +91 {user.phone.replace(/^\+?91/, "")}
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>

          {/* Subscription card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPremium ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current plan</p>
                  <p className="text-xl font-bold text-gray-900">{planLabel}</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isPremium
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabel}
              </span>
            </div>

            {isTrial && (
              <div className="mt-6 rounded-xl bg-accent/10 border border-accent/20 p-4 text-sm">
                <p className="font-semibold text-gray-900">
                  {trialDaysLeft === 0
                    ? "Your free trial ends today"
                    : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial`}
                </p>
                <p className="text-gray-600 mt-1">
                  Trial ends on {formatDate(subscription?.currentPeriodEnd)}. Subscribe
                  before then to keep your protection — there's no automatic charge.
                </p>
              </div>
            )}

            {isPremium && !isTrial && (
              <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">Active until</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {formatDate(subscription?.currentPeriodEnd)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500">Renewal</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    Pay yearly to renew (no auto-charge)
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {isTrial && (
                <Link href="/pricing">
                  <Button className="gap-2 rounded-xl">
                    Subscribe to keep {planLabel} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {!isPremium && (
                <Link href="/pricing">
                  <Button className="gap-2 rounded-xl">
                    Upgrade plan <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {isPremium && !isTrial && (
                <Link href="/pricing">
                  <Button variant="outline" className="rounded-xl">
                    Change plan
                  </Button>
                </Link>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive rounded-xl"
                  onClick={handleCancel}
                  disabled={canceling}
                >
                  {canceling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Cancel subscription"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* App reminder */}
          <div className="bg-primary/5 border border-primary/15 rounded-3xl p-6 mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your protection lives in the app</p>
              <p className="text-sm text-gray-600 mt-1">
                Sign in to the Netraksh app with this same mobile number to use your plan's
                real-time protection.{" "}
                <Link href="/download" className="text-primary font-medium hover:underline">
                  Get the app
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment history</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{payment.plan}</p>
                      <p className="text-gray-500">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                      <p
                        className={`text-xs capitalize ${
                          payment.status === "paid"
                            ? "text-green-600"
                            : payment.status === "failed"
                              ? "text-destructive"
                              : "text-gray-500"
                        }`}
                      >
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
