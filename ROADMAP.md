# Roadmap

## Milestone 1: Diagnostic foundations

Goal: establish the domain model, safe recommendation rules, and a first end-to-end diagnostic narrative workflow.

### Phase 1: Domain and snapshot foundation

- define canonical SQL Server diagnostic snapshot structures
- model recommendation severity and action classes
- establish the repository memory and execution workflow

### Phase 2: Wait stats narrative workflow

- analyze a snapshot of wait stats and related context
- generate a deterministic interpretation baseline
- produce an operator-facing narrative and recommendation set

### Phase 3: Query and index advisory workflow

- add query regression and index impact concepts
- simulate likely tradeoffs for candidate index actions
- summarize risk and expected operational impact

### Phase 4: Reliability and operations knowledge

- add backup and HA health narratives
- record troubleshooting playbooks and decision patterns
- prepare the next milestone for deeper automation
