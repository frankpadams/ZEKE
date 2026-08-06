# ZEKE v0.26.0 — Daily Briefing & Health Architecture

**Build:** 2026.07.22.1  
**Implementation baseline:** v0.25.2 Mobile Workout Save Hotfix  
**Regression reference:** v0.23.0 Conversation Intelligence / Trusted AI Foundation

## Release intent

This release addresses the concerns raised during the July 21–22 review as one integrated update. It preserves the mobile workout-save repair from v0.25.2 while correcting Dashboard, sleep, Fitness, medication, profile, goal, evidence, and navigation regressions.

## Dashboard and navigation

- Replaced the sparse/shared-height Dashboard composition with an explicit daily-briefing flow.
- Added Health at a Glance, followed by one compact row for Today’s Actions, Coach’s Eye, and Upcoming.
- Gave expandable Trends & Analysis a full-width row so expansion does not create empty neighboring columns.
- Increased card rounding and reduced coupled white space.
- Health at a Glance metrics are selected from Health and can be reordered with explicit controls.
- Preserved **Questions for You** as the visible conversational language.
- Moved Discover into primary navigation.
- Kept Labs, Measurements, Medications, Nutrition, Sleep, Symptoms, and Conditions inside Health rather than as global-sidebar peers.
- Removed the duplicated Provider View concept from the active application.

## Health and sleep

- Sleep confirmed through Talk to ZEKE now uses the same semantic Health path as direct entry and appears in Recent Health Record.
- Deterministic and direct sleep saves share wake-date fields.
- Replaced fragile free-text sleep-time entry with hour, minute, and AM/PM pull-downs.
- Added sleep-specific editing for date, start, end, quality, interruptions, and notes.
- Added reversible Remove controls for Recent Health Record. Removal creates an audit-preserving undo event instead of silently deleting history.
- Recent Health Record and Dashboard search recognize sleep as a first-class Health record.

## Fitness

- Preserved the v0.25.2 direct mobile Save Workout click path, submit fallback, visible status, and error handling.
- Fitness opens on Favorites; when none are selected, it clearly shows the most-used fallback and explains how to favorite an activity.
- Activity cards are genuinely clickable and open focused activity details, replacing dead or ambiguous “view activity” behavior.
- Renamed the ambiguous “+ Add activity” affordance to **+ Create activity type**.
- Strength, cardio/stair, walking, rehabilitation, mobility, recovery, sport, and functional views show only relevant fields.
- Stair steps, ambulatory/walking steps, distance, duration, average heart rate, level/intensity, load, repetitions, and sets remain distinct fields.
- Workout history supports reversible Remove and a focused incomplete-record view.
- Added a provider-backed Goals panel. Goals may be reviewed structurally without AI or optionally reviewed by a connected AI. AI review is advisory, cannot save or alter the goal, and is not medical clearance.

## Medications and supplements

- Today’s medication actions now ask for an explicit outcome: **Taken today**, **Missed today**, or **Not taken yet**.
- Only a confirmed taken event marks a medication action complete.
- Added reviewed batch backfill for past medication doses using a date range and daily/weekly schedule. The preview lists dates, skips existing matching doses, and saves with batch provenance.
- Added visible recurring-schedule success and failure feedback; corrected the schedule-save path that could reference an undefined label.
- Kept the monthly medication/supplement review separate from individual dose completion.

## Profile portability

- The user profile now lives in provider-backed workspace preferences rather than an app-local personal profile record.
- A legacy local profile is migrated into the connected workspace when possible and then removed from the old local key.
- Device-local operational preferences may remain local; durable personal profile content follows the user-owned storage boundary.

## Evidence and recommendations

- Coach’s Eye contains actionable considerations only and may legitimately say that nothing needs attention.
- Trends & Analysis remains descriptive and may identify changes that require no intervention.
- Evidence review shows observations, limitations, dated records, related actions, Pattern Lab access, and a focused PubMed topic search.
- Recommendations remain cautious considerations grounded in available user data and research context rather than clinical directives.

## Interaction reliability

- Added lightweight global search across records, conversation, and discoveries.
- Limited render-state restoration to the app root so a delayed render cannot overwrite data being typed into an open modal.
- Preserved direct, visible success/failure outcomes for meaningful saves.

## Documentation and governance

The existing ZEKE Constitution was edited directly. Architecture, feature status, handoff, project state, gate, decision log, error log, registry, iteration record, test report, and release evidence were reconciled for this release. No parallel constitution was created.

## Deliberately deferred

- Broad session-based mobile Fitness redesign remains deferred until user-reviewed mockups exist.
- Live Google Drive, Calendar, AI-provider routing, deployed service-worker replacement, protected real-workbook, and physical-device/accessibility verification remain environment checks rather than package-local claims.
