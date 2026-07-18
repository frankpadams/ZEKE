# Authority, Consistency, and Artifact Lifecycle

## Authority order
1. `00_AI_START_HERE.md`
2. `ZEKE_CONSTITUTION.md`
3. machine-readable `PROJECT_STATE.json` and `DEVELOPMENT_GATE.json`
4. current architecture and current iteration record
5. decision/error/backlog records
6. current README and release notes
7. historical release and patch documents

A contradiction among levels 1–5 fails the release. Lower-level historical documents do not override current authority.

## Required artifact lifecycle
Every non-code artifact is one of: **Authoritative, Supporting, Historical, Superseded, Rejected, or Generated**. Historical files may remain for audit but must not be presented as current instructions.

## Dead paths
Rejected or superseded development paths belong in `DEVELOPMENT_SYSTEM/REJECTED_AND_SUPERSEDED_PATHS.md`, including reason, date, and conditions for reopening. Abandoned experiments must not remain silently active.

## Link and orphan rules
All relative Markdown links must resolve. Every authoritative document must be reachable from the root entry point or authority map. Unreferenced current documents must be archived, linked, or removed. Generated bundles and dependencies are exempt from prose-navigation requirements but must be listed by release structure checks.
