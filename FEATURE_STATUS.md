# ZEKE Feature Status — v0.26.0

**Build:** 2026.07.22.1

## Implemented and package-locally verified

### Dashboard and architecture
- Daily-briefing Dashboard with independent compact sections and moderately rounded cards.
- Health at a Glance selected from Health with explicit up/down ordering controls.
- Today’s Actions, actionable Coach’s Eye, Upcoming, and full-width descriptive Trends & Analysis.
- Health umbrella navigation; Fitness process domain; Discover and Documents primary destinations.
- Exact **Questions for You** wording and conversational question review.
- No active Provider View duplicate.

### Health and sleep
- Deterministic Talk to ZEKE and direct sleep records share wake-date fields.
- Confirmed sleep appears in Recent Health Record and global search.
- Sleep entry uses hour/minute/AM-PM selectors; sleep editing exposes sleep-specific fields.
- Recent Health Record supports reversible audit-preserving Remove.

### Fitness
- v0.25.2 direct mobile workout-save path, form-submit fallback, and visible failure path preserved.
- Favorites is the initial Activity Library view with an explained most-used fallback.
- Activity cards open focused details; “+ Create activity type” replaces ambiguous add wording.
- Activity-specific capture, chart, detail, and history schemas.
- Separate stair steps, ambulatory steps, distance, duration, heart rate, level, load, repetitions, sets, RPE, pain, technique, and injury context.
- Reversible workout removal and focused incomplete-workout review.
- Provider-backed Health/Fitness goals with deterministic structural review and optional advisory AI review.

### Medications and supplements
- Explicit Taken today / Missed today / Not taken yet confirmation from Today’s Actions.
- Confirmed taken events—not schedules or pending states—complete medication actions.
- Date-range daily/weekly medication backfill with preview, duplicate skipping, provenance, and batch undo path.
- Visible recurring-schedule save feedback.
- Monthly medication/supplement check-in that never infers individual dose completion.

### Profile, search, and evidence
- User profile stored in connected workspace preferences with legacy local-profile migration.
- Global search across records, conversation, and discoveries.
- Evidence review includes limitations, dated records, actions, Pattern Lab, and PubMed topic search.
- Modal-entry protection prevents delayed root renders from clearing in-progress modal fields.

## Requires deployed or environment verification

- Physical-device workout save, sleep selectors, modal entry, mobile layout, keyboard behavior, and accessibility.
- Live Google Drive persistence, profile migration, and cross-device refresh.
- Live Calendar behavior and AI provider routing/failover.
- Deployed service-worker cache replacement.
- Protected real-workbook regression using `ZEKE_TEST_DATA_ROOT`.

## Partial or deferred

- Drag-and-drop Dashboard editing and saved layout profiles; v0.26 uses explicit up/down controls.
- Full correction-history browser and broad restore UI.
- Reviewed activity identity merge/migration.
- Session-based mobile Fitness redesign; implementation requires user-reviewed mockups first.
- Protected shared-AI proxy and multi-account isolation.
- Goal progress automation beyond stored goals and existing activity/health evidence.
