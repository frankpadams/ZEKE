# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.27.0 · build 2026.07.22.3  
**Release:** Gym Entry Mockup Fidelity

Start with `00_AI_START_HERE.md` and `DEVELOPMENT_MEMORY/PROJECT_STATE.json`.

## Baseline lineage

v0.27.0 is built directly from the untouched v0.26.1 handoff ZIP. It preserves the v0.25.2 mobile workout-save safeguards and the v0.26.1 Fitness navigation and evidence hotfix.

## Current user-visible changes

- Gym entry uses the full available window rather than the prior constrained modal card.
- The approved mockup remains the visual specification; this release does not intentionally redesign its hierarchy.
- Exercise entry supports set-by-set weight, repetitions, completion, adding sets, and copying Set 1 to all.
- The page can scroll vertically but prevents horizontal page scrolling, including narrow-phone layouts.
- Coach's Eye, Progression, Last Workout, Today's Entry, and Form Guide remain distinct sections.
- Form Guide opens as an edge-to-edge bottom sheet.
- Guide-media policy is adult-only and fully clothed. When not user-matched, the curated library must represent diverse adult backgrounds. Unreviewed images are not displayed.

## Package continuity

This ZIP remains the complete application, archive, continuity record, test record, and developer handoff. Developer materials remain in their established package locations.

## Verification boundary

Package-local evidence is in `TEST_REPORT_v0.27.0.md`. Live services, deployed cache behavior, protected workbook data, accessibility-device behavior, and physical-device behavior remain environment verification.
