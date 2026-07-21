# Iteration Record — ZEKE v0.23.1

**Build:** 2026.07.20.1  
**Status:** Implementation complete; package verification in progress  
**Approved:** 2026-07-20T05:55:29Z

## Baseline

- Uploaded authoritative package: ZEKE v0.23.0 · build 2026.07.19.5.
- User supplied deployed screenshots and direct acceptance feedback.
- The baseline continuity audit exposed stale release authorities; reconciliation is included in this release.

## Approved scope

- Make sleep confirmation atomic and save confirmed sleep to structured history
- Add direct sleep logging from the Health Library Sleep tile
- Replace abstract Review Questions with original input, concrete proposal, uncertainty, and explicit actions
- Repair health trend labels, suppress display duplicates, and add duplicate protections for new entries
- Recompose the Dashboard as independent vertical stacks to eliminate cross-row whitespace
- Make Coach’s Eye and insight content concrete, user-friendly, evidence-linked, and actionable
- Make Activity Library graph eligibility and metric labels consistent and explain missing graphs
- Expose the same optional RPE, pain, technique, notes, and injury-context fields during workout creation and editing
- Use one authoritative exercise recommendation across Fitness surfaces
- Move Labs into Health and Pattern Lab under Insights in primary navigation
- Add durable Potential Health Events and include them in AI relationship-analysis context
- Add health-related calendar follow-up prompts only when downstream record use is defined
- Add regression tests and synchronize the full continuity package

## Explicit exclusions

- Global activity rename, merge, or legacy taxonomy migration beyond existing behavior.
- Paid AI-provider changes or canonical-storage architecture changes.
- Automatic clinical conclusions, diagnoses, treatment recommendations, or inferred appointment completion.
- Silent deletion of historical source observations.

## Implementation summary

- Pending confirmations now route before general parsing. Confirmed sleep saves once, reports the saved destination, and supports undo.
- Sleep is a first-class event with a Health Library tile, structured + Log form, wake-date history, duration, quality, interruptions, notes, and provenance.
- Review Questions display the original source, proposed record/action, uncertainty, and explicit Answer now/Later/I don’t know/Dismiss paths.
- Health metric tiles describe change over the selected period rather than mislabeling change as reference-range status. Display duplicates are suppressed without deleting source history.
- Dashboard cards are arranged in independent vertical stacks. Fitness uses one recommendation engine and consistent graph descriptors.
- Workout creation and editing expose equivalent optional effort, pain, technique, notes, and injury/PT fields.
- Insights and Coach’s Eye use concrete, actionable language. Calendar follow-ups state their downstream use and do not treat scheduled events as proof.
- Potential Health Events are durable, auditable context included in direct and manual AI relationship-analysis packets.
- Labs is a Health subview and Pattern Lab is an Insights subview.

## Verification record

See `../TEST_REPORT_v0.23.1.md` and `RELEASE_GATE.md`. Environment-dependent behavior remains separately identified.
