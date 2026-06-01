import { useCheckNumber, getCheckNumberQueryKey, NumberCheckResponseRiskLevel } from "@workspace/api-client-react";
import type { NumberCheckResponseRiskLevel as RiskLevel } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Activity, Clock, ShieldQuestion, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RISK_CONFIG: Record<RiskLevel, { label: string; dot: string; text: string }> = {
  [NumberCheckResponseRiskLevel.high]: {
    label: "High risk",
    dot: "bg-destructive",
    text: "text-destructive",
  },
  [NumberCheckResponseRiskLevel.medium]: {
    label: "Medium risk",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-500",
  },
  [NumberCheckResponseRiskLevel.low]: {
    label: "Low risk",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-500",
  },
  [NumberCheckResponseRiskLevel.unknown]: {
    label: "Unknown",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
  },
};

interface NumberReputationProps {
  phone: string;
}

export function NumberReputation({ phone }: NumberReputationProps) {
  const { data, isLoading, isError } = useCheckNumber(phone, {
    query: {
      queryKey: getCheckNumberQueryKey(phone),
    },
  });

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldQuestion className="w-3.5 h-3.5" />
        Reputation unavailable
      </div>
    );
  }

  const risk = RISK_CONFIG[data.riskLevel] ?? RISK_CONFIG[NumberCheckResponseRiskLevel.unknown];
  const categories = Array.from(new Set(data.categories ?? []));

  return (
    <div className="mt-4 rounded-md border border-border/60 bg-background/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Reputation
        </span>
        <span className={cn("flex items-center gap-1.5 text-xs font-medium", risk.text)}>
          <span className={cn("h-2 w-2 rounded-full", risk.dot)} />
          {risk.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-foreground">
        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-medium">{data.reportCount}</span>
        <span className="text-muted-foreground">
          total {data.reportCount === 1 ? "report" : "reports"}
        </span>
      </div>
      {data.lastReportedAt && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          Last reported {format(new Date(data.lastReportedAt), "MMM d, yyyy")}
        </div>
      )}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tags className="w-3.5 h-3.5" />
          Reported categories
        </div>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {category}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No categories reported yet</p>
        )}
      </div>
    </div>
  );
}
