import { DiagnosticSnapshot } from "./diagnostic-snapshot";

export type WaitCategory =
  | "cpu"
  | "io"
  | "locking"
  | "memory"
  | "unknown";

export interface WaitStatsNarrative {
  primaryCategory: WaitCategory;
  summary: string;
  evidence: string[];
  confidence: number;
  suggestedNextActions: string[];
}

const CPU_WAITS = new Set(["SOS_SCHEDULER_YIELD", "CXCONSUMER", "CXPACKET"]);
const IO_WAITS = new Set(["PAGEIOLATCH_SH", "PAGEIOLATCH_EX", "WRITELOG", "IO_COMPLETION"]);
const LOCKING_WAITS = new Set(["LCK_M_S", "LCK_M_X", "LCK_M_U"]);
const MEMORY_WAITS = new Set(["RESOURCE_SEMAPHORE", "MEMORY_ALLOCATION_EXT"]);

export function inferWaitStatsNarrative(snapshot: DiagnosticSnapshot): WaitStatsNarrative {
  const topWait = [...snapshot.waitStats].sort((left, right) => right.waitTimeMs - left.waitTimeMs)[0];
  if (!topWait) {
    return {
      primaryCategory: "unknown",
      summary: "No wait statistics were provided in the diagnostic snapshot.",
      evidence: [],
      confidence: 0,
      suggestedNextActions: ["Collect wait stats before attempting diagnosis."],
    };
  }

  const category = classifyWait(topWait.waitType);
  const evidence = [
    `Top wait type: ${topWait.waitType}`,
    `Wait time: ${topWait.waitTimeMs} ms`,
    `Waiting tasks: ${topWait.waitingTasksCount}`,
  ];

  return {
    primaryCategory: category,
    summary: summarizeCategory(category, topWait.waitType),
    evidence,
    confidence: category === "unknown" ? 0.35 : 0.75,
    suggestedNextActions: suggestNextActions(category),
  };
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

function summarizeCategory(category: WaitCategory, waitType: string): string {
  switch (category) {
    case "cpu":
      return `The snapshot is dominated by ${waitType}, which suggests CPU scheduling or parallelism pressure.`;
    case "io":
      return `The snapshot is dominated by ${waitType}, which suggests storage or log I/O pressure.`;
    case "locking":
      return `The snapshot is dominated by ${waitType}, which suggests blocking or lock contention.`;
    case "memory":
      return `The snapshot is dominated by ${waitType}, which suggests memory grant or allocation pressure.`;
    default:
      return `The snapshot is dominated by ${waitType}, but it does not yet map to a known advisory category.`;
  }
}

function suggestNextActions(category: WaitCategory): string[] {
  switch (category) {
    case "cpu":
      return [
        "Inspect top CPU-consuming queries and recent plan regressions.",
        "Review parallelism settings and recent workload changes.",
      ];
    case "io":
      return [
        "Inspect storage latency and transaction log throughput.",
        "Review top queries with high physical reads or log pressure.",
      ];
    case "locking":
      return [
        "Inspect blocking chains and recent long-running transactions.",
        "Capture the most contended objects and lock modes.",
      ];
    case "memory":
      return [
        "Inspect memory grants and recent query concurrency spikes.",
        "Check for plan regressions that increased grant size.",
      ];
    default:
      return ["Collect additional workload context before making a recommendation."];
  }
}
