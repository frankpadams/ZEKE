# ZEKE v0.26.0

**Build:** 2026.07.22.1  
**Release:** Daily Briefing & Health Architecture

This full replacement package keeps the v0.25.2 mobile workout-save hotfix and integrates the Dashboard, Health, Fitness, sleep, medication, profile, goal, evidence, and navigation concerns raised during the July 21–22 review.

## Main changes

- Compact daily-briefing Dashboard with Health at a Glance; Today’s Actions, Coach’s Eye, and Upcoming in one row; and full-width expandable Trends & Analysis.
- Health umbrella navigation, Discover destination, and exact **Questions for You** language.
- Sleep saved through Talk to ZEKE appears in Recent Health Record; sleep entry uses selectors and sleep-specific editing.
- Activity-specific Fitness fields, Favorites default, real activity detail, reversible history removal, and provider-backed goals.
- Explicit medication dose confirmation and reviewed batch backfill for past daily/weekly doses.
- User profile stored in the connected workspace with legacy local-profile migration.
- Concrete evidence review, global search, and protection against delayed renders clearing modal entry.
- v0.25.2 direct mobile Save Workout click handler, submit fallback, visible save state, and error handling preserved.

See `RELEASE_NOTES_v0.26.0.md`, `TEST_REPORT_v0.26.0.md`, and `ARCHITECTURE.md`.

## Deploy

Replace the deployed ZEKE files with this folder while preserving intended values in `zeke-config.js`. Hard-refresh once and confirm **v0.26.0 · build 2026.07.22.1**.

## Continue development

Begin with `00_AI_START_HERE.md`. The active application is the readable static runtime listed in `ARCHITECTURE.md`; historical hashed bundles are not source.
