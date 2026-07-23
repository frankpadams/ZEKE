# Iteration Record — v0.28.0

## User requirements implemented

- Reusable routines such as Chest Day, Push Day, and injury-aware programs.
- Core program facts stored by ZEKE; AI remains advisory for generation and adaptation.
- Blank is not zero.
- No assumed completion or automatic save from merely opening/exiting Gym Mode.
- Backend writes use the established connected repository and event ledger.
- Existing file and directory structure retained.
- Unchanged files retain their original modification times; changed and new files use their real creation/modification times.

## Data placement

- Custom programs: connected preferences repository under workout_programs (schema version 1).
- Confirmed exercise performance: workout event records.
- Finished session summary: workout_session event record.
- In-progress workout draft: session-only browser state; not a durable personal record and discarded by Cancel Workout.
