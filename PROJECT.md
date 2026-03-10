# Project

## Name

mssqldb-agent

## Purpose

Build an AI-assisted system that helps Microsoft SQL Server DBAs diagnose, explain, and safely act on operational problems.

## Problem statement

SQL Server DBA work contains a mix of:

- repetitive triage
- expert-only interpretation of noisy signals
- risk-heavy operational decisions
- undocumented organization-specific knowledge

Current tools expose raw metrics, logs, DMVs, and documentation, but they do not consistently translate them into clear recommendations with operational context.

## Product thesis

An agentic system can combine:

- deterministic SQL Server diagnostics
- historical operating context
- policy-aware recommendations
- LLM-generated explanations

to produce actionable DBA assistance without requiring blind trust in autonomous change execution.

## Target users

- primary: SQL Server DBAs and database platform engineers
- secondary: application teams who need safe guidance on SQL performance and schema impact

## Initial non-goals

- fully autonomous production remediation
- direct write actions against production databases without approval
- broad multi-database support outside SQL Server

## Initial success criteria

- the system can ingest representative SQL Server diagnostic inputs
- it can produce structured narratives and suggested actions for common DBA scenarios
- the repo structure supports GSD planning and `codex-supervisor` execution
