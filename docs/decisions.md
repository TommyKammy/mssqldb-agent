# Decisions

## Memory model

- Repo files are the durable memory layer.
- GSD planning docs remain in the managed repo.
- `codex-supervisor` should read a compact subset of those files through durable memory configuration.

## Product safety model

- milestone 1 is advisory, not autonomous remediation
- recommendations must be explicit about risk and confidence
- deterministic diagnostics should anchor narrative generation

## Execution model

- GitHub is the source of truth for issues, PRs, reviews, and checks
- issue metadata drives ordering and dependency enforcement
- epics are not directly executable work items
