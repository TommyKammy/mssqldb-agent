## Summary

Add recommendation policy classification so the first advisory workflow distinguishes safe investigation from risky actions.

## Why

The product should not blur the line between observation and production-changing advice.

## Scope

- classify actions as observe, investigate, suggest change, or approval required
- add confidence and risk fields to recommendations
- validate that the wait stats narrative uses the classification consistently

## Out of scope

- automatic execution of changes
- advanced multi-signal correlation

## Depends on planning

- `REQUIREMENTS.md`
- `ROADMAP.md`

Depends on: #ISSUE2
Part of #EPIC
Parallelizable: No

## Execution order

3 of 3

## Acceptance criteria

- recommendation policy classes are defined in code
- the wait stats narrative flow emits policy-classified actions
- focused tests prove risky actions are labeled for approval
