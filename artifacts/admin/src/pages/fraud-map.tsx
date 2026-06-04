import { MapPin, FileWarning, Map as MapIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminFraudMap, getAdminFraudMapQueryKey } from "@workspace/api-client-react";

function heatColor(ratio: number): string {
  if (ratio >= 0.66) return "#C81E1E";
  if (ratio >= 0.33) return "#FF6713";
  if (ratio >= 0.12) return "#E6A100";
  return "#138808";
}

export default function FraudMap() {
  const { data, isLoading } = useAdminFraudMap({
    query: { queryKey: getAdminFraudMapQueryKey() },
  });

  const states = data?.states ?? [];
  const total = data?.total ?? 0;
  const maxReports = states.reduce((m, s) => Math.max(m, s.reports), 0);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">India Fraud Map</h1>
        <p className="text-muted-foreground">
          Fraud &amp; scam report volume by state, combining official baselines with live community reports.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Total Reports</span>
              <FileWarning className="w-4 h-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold tracking-tight tabular-nums">{total.toLocaleString("en-IN")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">States &amp; UTs</span>
              <MapIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold tracking-tight tabular-nums">{states.length.toLocaleString("en-IN")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Top Hotspot</span>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{states[0]?.state ?? "—"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reports by State</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : states.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No reports yet</h3>
              <p className="text-muted-foreground">State-level volume will appear as reports come in.</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {states.map((s, index) => {
                const ratio = maxReports > 0 ? s.reports / maxReports : 0;
                const color = heatColor(ratio);
                return (
                  <li key={s.code + s.state} className="flex items-center gap-3">
                    <span className="w-5 text-sm font-semibold text-muted-foreground tabular-nums text-right">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-medium">
                          {s.state}
                          {s.code !== "—" && <span className="text-muted-foreground font-normal ml-1.5">({s.code})</span>}
                        </span>
                        <span className="text-sm font-bold tabular-nums">{s.reports.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.max(ratio * 100, 2)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
