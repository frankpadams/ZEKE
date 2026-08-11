# Continuity Reconciliation — v0.42.0

This file is the active consolidation of decisions through 2026-08-11. Earlier iteration records remain historical evidence; where they conflict with this document plus the Constitution, the newer explicit decision governs.

## Implemented/foundation in v0.42.0
- Unified longitudinal timeline/schema helpers with provenance and non-causal relationship proposals.
- Dashboard 14-day Timeline Snapshot based only on actual records.
- Retrospective date-range parsing for repeated daily assertions and medication-adherence reconciliation requests.
- Vaccination, allergy immunotherapy, and blood-donation/context event recognition.
- Deterministic-first ingestion/classification contract for DEXA, patient-portal screenshots, labs, medication lists, imaging, vaccinations, and immunotherapy.
- Source-specific clinical range/threshold metadata contract.
- Two-stage Google Calendar privacy policy plus per-event/category sync policy.
- Constitution additions for truthful visualization and generalized rather than anecdote-specific logic.

## Existing v0.41.0 work retained
- Exact exercise variation/equipment/load-basis model and historical reclassification.
- Variation-specific progression and evidence-aware next-session targets.
- Exercise order preservation and workout reordering.
- PT naming/ER-IR separation and form-guide truthfulness.
- Medication-specific adherence modes and assumed-dose provenance.
- Duplicate review, Discover cleanup, Trends recent-window emphasis, dashboard/local timeframe ownership.
- Questions for You, unified Talk to ZEKE, responsive/mobile and integrity foundations.

## Active product requirements carried forward
- Coach's Eye must be visually and semantically distinct from exercise tiles; show multiple meaningful prioritized coaching briefs when warranted, each with rationale, evidence/context, action, and uncertainty. Never pad with weak items.
- Body Area lens should connect injury/symptom/PT/exercise/imaging/context history and eventually provide a truthful body-status visualization.
- Full Timeline/Calendar should combine ZEKE events with connected Google Calendar while keeping Google non-canonical.
- DEXA import entry points: Talk to ZEKE, Health > Body Composition, and Documents/Knowledge Inbox; all route to one review-before-commit workflow.
- Patient-portal screenshots are first-class ingestion inputs; distinguish portal chrome from clinical content and support multi-image/partial/overlap cases.
- Medication reconciliation should periodically offer alias/duplicate review, active/discontinued/new medication review, schedule confirmation, and adherence-mode choice.
- DOB and height are explicit editable profile fields; calculate historical age from DOB rather than storing a static age.
- Context/exposure events are optional, privacy-sensitive, and available to analysis only when user permits. Sexual activity remains internal-only by default.
- Calendar sync: routine meds remain off by default; sensitive categories ask each time or never; show exact proposed calendar title/details before consent.
- Visual communication should expand through real-data timelines, range bars, body diagrams, comparisons, and annotations, never invented analytics.
- Continue responsive top-packing/no unexplained vertical holes, mobile vertical navigation where needed, Activity Library Favorites default, expand/collapse stability, local timeframe placement, and useful evidence drill-down links.

## Generalized coaching rule
User anecdotes are regression scenarios, not special product logic. ZEKE may compare tolerated and poorly tolerated activities/exposures using general attributes (timing, duration, load, movement/body area, order, context, symptoms/outcomes), but temporal association remains distinct from causation.

## App-pattern influences retained
- Fitbod: adaptive split/time/equipment/variety/preference ideas and transparent workout rationale.
- Lyfta/exercise libraries: stronger exercise identity, muscle/body context, and form/reference material.
- Strong/Setgraph: low-friction logging, order/editing, exercise history and progression views.
- ZOZOFIT/body-composition tools: longitudinal/regional comparison concepts, generalized to DEXA and other body-composition sources.
- Patient portals: import rather than retype, but with ZEKE provenance/review safeguards.

## Verification boundary
Package-local tests establish only package-local behavior. They do not prove live Google Drive/Calendar writes, remote AI/vision availability, physical-device rendering, or clinical validity. User acceptance after deployment remains required.
