# ZEKE v0.32.0 — Data Integrity and Workflow Reconciliation

Build: `2026.08.02.1`

## What changed

- Serialized event writes so rapid taps, retries, and concurrent saves cannot create the same exact record twice.
- Added exact event identity checks inside the canonical data layer rather than relying only on UI-level duplicate prompts.
- Normalized optional heart-rate fields so `0` is treated as missing rather than a physiological measurement.
- Added a first-class supersession transaction: corrected records can now deactivate the original, preserve it in audit history, and link the replacement in both directions.
- Added automatic reconciliation of medication-schedule questions against confirmed recurring actions. Stale Mounjaro schedule questions are resolved from the existing weekly-Friday schedule instead of remaining open.
- Added duplicate-question reconciliation for repeated open factors with the same `question_key`.
- Corrected activity inference so bicycling is cardio and kayaking/canoeing/paddling are sport/recreation rather than falling back to strength.
- Replaced the ambiguous cardio “Steps / distance” field with separate distance and steps inputs.
- Added distance and effort fields to sport/recreation activity entry.
- Updated startup and cache metadata to v0.32.0 on desktop and mobile.

## Data safety

This release does not silently rewrite the user’s existing live records. Existing duplicates, the 20-hour sleep record, and legacy kayaking/cycling entries remain available for guided review. The new data-layer functions provide the safe transaction behavior required for that repair workflow.

## Known remaining work

- Add the guided live-data repair screen for sleep corrections, malformed kayaking/cycling records, and non-workout exact duplicates.
- Consolidate stale discoveries and historical repository artifacts after the runtime integrity phase is complete.
- Complete the broader fitness-module improvements and dashboard redesign discussed for the coordinated release.
