# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.26.0 · build 2026.07.22.1  
**Release:** Daily Briefing & Health Architecture

## Product direction

ZEKE is a private personal-management system with Health as the leading current domain. The user owns the durable repository; AI is advisory and replaceable.

## Baseline and regression policy

v0.26.0 uses v0.25.2 as its code baseline because that release fixed the reported mobile Save Workout failure. v0.23.0 and v0.24.0 were used as regression references. Do not roll back the direct save handler, form-submit fallback, visible status, or error path.

## Current design contract

- Dashboard prioritizes state and intelligence as a daily briefing.
- Health owns symptoms/life context, sleep, measurements, labs, medications, nutrition, conditions, and related context.
- Fitness owns workout process, activity detail, progression, and goals.
- Coach’s Eye is actionable; Trends & Analysis is descriptive.
- **Questions for You** remains the approved conversational language.
- Discover is the broader exploration destination.
- External apps are contextual handoffs, not a generic launcher.

## July 21–22 concern closure

Implemented in this release:
- Dashboard whitespace/layout regression corrected.
- Sleep from Talk to ZEKE appears in Recent Health Record.
- Sleep entry uses selectors and sleep-specific edit fields.
- Health/workout records have reversible Remove.
- Fitness defaults to Favorites and activity cards open real detail.
- “+ Create activity type” replaces ambiguous add wording.
- Evidence review remains concrete rather than routing to a generic page.
- Provider View duplication is absent.
- Medication actions accept explicit taken/missed/not-yet outcomes.
- Past medication doses can be backfilled in a reviewed batch.
- Recurring schedule save gives visible success/failure feedback.
- Goals are provider-backed and can receive bounded advisory review.
- User profile is stored in the connected workspace, with legacy migration.
- Delayed root render no longer clears an open modal field.

## Highest-risk regression areas

1. Save Workout on mobile must respond through direct click and form-submit paths.
2. Sleep confirmed through Talk to ZEKE must appear in Recent Health Record.
3. Dashboard must not return to masonry/shared-height layouts.
4. Activity tables must not reintroduce irrelevant universal columns.
5. Health subdomains must not return as global-sidebar peers.
6. Medication schedules must not count as taken doses.
7. Profile and goals must not become local-only personal records.
8. AI goal review must remain advisory and non-committing.

## Runtime and verification

The application is directly editable static JavaScript/CSS. Read `ARCHITECTURE.md`. Package-local tests and governance evidence are recorded in `TEST_REPORT_v0.26.0.md`. Live services, deployed cache, protected workbook, and physical-device behavior remain environment verification.
