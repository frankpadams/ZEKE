# Authority, Consistency, and Artifact Lifecycle

## Authority order

1. `00_AI_START_HERE.md`
2. `ZEKE_CONSTITUTION.md`
3. `DEVELOPMENT_MEMORY/GOVERNANCE_RECONCILIATION_2026-07-25.md`
4. machine-readable `PROJECT_STATE.json`, `DEVELOPMENT_GATE.json`, and `GOVERNANCE_RULES.json`
5. current architecture and current runtime iteration record
6. decision/error/backlog records
7. current README, feature status, and release evidence
8. historical release and patch documents

A contradiction among levels 1–6 fails the release. Historical files do not override current authority.

## Required artifact lifecycle

Every non-code artifact is one of: **Authoritative, Supporting, Historical, Superseded, Rejected, or Generated**. Historical files may remain for audit but must not be presented as current instructions.

## Runtime versus governance revisions

A governance-only package may retain the same runtime version/build while carrying a separately identified governance revision. Documentation must explicitly state that no runtime behavior changed. Governance approval does not prove implementation.

## Dead paths

Rejected or superseded development paths belong in `REJECTED_AND_SUPERSEDED_PATHS.md`, including reason, date, and conditions for reopening. Abandoned experiments must not remain silently active.

## Link and orphan rules

All relative Markdown links must resolve. Every authoritative document must be reachable from the root entry point or authority map. Unreferenced current documents must be archived, linked, or removed. Generated bundles and dependencies are exempt from prose-navigation requirements but remain subject to release structure and provenance checks.
