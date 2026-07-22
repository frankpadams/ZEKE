# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.26.1 · build 2026.07.22.2  
**Release:** Fitness Navigation & Evidence Hotfix

Start with `00_AI_START_HERE.md` and `DEVELOPMENT_MEMORY/PROJECT_STATE.json`.

## Baseline lineage

v0.26.1 patches v0.26.0. v0.26.0 was built on v0.25.2 because v0.25.2 fixed the reported mobile Save Workout failure. Do not roll back the direct save handler, form-submit fallback, visible status, or error path.

## Current user-visible fixes

- Favorites is the non-persisted fresh-load Activity Library default.
- A responsive selector and search replace the clipped horizontal activity-type control row.
- Dashboard disclosure open state survives application rerenders.
- Relationship reviews are tied to the selected activity or metric and never silently fall back to an unrelated pattern.
- Coach recommendations expose their personal-data trigger, interpretation, research basis, and limits.

## Verification boundary

Package-local evidence is in `TEST_REPORT_v0.26.1.md`. Live services, deployed cache behavior, protected workbook data, accessibility-device behavior, and physical-device behavior remain environment verification.
