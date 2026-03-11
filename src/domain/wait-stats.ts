import { DiagnosticSnapshot } from "./diagnostic-snapshot";

export type WaitCategory =
  | "cpu"
  | "io"
  | "locking"
  | "memory"
  | "unknown";

export type WaitActionClass = "observe" | "investigate" | "suggest_change" | "approval_required";

export type RiskLevel = "low" | "medium" | "high";

export interface WaitStatsRecommendation {
  summary: string;
  actionClass: WaitActionClass;
  riskLevel: RiskLevel;
  confidence: number;
}

export interface WaitStatsNarrative {
  primaryCategory: WaitCategory;
  summary: string;
  evidence: string[];
  confidence: number;
  riskLevel: RiskLevel;
  suggestedNextActions: WaitStatsRecommendation[];
}

const CPU_WAITS = new Set(["SOS_SCHEDULER_YIELD", "CXCONSUMER", "CXPACKET"]);
const IO_WAITS = new Set(["PAGEIOLATCH_SH", "PAGEIOLATCH_EX", "WRITELOG", "IO_COMPLETION"]);
const LOCKING_WAITS = new Set(["LCK_M_S", "LCK_M_X", "LCK_M_U"]);
const MEMORY_WAITS = new Set(["RESOURCE_SEMAPHORE", "MEMORY_ALLOCATION_EXT"]);

export function inferWaitStatsNarrative(snapshot: DiagnosticSnapshot): WaitStatsNarrative {
  if (snapshot.waitStats.length === 0) {
    return {
      primaryCategory: "unknown",
      summary: "No wait statistics were provided in the diagnostic snapshot.",
      evidence: [],
      confidence: 0,
      riskLevel: "low",
      suggestedNextActions: [
        {
          summary: "Collect wait stats before attempting diagnosis.",
          actionClass: "observe",
          riskLevel: "low",
          confidence: 1,
        },
      ],
    };
  }

  const categoryTotals = summarizeCategoryTotals(snapshot);
  const category = selectPrimaryCategory(categoryTotals);
  const dominantSamples = snapshot.waitStats
    .filter((wait) => classifyWait(wait.waitType) === category)
    .sort((left, right) => right.waitTimeMs - left.waitTimeMs);
  const dominantWaitTime = dominantSamples.reduce((total, wait) => total + wait.waitTimeMs, 0);
  const totalWaitTime = snapshot.waitStats.reduce((total, wait) => total + wait.waitTimeMs, 0);
  const dominantShare = totalWaitTime === 0 ? 0 : dominantWaitTime / totalWaitTime;
  const dominantSignalShare =
    dominantWaitTime === 0
      ? 0
      : dominantSamples.reduce((total, wait) => total + wait.signalWaitTimeMs, 0) / dominantWaitTime;

  const evidence = buildEvidence(category, dominantSamples, dominantShare, dominantSignalShare);

  return {
    primaryCategory: category,
    summary: summarizeCategory(category),
    evidence,
    confidence: confidenceForCategory(category),
    riskLevel: riskForCategory(category),
    suggestedNextActions: suggestNextActions(category),
  };
}

function summarizeCategoryTotals(snapshot: DiagnosticSnapshot): Map<WaitCategory, number> {
  const totals = new Map<WaitCategory, number>([
    ["cpu", 0],
    ["io", 0],
    ["locking", 0],
    ["memory", 0],
    ["unknown", 0],
  ]);

  for (const wait of snapshot.waitStats) {
    const category = classifyWait(wait.waitType);
    totals.set(category, (totals.get(category) ?? 0) + wait.waitTimeMs);
  }

  return totals;
}

function selectPrimaryCategory(totals: Map<WaitCategory, number>): WaitCategory {
  const rankedCategories = [...totals.entries()].sort((left, right) => right[1] - left[1]);
  return rankedCategories[0]?.[0] ?? "unknown";
}

function classifyWait(waitType: string): WaitCategory {
  if (CPU_WAITS.has(waitType)) {
    return "cpu";
  }
  if (IO_WAITS.has(waitType)) {
    return "io";
  }
  if (LOCKING_WAITS.has(waitType)) {
    return "locking";
  }
  if (MEMORY_WAITS.has(waitType)) {
    return "memory";
  }
  return "unknown";
}

