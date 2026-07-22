# Iteration Record — v0.26.0

**Status:** Authoritative  
**Build:** 2026.07.22.1  
**Approved:** 2026-07-22T04:51:14Z

## Baseline

- Working code baseline: v0.25.2 Mobile Workout Save Hotfix.
- Regression references: v0.23.0 and v0.24.0.
- The v0.25.2 mobile save repair is protected and was not rolled back.

## Approved scope (machine-auditable wording)

- Preserve the resolved mobile workout-save issue
- Restore a compact, organized Dashboard with less white space
- Implement the approved daily-briefing Dashboard hierarchy
- Make Coach's Eye actionable and Trends & Analysis descriptive
- Consolidate health subdomains under Health and move Discover into navigation
- Keep Questions for You conversational
- Ensure sleep saved through Talk to ZEKE appears in Recent Health Record
- Use pull-down sleep times and mobile-safe form sizing
- Show only activity-relevant Fitness fields and separate stair steps, ambulatory steps, and distance
- Add reversible record removal and focused incomplete-workout review
- Default Fitness to Favorites and repair activity detail navigation
- Add explicit medication dose confirmation and reviewed historical-dose backfill
- Provide visible medication schedule save outcomes
- Add provider-backed goals with bounded optional AI review
- Move the user profile to portable provider-backed preferences
- Preserve focused evidence detail and remove duplicate Provider View behavior
- Update the existing Constitution and all continuity authorities rather than creating a parallel constitution

## Approved scope and outcome

| Concern | Outcome in v0.26.0 |
|---|---|
| Mobile workout Save failure | Preserved the verified v0.25.2 direct-click path, submit fallback, status, and error handling. |
| Sparse/disorganized Dashboard and excess white space | Replaced shared-height composition with Health at a Glance, a compact three-card briefing row, and full-width Trends. |
| Sleep understood in Talk but absent from Recent Health Record | Unified semantic sleep filtering and wake-date fields; rendered smoke confirms sleep is visible and searchable. |
| Sleep-time entry felt wonky | Added hour/minute/AM-PM selectors and sleep-specific edit controls. |
| Duplicate records could not be removed | Added audit-preserving reversible Remove for Health and Fitness history. |
| Dead/inactive activity detail affordance | Activity cards now open focused details through mouse/keyboard-compatible controls. |
| Fitness opened on Frequent instead of Favorites | Favorites is the initial view, with a clearly explained most-used fallback. |
| “+ Add activity” was ambiguous | Renamed to “+ Create activity type.” |
| Activity columns were irrelevant by type | Added profile-specific capture, charts, detail, and history; stair/walking/distance fields remain distinct. |
| Evidence review became generic | Restored concrete observation, limitation, dated-record, action, Pattern Lab, and PubMed-topic detail. |
| Provider View duplicated Dashboard | No active Provider View remains. |
| Medication schedule save lacked clear response | Added visible schedule save feedback and fixed the undefined-label path. |
| Need to confirm taken doses | Added Taken today, Missed today, and Not taken yet outcomes; only confirmed taken completes the action. |
| Need to enter many past medication doses | Added date-range daily/weekly preview, duplicate skipping, batch provenance, and undo path. |
| Need goal setting and optional guidance | Added provider-backed goals with deterministic review and optional non-committing AI advisory review. |
| Profile should travel with user storage | Moved active profile to provider preferences with legacy local-profile migration/removal. |
| Modal fields could be overwritten by delayed renders | Limited render snapshot restoration to controls inside the replaced app root. |
| Constitution/design continuity | Edited the existing Constitution and reconciled all current authority documents; no parallel constitution. |

## Explicit exclusions

- No destructive migration.
- No generic app launcher or copied dynamic membership QR.
- No session-based mobile Fitness redesign before user-approved mockups.
- No claim of physical-device, live provider, protected workbook, or deployed cache verification.
- No shared beta secrets or multi-account security claims.

## Acceptance criteria

- Dashboard uses the approved Health → three-card briefing row → full-width Trends flow.
- Coach’s Eye has no descriptive Patterns lane.
- Health owns symptoms, sleep, medications, labs, measurements, nutrition, and conditions.
- Sleep records share wake-date fields and appear in Recent Health Record.
- Strength and stair-cardio history do not show irrelevant universal columns.
- The mobile direct Save Workout handler and form-submit fallback remain present.
- Questions for You is the visible language.
- Medication completion requires an explicit taken event.
- Batch medication backfill previews and skips existing dates.
- Goals and profile use provider-backed storage.
- Active identity and governance documents agree.

## Package verification

- JavaScript syntax checks passed.
- Fifteen package-local JavaScript regression files passed.
- Two protected real-workbook tests were intentionally skipped because `ZEKE_TEST_DATA_ROOT` was not supplied.
- Rendered Chromium workflow smoke passed across Dashboard, Fitness, Health, Questions, Discover, and mobile Dashboard.
- Support-report browser smoke passed.
- Project audit and governance negative controls passed.
- Final ZIP reopen, checksum verification, and byte comparison are required before release completion and are recorded in the final test report.

## Rollback

Restore v0.25.2 build 2026.07.21.4. v0.26 adds no destructive data migration.
