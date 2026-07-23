# ZEKE v0.28.1

**Build:** 2026.07.23.0418  
**Release:** Exercise-Specific Form Guides

ZEKE is a private, user-owned personal management system. This patch completes the Form Guide work requested for the v0.28.0 Gym Entry and Workout Programs release without changing its workout-storage paths.

## This patch

- Adds 17 exercise-specific Form Guides.
- Adds licensed or public-domain photographs with visible attribution and source/license links.
- Adds detailed Setup, Movement, Common Mistakes, and Tips sections.
- Keeps Form Guide inside the existing exercise-screen bottom sheet.
- Preserves blank values as unknown and retains the v0.28.0 connected-preferences and workout-event persistence behavior.

Photographs are loaded from Wikimedia Commons at runtime and therefore require network access. The written guidance remains available if an image cannot load.

Read `00_AI_START_HERE.md`, `HANDOFF_BRIEF.md`, `RELEASE_NOTES_v0.28.1.md`, `TEST_REPORT_v0.28.1.md`, and `FORM_GUIDE_MEDIA_LICENSES.md`.

## Deploy

Replace the deployed ZEKE files with this folder while preserving intended values in `zeke-config.js`. Hard-refresh once and confirm **v0.28.1 · build 2026.07.23.0418**.
