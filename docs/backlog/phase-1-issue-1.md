## Summary

Define the canonical SQL Server diagnostic snapshot schema and a minimal offline ingestion path.

## Why

All later advisory workflows depend on a stable representation of diagnostic evidence.

## Scope

- define TypeScript domain types for SQL Server diagnostic snapshots
- include wait stats, top query summaries, and environment metadata
- add sample fixture files for offline development

## Out of scope

- direct SQL Server connectivity
- narrative generation
- recommendation ranking

## Depends on planning

- `ROADMAP.md` phase 1
- `REQUIREMENTS.md`

Part of #EPIC
Parallelizable: No

## Execution order

1 of 3

## Acceptance criteria

- a canonical snapshot type is defined
- sample fixtures can be parsed into that type
- focused unit tests validate the parser or fixture loader
