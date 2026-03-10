# Requirements

## Milestone 1

Create the foundation for an AI-assisted SQL Server diagnostic agent that can reason over telemetry snapshots and produce operator-friendly recommendations.

## Functional requirements

### FR-1 Diagnostic snapshot model

The system must define a canonical model for ingesting SQL Server diagnostic inputs such as:

- wait stats
- top query metrics
- query plans or plan metadata
- index metadata
- backup / HA health signals

### FR-2 Narrative generation

The system must produce a structured explanation that describes:

- what is happening
- why it is likely happening
- what evidence supports that view
- what next actions are recommended

### FR-3 Safe recommendations

Recommendations must distinguish between:

- read-only investigation
- reversible tuning changes
- risky actions that require operator approval

### FR-4 Durable operating knowledge

The repository must preserve architecture, workflow, and decision context as durable repo memory so future AI sessions do not depend on one chat thread.

### FR-5 Supervisor compatibility

The backlog must be decomposable into execution-ready GitHub issues with explicit dependency metadata.

## Non-functional requirements

- NFR-1: prioritize explainability over aggressive autonomy
- NFR-2: keep the first milestone implementation small and testable
- NFR-3: preserve clear boundaries between deterministic diagnostics and LLM reasoning
- NFR-4: do not require a live production SQL Server connection to validate core domain behavior

## Out of scope for milestone 1

- production-grade dashboard UX
- direct execution of ALTER / index / failover actions
- multi-tenant SaaS control plane
- Azure-only managed service integrations
