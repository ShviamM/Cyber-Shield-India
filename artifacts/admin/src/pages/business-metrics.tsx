import { IndianRupee, TrendingUp, CreditCard, RefreshCw, Users2, Crown, UserPlus, CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBusinessMetrics, getAdminBusinessMetricsQueryKey } from "@workspace/api-client-react";

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

export default function BusinessMetrics() {
  const { data, isLoading } = useAdminBusinessMetrics({
    query: { queryKey: getAdminBusinessMetricsQueryKey() },
  });

  const headlineCards: {
    label: string;
    value: number | undefined;
    icon: LucideIcon;
    accent: string;
    format: (v: number) => string;
    sub?: string;
  }[] = [
    {
      label: "Total Revenue",
      value: data?.revenuePaise,
      icon: IndianRupee,
      accent: "text-[#138808]",
      format: formatRupees,
      sub: data ? `${formatRupees(data.revenueThisMonthPaise)} this month` : undefined,
    },
    {
      label: "Monthly Recurring Revenue",
      value: data?.mrrPaise,
      icon: TrendingUp,
      accent: "text-[#0B3D91]",
      format: formatRupees,
      sub: "From active paid plans",
    },
    {
      label: "Active Subscriptions",
      value: data?.activeSubscriptions,
      icon: CreditCard,
      accent: "text-[#FF6713]",
      format: formatCount,
      sub: data ? `${formatCount(data.premiumSubscriptions)} premium · ${formatCount(data.familySubscriptions)} family` : undefined,
    },
    {
      label: "Renewals Due (30 days)",
      value: data?.renewalsDue,
      icon: RefreshCw,
      accent: "text-[#0B3D91]",
      format: formatCount,
      sub: "Renewing in the next 30 days",
    },
  ];

  const secondaryCards: {
    label: string;
    value: number | undefined;
    icon: LucideIcon;
    format: (v: number) => string;
  }[] = [
    { label: "Premium Members", value: data?.premiumSubscriptions, icon: Crown, format: formatCount },
    { label: "Families Protected", value: data?.familiesProtected, icon: Users2, format: formatCount },
    { label: "New Subscriptions (30 days)", value: data?.newSubscriptions, icon: UserPlus, format: formatCount },
    { label: "Revenue This Month", value: data?.revenueThisMonthPaise, icon: CalendarClock, format: formatRupees },
  ];

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Business Metrics</h1>
        <p className="text-muted-foreground">
          Revenue, recurring income, and subscription health for Netraksh.
        </p>
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {headlineCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
                    <Icon className={`w-5 h-5 ${card.accent}`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-9 w-28" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight tabular-nums">
                      {card.value === undefined ? "—" : card.format(card.value)}
                    </p>
                  )}
                  {card.sub && !isLoading && (
                    <p className="text-xs text-muted-foreground mt-2">{card.sub}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Breakdown</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight tabular-nums">
                      {card.value === undefined ? "—" : card.format(card.value)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {!isLoading && data && data.activeSubscriptions === 0 && data.revenuePaise === 0 && (
        <Card className="border-dashed bg-transparent shadow-none mt-8">
          <CardHeader>
            <CardTitle className="text-base">No revenue yet</CardTitle>
            <CardDescription>
              These figures will populate automatically as members subscribe to Premium and Family plans.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </AppShell>
  );
}
