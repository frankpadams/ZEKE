# ZEKE v0.41.0 RC1 — Fitness Intelligence & Clarity

**Build:** 2026.08.07.1  
**Parent runtime:** v0.40.5 · build 2026.08.06.5

## Fitness identity and progression

- Added exercise-family plus exact-variation metadata, equipment type, and load basis.
- Kept progression histories variation-specific so machine/dumbbell/barbell/Bowflex/band/cable loads are not merged.
- Added a user-reviewed historical identity workflow that preserves original exercise text and provenance.
- Added next-session targets directly to both direct activity entry and the multi-exercise workout logger.
- Targets use comparable history, reps/load, RPE/RIR when present, training gaps, pain, and PT/injury context.
- Added research/evidence access from progression guidance.

## PT / rehab

- Expanded shoulder/PT entries reflected in the user’s paper program.
- Expanded common abbreviations in display names while preserving shorthand in parentheses.
- Kept external rotation and internal rotation as separate loggable movements even if a paper plan groups ER/IR.
- Added flexible rehab fields and written form guides; verified movement images are shown only where available.

## Discover and Trends

- Removed the duplicated Questions card and empty system-bucket layout from Discover.
- Folded Pattern Lab into a secondary “Explore all patterns” drill-down.
- Added deterministic filtering of tiny-sample, cross-exercise, same-activity metric, and shared-time-trend pattern noise.
- Reoriented Trends & Analysis toward current state and comparable recent windows; lifetime change is secondary context.

## Dashboard / Today

- Removed the detached global-looking Dashboard time selector.
- Health-at-a-Glance and Trends now own independent local range selectors; Fitness retains its own range.
- Today hides when empty and distinguishes schedule-assumed medication doses from explicit confirmations.

## Trust / medication workflow

- Replaced technical duplicate-review language with a side-by-side comparison and direct user choices.
- Added medication-specific adherence modes: confirm each dose, assume as scheduled unless reported otherwise, or schedule-only/no individual dose tracking.
- Schedule-assumed doses are stored with explicit assumption provenance and can be corrected by the user.

## Data safety

The uploaded `events (3).json` was used only as read-only compatibility reference and is not modified by this package. Ambiguous historical equipment remains unspecified unless the user reviews it.
