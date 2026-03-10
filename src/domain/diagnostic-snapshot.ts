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

export function createSnapshot(input: DiagnosticSnapshot): DiagnosticSnapshot {
  return {
    environment: { ...input.environment },
    waitStats: [...input.waitStats],
    topQueries: [...input.topQueries],
  };
}
