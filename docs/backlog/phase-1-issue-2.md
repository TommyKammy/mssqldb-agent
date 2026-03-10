## Summary

Implement a deterministic wait stats interpretation baseline and operator-facing narrative output.

## Why

Wait stats analysis is one of the highest-value DBA workflows and is a good first diagnostic path.

## Scope

- map representative wait stat patterns to suspected bottleneck categories
- produce a structured narrative summary with evidence
- include risk/confidence fields in the result

## Out of scope

- live query plan ingestion
- index simulation
- backup / HA analysis

## Depends on planning

- `ROADMAP.md` phase 2 intent
- `REQUIREMENTS.md`

Depends on: #ISSUE1
Part of #EPIC
Parallelizable: No

## Execution order

2 of 3

## Acceptance criteria

- representative wait stat fixtures produce deterministic interpretation output
- the output includes summary, evidence, confidence, and suggested next actions
- focused tests cover at least 3 common wait categories
