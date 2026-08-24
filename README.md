# Project ZEKE v0.45.1

**Build:** 2026.08.23.4  
**Release:** Integrated Fitness + Adaptive Training

ZEKE is a private, user-owned personal-management application. This is a complete self-contained release reconstructed from the last available full v0.43.1 package, the verified v0.44.1 patch, and the subsequently audited Project ZEKE decisions through 2026-08-23.

## Start here

1. `00_AI_START_HERE.md`
2. `ZEKE_CONSTITUTION.md`
3. `CURRENT_RELEASE_SCOPE.md`
4. `DESIGN_AUTHORITY.md`
5. `DEVELOPMENT_MEMORY/PROJECT_STATE.json`
6. `DEVELOPMENT_MEMORY/RELEASE_GATE.md`
7. `TEST_REPORT.md`
8. `RELEASE_NOTES.md`

## Release focus

- One integrated Fitness experience for exploration, planning, recommended regimens, active workouts, coaching, adaptation, history, and PT/rehab.
- Global **Log** remains a separate top-level intent; simply browsing Fitness never creates records.
- Adaptive PT/strength/cardio planning keeps clinician restrictions, source facts, AI inference, and observed response distinct.
- Proposed workouts are inspectable/editable and transfer into the active workout only after explicit Start.
- PDF/screenshot intake is source-first, review-before-save, and supports DEXA/body-composition extraction without making DEXA a required system dependency.
- Medication reconciliation, time-bounded illness/injury/context events, staged calendar privacy, and canonical exercise-variation charts are retained/integrated.
- Included PT/rehab entries have movement-specific two-frame guide evidence at the package-local release gate.

## Verification boundary

Package-local static, governance, syntax, and regression verification is documented in `TEST_REPORT.md`. Physical-device visual acceptance and live third-party provider behavior remain environment checks and are never called passed until actually performed.

Historical implementation/status/handoff material is retained in the living consolidated histories; removed duplicate current-status files are not current authorities.
