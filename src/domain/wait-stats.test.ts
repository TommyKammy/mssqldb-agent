import test from "node:test";
import assert from "node:assert/strict";
import { createSnapshot } from "./diagnostic-snapshot";
import { inferWaitStatsNarrative } from "./wait-stats";

test("inferWaitStatsNarrative categorizes IO waits", () => {
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
    ],
    topQueries: [],
  });

  const narrative = inferWaitStatsNarrative(snapshot);

  assert.equal(narrative.primaryCategory, "io");
  assert.match(narrative.summary, /I\/O pressure/);
  assert.equal(narrative.suggestedNextActions.length, 2);
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
  assert.match(narrative.summary, /No wait statistics/);
});
