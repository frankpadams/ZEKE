# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.28.1 · build 2026.07.23.0418
**Release:** Exercise-Specific Form Guides

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


## v0.28.1 additions

- The existing Form Guide bottom sheet is now data-driven through `assets/exercise-guides.js`.
- It contains 17 reviewed exercise-specific guides with visible media attribution.
- Photos are externally loaded from Wikimedia Commons; do not claim they are embedded/offline.
- Do not remove or bypass the v0.28.0 workout-event and connected-preferences persistence paths.
