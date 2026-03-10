import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseDiagnosticSnapshot } from "./diagnostic-snapshot";
import { loadDiagnosticSnapshotFixture } from "../ingestion/diagnostic-snapshot-fixture";

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

test("loadDiagnosticSnapshotFixture reports the fixture path for invalid JSON", async () => {
  const fixturePath = path.join(
    await fs.promises.mkdtemp(path.join(os.tmpdir(), "snapshot-fixture-")),
    "invalid-snapshot.json",
  );

  await fs.promises.writeFile(fixturePath, "{ invalid json", "utf8");

  assert.throws(
    () => loadDiagnosticSnapshotFixture(fixturePath),
    /Failed to parse diagnostic snapshot fixture JSON from ".*invalid-snapshot\.json"/,
  );
});
