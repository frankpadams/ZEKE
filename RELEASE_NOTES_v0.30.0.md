# ZEKE v0.30.0 — Mobile Workout Entry and Health Conditions

**Build:** 2026.07.26.1  
**Baseline:** ZEKE v0.29.0 Continuity-Reconciled

## Implemented

- Reframed “Gym Mode” as ZEKE’s mobile workout-entry experience rather than a disconnected subsystem.
- Added a prominent **Gym** action to the phone bottom navigation while preserving the desktop Fitness experience.
- Added a clear **Log exercise or activity** menu with three paths: enter one activity, start from a routine, or repeat the last workout.
- Added a common-exercise chooser with full-library search and custom-activity creation; activities are added one at a time.
- Preserved a visible, editable effective date in mobile workout entry and direct activity entry.
- Kept elapsed workout time out of the interface.
- Added provider-backed custom activity and routine preferences through the existing preference repository.
- Added a routine manager. Routines remain reusable templates and do not become historical workout units.
- Added a dedicated **Health → Conditions → Add condition** workflow with visible/editable date, status, source, optional resolution date, clinician/facility, and notes.
- Retained **All** alongside Week, Month, Quarter, 6 Months, and Year in applicable chart controls.
- Preserved truthful workout states: prefilled or routine-loaded values are not saved until the user confirms a storage write.
- Preserved blank optional fields such as pain, RPE, rest, and notes.

## Media limitation

Form Guide entries continue to show only images already present in the reviewed guide library. ZEKE does not substitute generic gym photographs for exercises without a verified image. Expansion provides a larger instructional view and movement guidance; a fully curated multi-image sequence for every exercise remains future content work.

## Verification boundary

Static JavaScript syntax, release-contract checks, file integrity, and ZIP integrity were verified. Physical iPhone/Android behavior and remote Creative Commons image delivery were not available for direct testing in this environment.
