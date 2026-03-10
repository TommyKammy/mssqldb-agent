import fs from "node:fs";

export interface SqlServerEnvironmentMetadata {
  serverName: string;
  databaseName: string;
  sqlServerVersion: string;
  capturedAt: string;
}

export interface WaitStatSample {
  waitType: string;
  waitTimeMs: number;
  signalWaitTimeMs: number;
  waitingTasksCount: number;
}

export interface TopQuerySample {
  queryId: string;
  statementText: string;
  averageDurationMs: number;
  executionCount: number;
}

export interface DiagnosticSnapshot {
  environment: SqlServerEnvironmentMetadata;
  waitStats: WaitStatSample[];
  topQueries: TopQuerySample[];
}

export function parseDiagnosticSnapshot(input: unknown): DiagnosticSnapshot {
  const root = expectRecord(input, "diagnostic snapshot");

  return createSnapshot({
    environment: parseEnvironment(root.environment),
    waitStats: expectArray(root.waitStats, "diagnostic snapshot.waitStats").map((entry, index) =>
      parseWaitStatSample(entry, index),
    ),
    topQueries: expectArray(root.topQueries, "diagnostic snapshot.topQueries").map((entry, index) =>
      parseTopQuerySample(entry, index),
    ),
  });
}

export function loadDiagnosticSnapshotFixture(filePath: string): DiagnosticSnapshot {
  const content = fs.readFileSync(filePath, "utf8");
  return parseDiagnosticSnapshot(JSON.parse(content) as unknown);
}

export function createSnapshot(input: DiagnosticSnapshot): DiagnosticSnapshot {
  return {
    environment: { ...input.environment },
    waitStats: input.waitStats.map((waitStat) => ({ ...waitStat })),
    topQueries: input.topQueries.map((query) => ({ ...query })),
  };
}

function parseEnvironment(input: unknown): SqlServerEnvironmentMetadata {
  const environment = expectRecord(input, "diagnostic snapshot.environment");

  return {
    serverName: expectString(environment.serverName, "diagnostic snapshot.environment.serverName"),
    databaseName: expectString(environment.databaseName, "diagnostic snapshot.environment.databaseName"),
    sqlServerVersion: expectString(
      environment.sqlServerVersion,
      "diagnostic snapshot.environment.sqlServerVersion",
    ),
    capturedAt: expectString(environment.capturedAt, "diagnostic snapshot.environment.capturedAt"),
  };
}

function parseWaitStatSample(input: unknown, index: number): WaitStatSample {
  const waitStat = expectRecord(input, `diagnostic snapshot.waitStats[${index}]`);

  return {
    waitType: expectString(waitStat.waitType, `diagnostic snapshot.waitStats[${index}].waitType`),
    waitTimeMs: expectNumber(waitStat.waitTimeMs, `diagnostic snapshot.waitStats[${index}].waitTimeMs`),
    signalWaitTimeMs: expectNumber(
      waitStat.signalWaitTimeMs,
      `diagnostic snapshot.waitStats[${index}].signalWaitTimeMs`,
    ),
    waitingTasksCount: expectNumber(
      waitStat.waitingTasksCount,
      `diagnostic snapshot.waitStats[${index}].waitingTasksCount`,
    ),
  };
}

function parseTopQuerySample(input: unknown, index: number): TopQuerySample {
  const topQuery = expectRecord(input, `diagnostic snapshot.topQueries[${index}]`);

  return {
    queryId: expectString(topQuery.queryId, `diagnostic snapshot.topQueries[${index}].queryId`),
    statementText: expectString(
      topQuery.statementText,
      `diagnostic snapshot.topQueries[${index}].statementText`,
    ),
    averageDurationMs: expectNumber(
      topQuery.averageDurationMs,
      `diagnostic snapshot.topQueries[${index}].averageDurationMs`,
    ),
    executionCount: expectNumber(
      topQuery.executionCount,
      `diagnostic snapshot.topQueries[${index}].executionCount`,
    ),
  };
}

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }

  return value as Record<string, unknown>;
}

function expectArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }

  return value;
}

function expectString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  return value;
}

function expectNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }

  return value;
}
