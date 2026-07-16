# ZEKE v0.16.0 — Usability & Integrity Repair

## Release blockers addressed
- Automatic connected-workbook sync is paused on startup to stop new fabricated carry-forward events.
- Workbook identities now use stable source ID + sheet + row + metric/exercise/medication identity rather than the sync date.
- Known false `Normal 80-100` blood-pressure artifacts and the confirmed July carry-forward weight/A1c/average-glucose artifacts are excluded from ordinary health views while preserved for audit and repair.
- The Questions & Clarifications route is now registered, so the question counter opens the intended workspace.

## Conversation
- Simple BMI requests are completed directly from the latest verified weight and recorded height instead of entering repetitive confirmation loops.
- Irrelevant medication context is not pulled into BMI calculations.

## Coach's Eye
- Exercise selector grouped by body area.
- On-demand analysis rather than permanently pinning one exercise.
- Timely pre-workout alerts are compact and dismissible.
- Coach's Eye is explicitly limited to training guidance.

## I've Been Thinking
- Broader cross-domain hypotheses only; duplicate workout coaching is removed.
- Duplicate candidate insights are deduplicated.
- Insights can be dismissed.
- Manual refresh records when the area was last refreshed; meaningful data changes remain the primary refresh trigger.

## Layout
- Dashboard modules use a dense two-column grid rather than independent tall columns, reducing large vertical gaps.
- Responsive single-column behavior is retained for narrower screens.

## Important
This build preserves suspect records for audit. It does not silently delete or rewrite the user's historical event file.
