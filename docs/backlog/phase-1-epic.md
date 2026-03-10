# Epic: Phase 1 Diagnostic foundations

## Summary

Establish the core domain and workflow foundation for `mssqldb-agent`.

## Why

Milestone 1 requires a small but coherent base that validates:

- SQL Server diagnostic snapshot modeling
- safe recommendation classification
- durable repo memory for AI execution

## Scope

- define a canonical diagnostic snapshot model
- define recommendation risk / confidence shapes
- add a minimal CLI or module entry point for offline analysis

## Out of scope

- live SQL Server connectivity
- dashboard UX
- autonomous production actions

## Source planning docs

- `PROJECT.md`
- `REQUIREMENTS.md`
- `ROADMAP.md`
- `STATE.md`

## Child issues

- [ ] Child 1: define canonical SQL Server diagnostic snapshot schema
- [ ] Child 2: implement wait stats narrative baseline
- [ ] Child 3: add recommendation policy classification and focused tests

## Definition of done

- all child issues are merged
- the repo has a small runnable diagnostic path
- focused tests validate the first narrative flow
