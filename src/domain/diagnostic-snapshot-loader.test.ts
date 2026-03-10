import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadDiagnosticSnapshotFixture, parseDiagnosticSnapshot } from "./diagnostic-snapshot";

test("loadDiagnosticSnapshotFixture parses an offline diagnostic snapshot fixture", () => {
  const snapshot = loadDiagnosticSnapshotFixture(
    path.join(__dirname, "../../fixtures/sql-server-snapshot.sample.json"),
  );

  assert.equal(snapshot.environment.serverName, "sqlprod-01");
  assert.equal(snapshot.environment.databaseName, "SalesDb");
  assert.equal(snapshot.environment.sqlServerVersion, "SQL Server 2022 CU14");
  assert.equal(snapshot.waitStats.length, 2);
  assert.equal(snapshot.topQueries.length, 2);
  assert.equal(snapshot.topQueries[0]?.statementText, "EXEC dbo.ProcessSalesOrder @OrderId = @P1");
});

test("loadDiagnosticSnapshotFixture parses additional sample fixtures", () => {
  const snapshot = loadDiagnosticSnapshotFixture(
    path.join(__dirname, "../../fixtures/sql-server-snapshot.parallelism-sample.json"),
  );

  assert.equal(snapshot.environment.serverName, "sqlstage-02");
  assert.equal(snapshot.waitStats[0]?.waitType, "CXPACKET");
  assert.equal(snapshot.topQueries[0]?.executionCount, 42881);
});

test("parseDiagnosticSnapshot rejects malformed input", () => {
  assert.throws(
    () =>
      parseDiagnosticSnapshot({
        environment: {
          serverName: "sql01",
          databaseName: "SalesDb",
          sqlServerVersion: "SQL Server 2022",
          capturedAt: "2026-03-10T12:34:56.000Z",
        },
        waitStats: [],
      }),
    /diagnostic snapshot\.topQueries must be an array/,
  );
});
