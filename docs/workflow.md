# Workflow

## Planning and execution split

The intended operating model is:

1. use GSD to clarify the project, roadmap, and phase design
2. convert one approved phase into GitHub epic and child issues
3. let `codex-supervisor` execute those issues one at a time
4. if execution blocks on unclear requirements, return to GSD planning

## Default issue flow

1. Read the issue body and dependency metadata.
2. Read relevant durable memory files.
3. Inspect touched code paths before editing.
4. Implement the smallest viable change.
5. Run focused verification.
6. Commit a coherent checkpoint.
7. Open or update the PR.
8. Address CI and review feedback until mergeable.