function summarizeCategory(category: WaitCategory): string {
  switch (category) {
    case "cpu":
      return "The wait profile points to CPU scheduler pressure or inefficient parallelism as the leading bottleneck.";
    case "io":
      return "The wait profile points to storage or transaction log throughput pressure as the leading bottleneck.";
    case "locking":
      return "The wait profile points to blocking or lock contention as the leading bottleneck.";
    case "memory":
      return "The wait profile points to memory grant or allocation pressure as the leading bottleneck.";
    default:
      return "The wait profile does not yet map cleanly to a supported advisory category.";
  }
}

function buildEvidence(
  category: WaitCategory,
  dominantSamples: DiagnosticSnapshot["waitStats"],
  dominantShare: number,
  dominantSignalShare: number,
): string[] {
  const evidence = [
    `Top wait category ${category.toUpperCase()} accounts for ${formatPercent(dominantShare)} of observed wait time.`,
    `Dominant waits: ${formatDominantWaits(dominantSamples)}.`,
  ];

  switch (category) {
    case "io":
      evidence.push(
        `Signal wait time remains a small share of the dominant waits at ${formatPercent(dominantSignalShare)}.`,
      );
      break;
    case "cpu":
      evidence.push(
        `Signal wait time is elevated within the dominant waits at ${formatPercent(dominantSignalShare)}.`,
      );
      break;
    case "locking":
      evidence.push(
        `Lock waits affect ${dominantSamples.reduce((total, wait) => total + wait.waitingTasksCount, 0)} waiting tasks across the dominant samples.`,
      );
      break;
    case "memory":
      evidence.push(
        `Memory-related waits account for ${formatPercent(dominantShare)} of total wait time in this snapshot.`,
      );
      break;
    default:
      evidence.push("Additional workload context is required to refine the diagnosis.");
      break;
  }

  return evidence;
}

function formatDominantWaits(waits: DiagnosticSnapshot["waitStats"]): string {
  const leadingWaits = waits.slice(0, 2).map((wait) => `${wait.waitType} (${wait.waitTimeMs} ms)`);
  return leadingWaits.join(", ");
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function confidenceForCategory(category: WaitCategory): number {
  switch (category) {
    case "cpu":
      return 0.82;
    case "io":
      return 0.88;
    case "locking":
      return 0.92;
    case "memory":
      return 0.86;
    default:
      return 0.35;
  }
}

function riskForCategory(category: WaitCategory): RiskLevel {
  switch (category) {
    case "locking":
      return "high";
    case "cpu":
    case "io":
    case "memory":
      return "medium";
    default:
      return "low";
  }
}

function suggestNextActions(category: WaitCategory): WaitStatsRecommendation[] {
  switch (category) {
    case "cpu":
      return [
        {
          summary: "Inspect the top CPU consumers and recent plan regressions.",
          actionClass: "investigate",
          riskLevel: "low",
          confidence: 0.89,
        },
        {
          summary: "Review MAXDOP or cost threshold changes only after confirming the workload pattern.",
          actionClass: "approval_required",
          riskLevel: "medium",
          confidence: 0.67,
        },
      ];
    case "io":
      return [
        {
          summary: "Inspect file and transaction log latency before changing workload settings.",
          actionClass: "investigate",
          riskLevel: "low",
          confidence: 0.9,
        },
        {
          summary: "Review the queries driving physical reads or log flush volume.",
          actionClass: "investigate",
          riskLevel: "low",
          confidence: 0.85,
        },
      ];
    case "locking":
      return [
        {
          summary: "Capture the active blocking chain and the lead blocker session.",
          actionClass: "investigate",
          riskLevel: "low",
          confidence: 0.94,
        },
        {
          summary: "Review long-running transactions before considering kill or workload changes.",
          actionClass: "approval_required",
          riskLevel: "high",
          confidence: 0.71,
        },
      ];
    case "memory":
      return [
        {
          summary: "Inspect memory grants and recent query concurrency spikes.",
          actionClass: "investigate",
          riskLevel: "low",
          confidence: 0.9,
        },
        {
          summary: "Check for plan regressions that increased grant size before changing server memory settings.",
          actionClass: "approval_required",
          riskLevel: "medium",
          confidence: 0.7,
        },
      ];
    default:
      return [
        {
          summary: "Collect additional workload context before making a recommendation.",
          actionClass: "observe",
          riskLevel: "low",
          confidence: 0.8,
        },
      ];
  }
}
