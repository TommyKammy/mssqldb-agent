# Architecture

## Guiding model

Separate the system into clear layers:

1. ingestion
2. domain interpretation
3. recommendation policy
4. LLM-assisted explanation

## Proposed components

### Collector

Collects or imports SQL Server diagnostic snapshots. Inputs may come from:

- saved DMV exports
- query store summaries
- execution plan metadata
- backup / HA state snapshots
- security and permissions inventory

### Domain engine

Interprets raw inputs into normalized concepts such as:

- primary bottleneck category
- confidence level
- suspected root causes
- candidate actions

### Recommendation policy

Applies safety rules and classifies each action as:

- observe
- investigate
- suggest change
- escalate for approval

### Narrative engine

Turns structured findings into operator-facing natural language with evidence and suggested next steps.

## First implementation bias

Prefer an offline, file-based diagnostic flow first. It is easier to test than live SQL Server integration and is sufficient to validate the core reasoning model.
