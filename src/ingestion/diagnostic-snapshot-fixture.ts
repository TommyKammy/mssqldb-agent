import fs from "node:fs";
import { DiagnosticSnapshot, parseDiagnosticSnapshot } from "../domain/diagnostic-snapshot";

export function loadDiagnosticSnapshotFixture(filePath: string): DiagnosticSnapshot {
  let content: string;

  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    throw createWrappedError(
      `Failed to read diagnostic snapshot fixture from "${filePath}"`,
      err,
    );
  }

  try {
    return parseDiagnosticSnapshot(JSON.parse(content) as unknown);
  } catch (err) {
    if (err instanceof SyntaxError) {
      const syntaxError = new SyntaxError(
        `Failed to parse diagnostic snapshot fixture JSON from "${filePath}": ${err.message}`,
      );
      attachCause(syntaxError, err);
      throw syntaxError;
    }

    throw err;
  }
}

function createWrappedError(message: string, err: unknown): Error {
  const suffix = err instanceof Error ? err.message : String(err);
  const wrappedError = new Error(`${message}: ${suffix}`);
  attachCause(wrappedError, err);
  return wrappedError;
}

function attachCause(error: Error, cause: unknown): void {
  (error as Error & { cause?: unknown }).cause = cause;
}
