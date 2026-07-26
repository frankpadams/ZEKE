# ZEKE v0.31.0 — Mobile Workout Visual Fidelity and Form Guides

**Current version:** 0.30.0  
**Build:** 2026.07.26.1

## Current focus

ZEKE now treats “Gym” as the phone entry point into the mobile workout-entry experience rather than a separate architectural mode. The mobile interface is optimized for rapid entry while desktop Fitness remains optimized for review, planning, correction, history, and analysis.

## Locked behaviors

- Effective date is visible and editable on workout, condition, lab, measurement, and other structured entry screens.
- Routines are templates only and do not become historical workout units.
- Primary workout fields may be prefilled; optional fields remain blank.
- Prefilled, suggested, or progression-applied values are not saved until confirmed.
- No elapsed workout timer is required.
- Form Guide imagery must actually depict the named exercise and retain licensing/attribution.
- Desktop ZEKE must not regress because of mobile workout-entry work.

---

## Prior continuity content

# ZEKE Handoff Brief

**Current runtime:** ZEKE v0.29.0 · build 2026.07.25.1  
**Governance revision:** 2026.07.25.2  
**Source lineage:** v0.27.2 recovery baseline → clean v0.29.0 Gym Mode recovery.  
**Rejected path:** v0.28.x remains rejected as a forward-development baseline.

Start with `00_AI_START_HERE.md`, then read the Constitution, Project State, current iteration record, Architecture, Feature Status, and current Test Report.

## What this package is

This is the v0.29.0 application runtime plus fully reconciled governance and continuity documentation. The continuity reconciliation did not change application source, styles, routes, tests, or runtime behavior.

## Implemented in the v0.29.0 runtime

- A mobile-focused Gym Mode entry flow with a visible editable workout date.
- Start from Routine or Enter Exercises; commonly used exercises, library search, and custom exercise entry.
- One-at-a-time exercise addition, reordering, and explicit Suggested / Not started / In progress / Saved states.
- Primary-field prefill from the most recent confirmed exercise entry; optional RPE, pain, rest, and notes begin blank.
- Per-set editable load/reps, activity-specific strength/cardio fields, optional cardio intensity range.
- Written Coach’s Eye output, qualitative numberless gauge, and an unsaved Apply Recommended Progression action.
- Progression history inside Gym Mode.
- Saving to storage → Saved language, with failure retained for retry.
- Temporary local recovery for unfinished normal-browser workout entry.
- A Form Guide bottom sheet with a reviewed-image subset and truthful no-image fallback.

## Not yet established by this runtime

- Provider-agnostic storage adapters beyond the current Google-oriented implementation.
- The secure cross-device AI credential vault and PIN security service.
- Multiple sleep segments in one sleep day.
- Editable effective dates on every structured entry screen.
- A separate spacious desktop Workout Entry experience.
- Provider-backed routine management.
- A real multi-image Form Guide movement sequence.
- A research-reviewed readiness methodology; the current v0.29.0 rule is a simple heuristic.
- Physical-device and deployed-provider acceptance.

## Development boundary

Continue from v0.29.0, not from v0.28.x. Protect desktop ZEKE, keep storage semantics provider-neutral, preserve blank-versus-zero and suggested-versus-confirmed distinctions, and require rendered phone/desktop evidence before visual or behavioral claims.
