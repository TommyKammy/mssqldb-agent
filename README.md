# mssqldb-agent

AI-assisted operations and diagnostic support for Microsoft SQL Server DBAs.

This repository is a trial project for validating a `get-shit-done` planning workflow together with `codex-supervisor` execution.

## Goal

Turn recurring SQL Server DBA pain points into AI-assisted workflows that can:

- explain incidents in plain language
- propose safe next actions with confidence and impact
- reduce repetitive triage and operational toil
- preserve organization-specific DBA knowledge as durable memory

## Initial product direction

The first milestone focuses on diagnostic and advisory workflows instead of autonomous production changes.

Initial areas:

- wait stats and bottleneck explanation
- query plan regression detection
- index impact analysis
- backup / HA health narratives
- permission and security posture analysis

## Planned architecture

The likely system shape is:

- a collector layer for SQL Server telemetry and metadata
- a policy and analysis layer for deterministic heuristics
- an LLM-assisted narrative and recommendation layer
- operator-facing surfaces such as CLI, API, or dashboard

See:

- [PROJECT.md](./PROJECT.md)
- [REQUIREMENTS.md](./REQUIREMENTS.md)
- [ROADMAP.md](./ROADMAP.md)
- [STATE.md](./STATE.md)
- [docs/architecture.md](./docs/architecture.md)

## Supervisor validation goal

This repo is intentionally structured so `codex-supervisor` can execute issue work from GitHub while GSD remains the upstream planning layer.

The intended split is:

- GSD owns planning docs and phase intent
- GitHub issues become the execution queue
- `codex-supervisor` owns worktrees, PRs, CI/review repair, and merge
