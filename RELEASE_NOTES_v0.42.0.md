# ZEKE v0.42.0 RC1 — Longitudinal Intelligence & Ingestion

**Build:** 2026.08.11.1  
**Parent:** v0.41.0 RC1 · build 2026.08.07.1

## What changed in this package

### Longitudinal core
- Added a reusable longitudinal schema helper that normalizes point/interval records, preserves evidence class/provenance, creates a unified timeline projection, and can propose temporal-proximity relationships without claiming causation.
- Added generic retrospective-range parsing. Statements such as “adequate protein for each of the past 12 days” produce dated, user-confirmed nutrition assertions rather than one note on the entry date.
- Added explicit recognition of retrospective medication-adherence ranges. These are flagged for schedule reconciliation rather than fabricated into doses without checking the active schedule.
- Added structured user-reported vaccination, allergy immunotherapy, and blood-donation/context events.

### Dashboard
- Added a compact 14-day Timeline Snapshot generated only from real ZEKE/calendar records.
- Medication details are excluded from the dashboard timeline by default.
- Empty timeline states explicitly remain empty rather than displaying decorative/fake events.

### Ingestion architecture
- Added a deterministic-first document recognition engine with bounded classification for DEXA/DXA, labs, medication lists, imaging, vaccination records, and immunotherapy records.
- Added review-packet and source-reference-range structures. Classification is a proposal; commit remains a reviewed workflow.
- This foundation is designed for PDFs, screenshots (including patient portals), images, pasted text, and future structured imports. Browser-native screenshot vision/OCR is not falsely claimed as implemented in this static package; the recognition contract is now explicit for the AI/provider layer.

### Calendar privacy architecture
- Added explicit staged consent policy: connection consent and separate ZEKE-calendar creation/sync consent.
- Added per-category defaults and exact-event preview support. Medication and highly sensitive context default to never sync.
- This release defines/enforces the privacy contract in the client architecture; full Google Calendar write integration remains gated behind deployment/OAuth acceptance.

### Governance
- Extended the Constitution with longitudinal context, unified-schema, auditable-recognition, source-range, calendar-consent, truthful-visualization, and generalized-example principles.
- Consolidated the active next-step plan into `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.42.0.md` so older iteration records remain historical evidence rather than competing active instructions.

## Important boundary

This RC implements the schema/parser/UI foundations that can be truthfully tested inside the package. It does **not** claim that a static browser build can independently perform clinical OCR/vision or write a new Google Calendar without the required provider/OAuth deployment. Those workflows are represented by explicit contracts and privacy gates rather than simulated success.
