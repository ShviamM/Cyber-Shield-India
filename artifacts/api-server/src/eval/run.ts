import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizeIndianPhone } from "../lib/phone";
import { isAiConfigured } from "../lib/ai-classifier";
import { legacyClassify } from "./legacy";
import { engineClassify } from "./engine";
import {
  type Confusion,
  type Metrics,
  emptyConfusion,
  metricsFrom,
  tally,
} from "./metrics";
import type { Example, ExampleType, ReputationMap } from "./types";

const DATASET_URL = new URL("./dataset.jsonl", import.meta.url);
const REPORT_URL = new URL("./REPORT.md", import.meta.url);

const TYPES: ExampleType[] = ["phone", "url", "upi", "message"];

export function loadDataset(): Example[] {
  const raw = readFileSync(DATASET_URL, "utf8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Example);
}

export function buildReputationMap(examples: Example[]): ReputationMap {
  const map: ReputationMap = new Map();
  for (const ex of examples) {
    if (ex.type !== "phone" || !ex.reputation) continue;
    const normalized = normalizeIndianPhone(ex.value);
    if (normalized) map.set(normalized, ex.reputation);
  }
  return map;
}

export interface Scored {
  overall: Confusion;
  byType: Record<ExampleType, Confusion>;
}

function emptyScored(): Scored {
  return {
    overall: emptyConfusion(),
    byType: {
      phone: emptyConfusion(),
      url: emptyConfusion(),
      upi: emptyConfusion(),
      message: emptyConfusion(),
    },
  };
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

function signed(n: number): string {
  const v = (n * 100).toFixed(1);
  return (n >= 0 ? "+" : "") + v + " pts";
}

function metricsRow(name: string, m: Metrics): string {
  return `| ${name} | ${pct(m.precision)} | ${pct(m.recall)} | ${pct(m.f1)} | ${pct(m.accuracy)} | ${m.truePositive}/${m.falsePositive}/${m.falseNegative}/${m.trueNegative} |`;
}

export interface ScoreResult {
  examples: Example[];
  legacy: Scored;
  engine: Scored;
}

/**
 * Run both classifiers over the dataset and accumulate confusion matrices.
 * With `useAi` false this is fully deterministic and side-effect-free (no DB,
 * no network, no file writes), which is what the accuracy-regression test and
 * the default CLI run both rely on.
 */
export async function scoreDataset(useAi = false): Promise<ScoreResult> {
  const examples = loadDataset();
  const repMap = buildReputationMap(examples);

  const legacy = emptyScored();
  const engine = emptyScored();

  for (const ex of examples) {
    const legacyPred = legacyClassify(ex, repMap);
    const enginePred = await engineClassify(ex, repMap, useAi);

    tally(legacy.overall, ex.label, legacyPred.flagged);
    tally(legacy.byType[ex.type], ex.label, legacyPred.flagged);
    tally(engine.overall, ex.label, enginePred.flagged);
    tally(engine.byType[ex.type], ex.label, enginePred.flagged);
  }

  return { examples, legacy, engine };
}

async function main(): Promise<void> {
  const useAi =
    (process.argv.includes("--ai") || process.env.EVAL_USE_AI === "1") && isAiConfigured();

  const { examples, legacy, engine } = await scoreDataset(useAi);

  const legacyM = metricsFrom(legacy.overall);
  const engineM = metricsFrom(engine.overall);

  const lines: string[] = [];
  lines.push("# Fraud Engine Evaluation Report");
  lines.push("");
  lines.push(`- Dataset: ${examples.length} labeled examples`);
  lines.push(`- AI message classifier: ${useAi ? "ENABLED (live model)" : "disabled (deterministic run)"}`);
  lines.push(`- Positive class: "scam". A target is flagged when riskLevel is medium or high.`);
  lines.push(`- Confusion column format: TP/FP/FN/TN.`);
  lines.push("");
  lines.push("## Overall");
  lines.push("");
  lines.push("| System | Precision | Recall | F1 | Accuracy | TP/FP/FN/TN |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  lines.push(metricsRow("Legacy rule-based", legacyM));
  lines.push(metricsRow("New multi-signal engine", engineM));
  lines.push("");
  lines.push("## Improvement (engine − legacy)");
  lines.push("");
  lines.push("| Metric | Legacy | Engine | Delta |");
  lines.push("| --- | --- | --- | --- |");
  lines.push(`| Precision | ${pct(legacyM.precision)} | ${pct(engineM.precision)} | ${signed(engineM.precision - legacyM.precision)} |`);
  lines.push(`| Recall | ${pct(legacyM.recall)} | ${pct(engineM.recall)} | ${signed(engineM.recall - legacyM.recall)} |`);
  lines.push(`| F1 | ${pct(legacyM.f1)} | ${pct(engineM.f1)} | ${signed(engineM.f1 - legacyM.f1)} |`);
  lines.push(`| Accuracy | ${pct(legacyM.accuracy)} | ${pct(engineM.accuracy)} | ${signed(engineM.accuracy - legacyM.accuracy)} |`);
  lines.push("");
  lines.push("## Per-type F1 (legacy → engine)");
  lines.push("");
  lines.push("| Type | N | Legacy F1 | Engine F1 | Delta |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const t of TYPES) {
    const lm = metricsFrom(legacy.byType[t]);
    const em = metricsFrom(engine.byType[t]);
    lines.push(`| ${t} | ${lm.total} | ${pct(lm.f1)} | ${pct(em.f1)} | ${signed(em.f1 - lm.f1)} |`);
  }
  lines.push("");
  lines.push(`_Generated by \`pnpm --filter @workspace/api-server run eval\`${useAi ? " --ai" : ""}._`);
  lines.push("");

  const report = lines.join("\n");
  process.stdout.write(report + "\n");
  writeFileSync(fileURLToPath(REPORT_URL), report, "utf8");
}

const isCliEntrypoint =
  process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliEntrypoint) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
