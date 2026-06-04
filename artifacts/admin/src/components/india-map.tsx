import { useMemo, useState } from "react";
import { INDIA_STATES, INDIA_VIEWBOX } from "@/assets/india-geo";

export interface FraudStateDatum {
  state: string;
  code: string;
  reports: number;
}

/** Heat scale shared with the ranked list so the map and bars stay consistent. */
export function heatColor(ratio: number): string {
  if (ratio >= 0.66) return "#C81E1E";
  if (ratio >= 0.33) return "#FF6713";
  if (ratio >= 0.12) return "#E6A100";
  if (ratio > 0) return "#138808";
  return "#E2E8F0";
}

// Telangana ships as "TS" in the base map but "TG" in our report data.
const CODE_ALIAS: Record<string, string> = { TS: "TG" };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const LEGEND: { label: string; color: string }[] = [
  { label: "No data", color: "#E2E8F0" },
  { label: "Low", color: "#138808" },
  { label: "Moderate", color: "#E6A100" },
  { label: "High", color: "#FF6713" },
  { label: "Critical", color: "#C81E1E" },
];

export function IndiaFraudMap({
  states,
  maxReports,
}: {
  states: FraudStateDatum[];
  maxReports: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { byCode, byName } = useMemo(() => {
    const byCode = new Map<string, FraudStateDatum>();
    const byName = new Map<string, FraudStateDatum>();
    for (const s of states) {
      byCode.set(s.code.toUpperCase(), s);
      byName.set(norm(s.state), s);
    }
    return { byCode, byName };
  }, [states]);

  const lookup = (code: string, name: string): FraudStateDatum | undefined => {
    const c = code.toUpperCase();
    return (
      byCode.get(c) ||
      byCode.get(CODE_ALIAS[c] ?? "") ||
      byName.get(norm(name))
    );
  };

  const hoveredDatum = hovered
    ? states.find((s) => s.code === hovered) ?? null
    : null;

  return (
    <div>
      <div className="relative w-full">
        <svg
          viewBox={INDIA_VIEWBOX}
          className="w-full h-auto max-h-[560px]"
          role="img"
          aria-label="Choropleth map of India coloured by fraud report volume"
        >
          {INDIA_STATES.map((shape) => {
            if (!shape.d) return null;
            const datum = lookup(shape.code, shape.name);
            const reports = datum?.reports ?? 0;
            const ratio = maxReports > 0 ? reports / maxReports : 0;
            const isHot = datum ? heatColor(ratio) : "#E2E8F0";
            const active = datum && hovered === datum.code;
            const label = datum
              ? `${datum.state}: ${datum.reports.toLocaleString("en-IN")} reports`
              : shape.name || "No data";
            return (
              <path
                key={shape.code + shape.name}
                d={shape.d}
                fill={isHot}
                stroke={active ? "#0B3D91" : "#ffffff"}
                strokeWidth={active ? 1.6 : 0.5}
                style={{
                  cursor: datum ? "pointer" : "default",
                  transition: "fill 0.2s, stroke 0.2s",
                  outline: "none",
                }}
                tabIndex={datum ? 0 : undefined}
                role={datum ? "button" : undefined}
                aria-label={datum ? label : undefined}
                onMouseEnter={() => datum && setHovered(datum.code)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => datum && setHovered(datum.code)}
                onBlur={() => setHovered(null)}
              >
                <title>{label}</title>
              </path>
            );
          })}
        </svg>

        <div className="absolute top-2 left-2 rounded-md bg-background/85 backdrop-blur px-3 py-2 text-xs shadow-sm border">
          {hoveredDatum ? (
            <div>
              <p className="font-semibold">{hoveredDatum.state}</p>
              <p className="text-muted-foreground tabular-nums">
                {hoveredDatum.reports.toLocaleString("en-IN")} reports
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Hover a state for details</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm border border-black/5"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
