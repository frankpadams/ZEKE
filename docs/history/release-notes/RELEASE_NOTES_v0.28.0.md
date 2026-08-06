# ZEKE v0.28.0 — Workout Programs & Trusted Gym Logging

Build: 2026.07.23.0005

## What changed

- Added reusable Workout Programs, including built-in general routines, injury-aware examples, and user-created programs.
- Added Choose Program and Build Program controls to Today's Workout.
- Program selection creates an editable workout draft; it does not mark exercises complete.
- Exercise state now distinguishes not started, draft, and saved.
- Added explicit Cancel Workout and Finish Workout actions.
- Confirmed exercise entries are written to the existing workout event ledger with program identifiers, transaction provenance, and nulls for unentered values.
- User-created programs are written to the connected ZEKE preferences repository through the existing data layer.
- Finishing creates a workout-session summary event; merely opening or exiting Gym Mode does not.
- Added a deterministic readiness score based on confirmed recent sessions, pain, RPE, and load progression.
- Made Progression open the existing activity history view.
- Entering 0 repetitions removes that set; a blank field remains unknown.

## Safety and limits

Injury-aware built-in programs are conservative planning examples, not medical clearance, diagnosis, physical therapy, or individualized rehabilitation. Form Guide licensed photography and fully reviewed exercise-specific content remain pending rather than being represented as complete.
