# Pre-Implementation Review — v0.41.0 Fitness Intelligence & Clarity

**Baseline:** v0.40.5 · build 2026.08.06.5, successfully opened by the user on the live GitHub Pages deployment and connected to Google.

## Governance and continuity reviewed

Before runtime edits, the current Constitution, Project State, Architecture, Feature Status, Decision Log, Known Issues, Roadmap, post-release review, documentation map, development error log, and backlog were reviewed. The v0.40.5 readable static runtime remains the code baseline.

## User-approved scope

1. **Exercise identity and equipment variations** — model broad exercise/movement families separately from exact equipment-specific variations. Progression and load comparisons must stay variation-specific. Store equipment and load basis where known.
2. **Historical record review** — scan existing workout records and propose identity metadata without replacing original exercise wording or provenance. High-confidence proposals may be batch-reviewed; ambiguous records remain unspecified until the user decides.
3. **PT/rehab expansion** — add common shoulder/PT entries reflected in the user’s PT sheet. Display understandable names first and therapist shorthand in parentheses. ER and IR remain separate exercises even when a paper program groups them. Support sets/reps, holds, side, resistance/band, pain/response, and appropriate rehab fields.
4. **Form guides** — make identification help prominent for PT exercises. Use start/end media only when verified/available; otherwise provide setup, movement, common mistakes, aliases, and safe context. Do not imply a generic form guide supersedes clinician instructions.
5. **Progressive-overload planner** — surface a next-session target directly in the workout logger: exact variation, load/reps/sets target, last relevant performance, concise reason, and evidence link where applicable. Use RPE/RIR when available; suppress aggressive progression with pain, injury/PT context, insufficient data, or a long gap.
6. **Discover** — show actual meaningful discoveries first. Remove duplicated Questions card, suppress empty buckets, integrate Pattern Lab as an advanced drill-down rather than a peer product, attach research to relevant findings, and filter mathematically strong but conceptually weak patterns.
7. **Trends & Analysis** — default to current state and recent change/momentum; compare recent windows, identify plateau/reversal/acceleration when supported, and keep lifetime milestones as secondary context.
8. **Dashboard range controls** — remove the detached top-level range selector and place controls in the section(s) they actually affect. Dashboard range state must not silently change Fitness chart range.
9. **Today** — keep the Dashboard area but make it compact and action-oriented; recurring schedules are one input rather than the feature definition. Do not duplicate pending questions there.
10. **Questions for You duplicate review** — show both potentially duplicate records in plain language with date/time, values, and source; use direct decisions such as Same event / Separate events / Edit / Not sure / Later. Hide technical metadata behind optional detail.
11. **Medication adherence assumption** — allow medication-specific opt-in tracking that assumes a confirmed scheduled dose was taken unless the user reports otherwise. Assumed records must remain explicitly distinguishable from user-confirmed doses and correctable.

## Safety / data rules

- Do not modify the uploaded `events (3).json`; it is read-only reference data.
- Preserve raw observations, original exercise names, provenance, and reversible correction history.
- Do not infer equipment for ambiguous historical records merely from convenience or gym context; leave unspecified when evidence is insufficient.
- Do not equate machine, dumbbell, barbell, Bowflex, band, cable, or bodyweight loads.
- Research may support a recommendation but must not be mislabeled as exercise-specific when only general resistance-training evidence exists.
- Clinician/PT instructions take precedence over generic progression guidance.
- No live-provider, physical-device, remote-media, or clinical-validity claim may be marked verified unless that check actually ran.

## Implementation acceptance boundary

Package-local syntax/regression/rendered smoke tests may establish local implementation quality. The user will still perform live deployment acceptance. Any feature that cannot be completed safely in this iteration must remain documented rather than simulated or overclaimed.
