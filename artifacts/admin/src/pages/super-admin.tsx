import {
  IndianRupee,
  Bot,
  Cloud,
  Server,
  Database,
  HardDrive,
  Activity,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSuperAdminOverview,
  getSuperAdminOverviewQueryKey,
} from "@workspace/api-client-react";

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  })}`;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-IN");
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function MetricCard({
  label,
  icon: Icon,
  accent,
  value,
  sub,
  isLoading,
}: {
  label: string;
  icon: LucideIcon;
  accent: string;
  value: string;
  sub?: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <Icon className={`w-5 h-5 ${accent}`} />
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-28" />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
        )}
        {sub && !isLoading && (
          <p className="text-xs text-muted-foreground mt-2">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

export default function SuperAdmin() {
  const { data, isLoading } = useSuperAdminOverview({
    query: { queryKey: getSuperAdminOverviewQueryKey() },
  });

  const dbHealthy = data?.database.status === "healthy";

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Platform operations for owners — revenue, costs, and system health.
        </p>
      </div>

      {/* Cost & revenue */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Revenue &amp; Cost
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            icon={IndianRupee}
            accent="text-[#138808]"
            isLoading={isLoading}
            value={data ? formatRupees(data.revenue.totalPaise) : "—"}
            sub={
              data
                ? `${formatRupees(data.revenue.thisMonthPaise)} this month`
                : undefined
            }
          />
          <MetricCard
            label="AI Cost (30d, est.)"
            icon={Bot}
            accent="text-[#0B3D91]"
            isLoading={isLoading}
            value={data ? formatUsd(data.aiCost.estimatedCostUsd30d) : "—"}
            sub={
              data
                ? `${formatUsd(data.aiCost.estimatedCostUsdToday)} today · ${formatNumber(data.aiCost.calls30d)} calls`
                : undefined
            }
          />
          <MetricCard
            label="AI Tokens (30d)"
            icon={Activity}
            accent="text-[#FF6713]"
            isLoading={isLoading}
            value={data ? formatNumber(data.aiCost.totalTokens30d) : "—"}
            sub={
              data
                ? `${formatNumber(data.aiCost.promptTokens30d)} in · ${formatNumber(data.aiCost.completionTokens30d)} out`
                : undefined
            }
          />
          <Card className="border-dashed">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cloud Cost
                </span>
                <Cloud className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-muted-foreground">
                Not connected
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {data?.cloudCost.note ??
                  "No cloud billing data source is connected."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System health */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="w-4 h-4 text-[#138808]" />
                Infrastructure
              </CardTitle>
              <CardDescription>API server runtime</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <HealthRow
                    label="Status"
                    value={data.infrastructure.status}
                  />
                  <HealthRow
                    label="Uptime"
                    value={formatUptime(data.infrastructure.uptimeSeconds)}
                  />
                  <HealthRow
                    label="Node"
                    value={data.infrastructure.nodeVersion}
                  />
                  <HealthRow
                    label="Memory (RSS)"
                    value={formatBytes(data.infrastructure.memoryRssBytes)}
                  />
                  <HealthRow
                    label="Heap used"
                    value={`${formatBytes(data.infrastructure.memoryHeapUsedBytes)} / ${formatBytes(data.infrastructure.memoryHeapTotalBytes)}`}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database
                  className={`w-4 h-4 ${dbHealthy ? "text-[#138808]" : "text-destructive"}`}
                />
                Database
              </CardTitle>
              <CardDescription>PostgreSQL</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <HealthRow label="Status" value={data.database.status} />
                  <HealthRow
                    label="Latency"
                    value={
                      data.database.latencyMs === null
                        ? "—"
                        : `${data.database.latencyMs} ms`
                    }
                  />
                  <HealthRow
                    label="Version"
                    value={data.database.version ?? "—"}
                  />
                  <HealthRow
                    label="Connections"
                    value={
                      data.database.activeConnections === null
                        ? "—"
                        : formatNumber(data.database.activeConnections)
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="w-4 h-4 text-[#0B3D91]" />
                Storage
              </CardTitle>
              <CardDescription>Database consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <HealthRow
                    label="Database size"
                    value={formatBytes(data.storage.databaseBytes)}
                  />
                  <HealthRow
                    label="Object storage"
                    value={
                      data.storage.objectStorageConfigured
                        ? "Connected"
                        : "Not used"
                    }
                  />
                  {data.storage.topTables.slice(0, 3).map((t) => (
                    <HealthRow
                      key={t.name}
                      label={t.name}
                      value={formatBytes(t.bytes)}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {!isLoading && data && !data.cloudCost.configured && (
        <Card className="border-dashed bg-transparent shadow-none mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              About these figures
            </CardTitle>
            <CardDescription>
              Revenue, AI usage, database, and storage are measured live. AI cost
              is an estimate from recorded token usage at current pricing. Cloud
              cost requires connecting a hosting-billing data source.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </AppShell>
  );
}
