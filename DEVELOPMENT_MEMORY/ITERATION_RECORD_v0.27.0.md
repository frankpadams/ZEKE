# Iteration Record — v0.27.0

**Status:** Authoritative  
**Build:** 2026.07.22.3  
**Release:** Gym Entry Mockup Fidelity

## User-approved scope

- Rebuild directly from the untouched v0.26.1 ZIP and follow the established package and continuity process.
- Treat the approved Gym Entry mockup as the specification rather than an invitation to redesign.
- Use the full available window width for Gym Entry Mode.
- Allow vertical scrolling where needed and prevent horizontal page scrolling.
- Preserve the approved Today's Workout and Exercise Workspace hierarchy.
- Use adult-only, fully clothed guide imagery; when imagery is not matched to the user, represent diverse adult backgrounds.
- Preserve prior resolved workout-save behavior and unrelated v0.26.1 functionality.

## Implementation

- Replaced the constrained workout-entry modal with a dedicated full-window Gym Entry Mode.
- Added responsive Today's Workout and Exercise Workspace rendering.
- Added set-by-set strength entry, completion toggles, Add Set, and Copy Set 1 to all.
- Kept Coach's Eye, Progression, Last Workout, Today's Entry, notes, and Form Guide visually separate.
- Added an edge-to-edge Form Guide bottom sheet.
- Added explicit narrow-width rules down to 370 CSS pixels with `overflow-x:hidden` in the Gym workspace.
- Displays an honest “Guide image under review” state rather than unreviewed or incorrectly licensed imagery.

## Continuity correction

The immediately preceding failed release attempts are not authoritative baselines. This iteration returns to the established process documented in `DEVELOPMENT_WORKFLOW.md`: clean prior-release baseline, approved scope only, continuity updates in existing locations, ZIP reopen, and explicit verification levels.

## Explicit limits

- The approved mockup image itself was not embedded into this source package; fidelity was implemented from the approved interaction and layout requirements recorded in project continuity.
- The complete curated exercise-image library is not yet present.
- Physical-device visual comparison, live storage, Calendar, AI, deployed service-worker cache, and protected workbook checks remain environment verification.

## Rollback

Restore v0.26.1 build 2026.07.22.2. No data migration is introduced.
