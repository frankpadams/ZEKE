# ZEKE v0.33.0 — Guided Data Repair and Mobile Workflow Foundation

Build: 2026.08.02.3

## Implemented

- Added a visible Dashboard notice when canonical JSON records need review.
- Added a user-facing Repair Center that asks about real-world facts rather than database terminology.
- Shows evidence, source, recommendation, and confidence before a repair is applied.
- Detects exact duplicate measurements, labs, sleep, medications, and workouts.
- Detects implausible sleep durations over 12 hours and, when available, compares them with a plausible same-night record.
- Detects historical spreadsheet legend text such as “if row is colored blue” that was mistakenly imported as health data.
- Detects kayaking/canoeing/paddling records containing irrelevant steps or a zero heart-rate placeholder.
- Repair actions preserve audit history and use the existing backup/correction mechanisms.
- Added mobile-responsive Repair Center cards, full-width actions, sticky save/cancel areas, and safer modal sizing.
- Updated startup version and service-worker cache identifiers.

## Important behavior

The JSON repository remains authoritative. This release does not re-import the historical spreadsheet. Repairs act directly on current canonical JSON records after user approval.

## Known limits

- Unknown kayaking/cycling distance is not invented. The Repair Center removes invalid fields and leaves distance flagged for user review.
- This release begins the broader mobile redesign; it does not yet complete every dashboard and fitness redesign item discussed.
