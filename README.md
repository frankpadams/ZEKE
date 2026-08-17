# ZEKE v0.43.0 RC2.1 — Longitudinal Integrity & Sync

**Build:** 2026.08.16.3  
**Status:** production release candidate; not yet promoted beyond RC.

ZEKE is a private, user-owned personal-management application. This package is intentionally **self-describing**: a new developer or AI team should be able to resume development from this package alone, without prior chat history.

## Start here

1. `00_AI_START_HERE.md`
2. `CURRENT_RELEASE_SCOPE.md`
3. `DESIGN_AUTHORITY.md`
4. `ARCHITECTURE.md`
5. `PROJECT_STATE.md`, `FEATURE_STATUS.md`, `KNOWN_ISSUES.md`
6. `DEVELOPMENT_MEMORY/RELEASE_GATE.md` and `TEST_REPORT.md`

## RC2 focus

- approved mobile `+ Log Exercise` composition, canonical exercise/variation model, inline multi-set editing, Coach rationale, and integrated form guidance;
- dated medication occurrence history with schedule-derived assumptions, explicit confirmation, retroactive correction, and historical reconstruction;
- interruption-safe conversation handling and deterministic medication-history answers;
- mobile past-year calendar relevance review followed by confirmation/deduplication before health-record backfill;
- Health Reports & Export generated from canonical longitudinal data; legacy workbook retained only for migration/reconciliation;
- AI provider credentials synced through the connected user-owned workspace rather than browser-local storage;
- vertical responsive navigation and package continuity/governance cleanup.

## Release boundary

Do not promote beyond RC until six remaining PT/rehab visual guides are verified, physical-phone visual acceptance is complete, and live connected Drive behavior (including cross-device credentials and longitudinal read/write) is verified. Connected-workspace API keys are protected by the user's Drive account/OAuth in this alpha; ZEKE does not yet add a separate end-to-end encryption layer.
