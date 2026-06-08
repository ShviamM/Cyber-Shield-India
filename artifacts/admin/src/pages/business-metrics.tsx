import { IndianRupee, TrendingUp, CreditCard, RefreshCw, Users2, Crown, UserPlus, CalendarClock, Gift, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminBusinessMetrics,
  getAdminBusinessMetricsQueryKey,
  useAdminListTrials,
  getAdminListTrialsQueryKey,
  useAdminUsers,
  getAdminUsersQueryKey,
} from "@workspace/api-client-react";

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(end: string | null | undefined): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Ending today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export default function BusinessMetrics() {
  const { data, isLoading } = useAdminBusinessMetrics({
    query: { queryKey: getAdminBusinessMetricsQueryKey() },
  });
  const { data: trialsData, isLoading: trialsLoading } = useAdminListTrials({
    query: { queryKey: getAdminListTrialsQueryKey() },
  });
  const trials = trialsData?.trials ?? [];
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(
    undefined,
    { query: { queryKey: getAdminUsersQueryKey() } },
  );
  const users = usersData?.users ?? [];

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
    { label: "Registered Users", value: data?.totalUsers, icon: Users, format: formatCount },
    { label: "Active Trials", value: data?.activeTrials, icon: Gift, format: formatCount },
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

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Active Trials
          </h2>
          {!trialsLoading && (
            <span className="text-xs text-muted-foreground">
              {formatCount(trials.length)} on trial
            </span>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            {trialsLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : trials.length === 0 ? (
              <div className="p-8 text-center">
                <Gift className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium">No active trials</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Members who start a free trial on the website or app appear here until it ends.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Started</th>
                      <th className="px-4 py-3 font-medium">Ends</th>
                      <th className="px-4 py-3 font-medium text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trials.map((t) => (
                      <tr key={t.userId} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium">{t.fullName || "—"}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{t.phone}</td>
                        <td className="px-4 py-3 capitalize">{t.plan}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(t.trialStartedAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(t.currentPeriodEnd)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center rounded-full bg-[#0B3D91]/10 px-2.5 py-0.5 text-xs font-medium text-[#0B3D91]">
                            {daysLeft(t.currentPeriodEnd)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Registered Users
          </h2>
          {!usersLoading && (
            <span className="text-xs text-muted-foreground">
              {formatCount(users.length)} total
            </span>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium">No registered users</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Everyone who signs up on the website or app appears here, whether or not they start a trial.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Subscription</th>
                      <th className="px-4 py-3 font-medium">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium">
                          {u.fullName || "—"}
                          {u.isAdmin && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-[#FF6713]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FF6713]">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.location || "—"}</td>
                        <td className="px-4 py-3 capitalize">{u.plan ?? "—"}</td>
                        <td className="px-4 py-3">
                          {u.subscriptionStatus ? (
                            <span className="inline-flex items-center rounded-full bg-[#0B3D91]/10 px-2.5 py-0.5 text-xs font-medium capitalize text-[#0B3D91]">
                              {u.subscriptionStatus}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No subscription</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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
