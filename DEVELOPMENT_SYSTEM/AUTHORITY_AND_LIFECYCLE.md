# Authority, Consistency, and Artifact Lifecycle

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.4 · governance 2026.08.24.5

## Authority order

1. `00_AI_START_HERE.md`
2. `ZEKE_CONSTITUTION.md`
3. machine-readable `PROJECT_STATE.json`, `DEVELOPMENT_GATE.json`, and `GOVERNANCE_RULES.json`
4. current runtime iteration record, Architecture, and Feature Status
5. binding decision/reconciliation records, including the July 25 governance reconciliation
6. decision, error, backlog, workflow, and release-gate records
7. current README, Project Health, release notes, and test report
8. historical release, test, patch, package, and iteration evidence

A contradiction among current levels 1–6 fails the release. Historical files preserve evidence but do not override current authority.

## Required artifact lifecycle

Every non-code artifact is one of: **Authoritative, Supporting, Historical, Superseded, Rejected, or Generated**. Historical files may remain for audit but must not be presented as current instructions.

## Runtime versus governance revisions

A continuity/governance-only package may retain the same runtime version/build while carrying a separately identified governance revision. It must state that runtime behavior did not change. Governance approval and documentation coherence do not prove runtime implementation.

## Dead paths

Rejected or superseded development paths belong in `REJECTED_AND_SUPERSEDED_PATHS.md`, including reason, date, and conditions for reopening. Abandoned experiments must not remain silently active.

## Link and orphan rules

All relative Markdown links must resolve. Every authoritative document must be reachable from the root entry point or authority map. Unreferenced current documents must be archived, linked, or removed. Generated bundles and dependencies remain subject to release structure and provenance checks.


## Current-release review stamps
Every artifact registered as **Authoritative** must carry current-release review metadata in `ARTIFACT_REGISTRY.json`: release, runtime build, governance revision, and review date. The stamp means the document was re-read for contradictions and newly binding decisions; it is not a substitute for runtime testing.

The project audit must compare the complete authoritative set, not only a selected identity subset. Standing Supporting documents that themselves declare current release/state are also reviewed each release. Historical content can retain old version strings when clearly historical.
