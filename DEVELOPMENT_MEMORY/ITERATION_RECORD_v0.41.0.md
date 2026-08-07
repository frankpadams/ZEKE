# Iteration Record — ZEKE v0.41.0 RC1

**Build:** 2026.08.07.1  
**Parent runtime:** v0.40.5 · build 2026.08.06.5  
**Approval:** user explicitly approved the plan and said “Time to get coding.”

## Approved scope

- Implement exact exercise family/variation/equipment/load-basis identity with non-destructive historical review.
- Expand PT/rehab exercise support, readable abbreviation expansion, separate ER/IR logging, and form-guide recognition help.
- Put explainable progressive-overload targets and evidence access directly in workout logging, using RPE/RIR and pain/PT safeguards.
- Redesign Discover around meaningful findings and suppress trivial/tiny-sample/shared-time-trend pattern noise.
- Reorient Trends & Analysis toward current state and comparable recent momentum rather than repeated lifetime milestones.
- Move Dashboard timeframe selectors into the sections they actually control and decouple Dashboard from Fitness range state.
- Make Today compact and genuinely action-oriented without duplicating pending questions.
- Replace technical duplicate-record review with a side-by-side plain-language decision workflow.
- Add medication-specific adherence modes including opt-in schedule-assumed doses with explicit assumption provenance and correction paths.

## Implementation notes

- Runtime code was changed only after continuity/governance docs were reviewed and the accepted scope was recorded in `PRE_IMPLEMENTATION_REVIEW.md`.
- The user-provided `events (3).json` is read-only reference material and is not part of the release package or migration target.
- Historical exercise repair adds reviewed identity metadata via the normal correction path; it does not replace the original exercise wording.
- New PT guides do not substitute unrelated imagery when verified movement media is absent.

## Verification boundary

Package-local checks can verify syntax, structure, deterministic UI wiring, governance continuity, and rendered smoke behavior where browser tooling is available. Live Google Drive, physical-device behavior, remote media, and clinical appropriateness still require environment/user acceptance.
