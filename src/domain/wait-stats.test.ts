import test from "node:test";
import assert from "node:assert/strict";
import { createSnapshot } from "./diagnostic-snapshot";
import { inferWaitStatsNarrative } from "./wait-stats";

test("inferWaitStatsNarrative emits a deterministic IO narrative baseline", () => {
  const snapshot = createSnapshot({
    environment: {
      serverName: "sql01",
      databaseName: "finance",
      sqlServerVersion: "SQL Server 2022",
      capturedAt: "2026-03-11T00:00:00Z",
    },
    waitStats: [
      {
        waitType: "PAGEIOLATCH_SH",
        waitTimeMs: 5000,
        signalWaitTimeMs: 150,
        waitingTasksCount: 40,
      },
      {
        waitType: "WRITELOG",
        waitTimeMs: 1800,
        signalWaitTimeMs: 80,
        waitingTasksCount: 28,
      },
      {
        waitType: "SOS_SCHEDULER_YIELD",
        waitTimeMs: 1200,
        signalWaitTimeMs: 500,
        waitingTasksCount: 18,
      },
    ],
    topQueries: [],
  });

  const narrative = inferWaitStatsNarrative(snapshot);

  assert.equal(narrative.primaryCategory, "io");
  assert.match(narrative.summary, /storage or transaction log throughput pressure/i);
  assert.equal(narrative.riskLevel, "medium");
  assert.equal(narrative.confidence, 0.88);
  assert.deepEqual(narrative.evidence, [
    "Top wait category IO accounts for 85.0% of observed wait time.",
    "Dominant waits: PAGEIOLATCH_SH (5000 ms), WRITELOG (1800 ms).",
    "Signal wait time remains a small share of the dominant waits at 3.4%.",
  ]);
  assert.deepEqual(narrative.suggestedNextActions, [
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
  ]);
});

test("inferWaitStatsNarrative emits a deterministic locking narrative baseline", () => {
  const snapshot = createSnapshot({
    environment: {
      serverName: "sql01",
      databaseName: "finance",
      sqlServerVersion: "SQL Server 2022",
      capturedAt: "2026-03-11T00:00:00Z",
    },
    waitStats: [
      {
        waitType: "LCK_M_X",
        waitTimeMs: 6200,
        signalWaitTimeMs: 120,
        waitingTasksCount: 31,
      },
      {
        waitType: "LCK_M_S",
        waitTimeMs: 2800,
        signalWaitTimeMs: 40,
        waitingTasksCount: 22,
      },
      {
        waitType: "SOS_SCHEDULER_YIELD",
        waitTimeMs: 700,
        signalWaitTimeMs: 350,
        waitingTasksCount: 14,
      },
    ],
    topQueries: [],
  });

  const narrative = inferWaitStatsNarrative(snapshot);

  assert.equal(narrative.primaryCategory, "locking");
  assert.match(narrative.summary, /blocking or lock contention/i);
  assert.equal(narrative.riskLevel, "high");
  assert.equal(narrative.confidence, 0.92);
  assert.deepEqual(narrative.suggestedNextActions, [
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
  ]);
});

test("inferWaitStatsNarrative emits a deterministic CPU narrative baseline", () => {
  const snapshot = createSnapshot({
    environment: {
      serverName: "sql01",
      databaseName: "finance",
      sqlServerVersion: "SQL Server 2022",
      capturedAt: "2026-03-11T00:00:00Z",
    },
    waitStats: [
      {
        waitType: "SOS_SCHEDULER_YIELD",
        waitTimeMs: 4200,
        signalWaitTimeMs: 1700,
        waitingTasksCount: 38,
      },
      {
        waitType: "CXPACKET",
        waitTimeMs: 2600,
        signalWaitTimeMs: 600,
        waitingTasksCount: 24,
      },
      {
        waitType: "PAGEIOLATCH_SH",
        waitTimeMs: 900,
        signalWaitTimeMs: 90,
        waitingTasksCount: 10,
      },
    ],
    topQueries: [],
  });

  const narrative = inferWaitStatsNarrative(snapshot);

  assert.equal(narrative.primaryCategory, "cpu");
  assert.match(narrative.summary, /cpu scheduler pressure or inefficient parallelism/i);
  assert.equal(narrative.riskLevel, "medium");
  assert.equal(narrative.confidence, 0.82);
  assert.deepEqual(narrative.suggestedNextActions, [
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
  ]);
});

test("inferWaitStatsNarrative handles empty waits", () => {
  const snapshot = createSnapshot({
    environment: {
      serverName: "sql01",
      databaseName: "finance",
      sqlServerVersion: "SQL Server 2022",
      capturedAt: "2026-03-11T00:00:00Z",
    },
    waitStats: [],
    topQueries: [],
  });

  const narrative = inferWaitStatsNarrative(snapshot);

  assert.equal(narrative.primaryCategory, "unknown");
  assert.equal(narrative.confidence, 0);
  assert.equal(narrative.riskLevel, "low");
  assert.match(narrative.summary, /No wait statistics/);
  assert.deepEqual(narrative.suggestedNextActions, [
    {
      summary: "Collect wait stats before attempting diagnosis.",
      actionClass: "observe",
      riskLevel: "low",
      confidence: 1,
    },
  ]);
});
