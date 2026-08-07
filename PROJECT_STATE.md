# ZEKE Current Project State

**Package version:** 0.41.0 RC1  
**Build:** 2026.08.07.1  
**Release label:** Fitness Intelligence & Clarity RC1  
**Last user-deployed baseline:** v0.40.5 · build 2026.08.06.5  
**Lineage:** v0.40.0 deployed baseline → undeployed sprint increments → v0.40.5 deployed/Google-connected → v0.41.0 RC1 candidate

## Current implemented state in this package

- One responsive ZEKE application with unified Talk to ZEKE and direct structured entry.
- Google Drive remains the implemented primary provider; provider-neutral architectural rules remain binding.
- Exercise history can carry a broad `exercise_family` plus an exact `variation_name`, `equipment_type`, and `load_basis`.
- Progression grouping uses the exact variation rather than merging equipment variants.
- Direct activity entry and the multi-exercise workout logger expose explainable next-session targets based on comparable exact-variation history, with RPE/RIR and pain/PT safeguards.
- Historical workout records can be reviewed for identity metadata without replacing the original `structured.exercise` text.
- PT/rehab catalog coverage includes expanded clinician shorthand and separate ER/IR entries; form guides use verified media where available and written fallback otherwise.
- Discover surfaces findings directly and applies deterministic screening against tiny-sample/cross-exercise/shared-time-trend noise.
- Trends & Analysis emphasizes current values and comparable recent windows rather than repeatedly leading with lifetime deltas.
- Dashboard Health-at-a-Glance and Trends sections own their range controls independently; Fitness retains its own range state.
- Today hides when there is nothing due and distinguishes schedule-assumed medication doses from explicit confirmations.
- Duplicate-record review presents both candidate records with plain-language choices.
- Medication schedules support medication-specific adherence modes including opt-in “assume scheduled unless I report otherwise.” Assumed doses retain distinct provenance/status.

## Data boundary

Canonical user records remain distinct from preferences, derived coaching, knowledge objects, and temporary UI state. Missing data is unknown. Historical normalization may add reviewed metadata but must preserve original values and provenance.

## Verification boundary

Package-local syntax/regression/rendered checks can support implementation claims. They do not establish the user’s live Google Drive write/readback, physical-device rendering, remote-media availability, or clinical validity. v0.41.0 is therefore an RC until deployed user acceptance.

## Immediate next boundary

Run v0.41.0 package tests, classify legacy expectations honestly, deploy the complete package as a unit, and perform user acceptance on desktop/mobile plus Google Drive. New feature ideas are deferred unless they block the accepted v0.41.0 workflows.
