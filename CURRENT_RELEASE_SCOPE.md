# ZEKE v0.45.1 — Current Release Scope

**Build:** 2026.08.23.4  
**Status:** implementation integrated; package verification in progress; environment verification outstanding.

## Included

- Complete reconstructed v0.45.1 package with portable runtime architecture
- Top-level Log plus non-mutating Fitness exploration/planning/training workflow
- Editable adaptive workout proposals transferred into active workout entry
- Live adapt-remaining-workout planning using saved work, order, pain/RPE, fatigue, and clinical constraints
- Remembered equipment/location profiles for Planet Fitness and home environments
- Movement-specific verified two-frame schematic PT guides for all included rehab entries
- Generic PDF/image intake with embedded-text-first PDF extraction, OCR fallback, source hash/provenance, preview, AI/manual extraction, and review-before-save
- DEXA structured extraction path inside generic document intake
- Illness/injury/context interval entry with ongoing and approximate dates
- Medication reconciliation surface with alias grouping, status, schedule, and adherence mode
- Staged calendar connection/creation consent and per-category ask/always/never privacy preferences
- Single Dashboard Insights surface and Fitness-specific pattern filtering
- Canonical exercise variation histories and charts retained
- Manual and connected-AI clinical/workout consultation retained

## Binding UX behavior
- Navigation is informational by default. Opening Fitness/exercises/PT/history/plans does not create records.
- Log is a top-level recording intent; contextual logging is available where natural.
- A proposed workout is inspectable/editable before explicit Start. Starting carries the proposal into the active workout.
- Active-workout adaptation changes only remaining unsaved work; completed records remain preserved.

## Safety / truth boundary
ZEKE is decision support, not diagnosis, prescription, contraindication, or medical clearance. Clinician/PT restrictions outrank AI suggestions. Missing pain/symptom data remains unknown. Source facts, restrictions, AI inferences, and observed response retain provenance and evidence class.

## Release environment boundary
Package-local verification cannot prove deployed Google Drive/Calendar, connected-AI provider behavior, or physical-device visual acceptance. Those checks remain explicitly outstanding until performed.

## Preserved continuity contracts
- **Generated spreadsheets are reports**, not a second canonical database.
- **Medication occurrence history** remains dated, revision-safe, and distinguishable from schedule-derived assumptions.
- **Package continuity** remains a release requirement: the complete package must be understandable without prior chat history.
