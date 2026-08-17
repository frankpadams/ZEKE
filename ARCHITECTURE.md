# ZEKE Architecture — v0.43.0 RC2.1

**Runtime build:** 2026.08.16.3  
**Repository schema:** 5

## Product and data boundary

ZEKE is a private, user-owned personal knowledge and management system. The active provider-backed JSON repository is canonical. Raw observations, confirmed records, schedule-derived assumptions, corrections, supersessions, quarantined artifacts, derived insights, source documents, generated reports, and temporary UI state are distinct classes of information.

AI interprets, summarizes, and proposes. Deterministic code plus explicit user choices govern canonical writes. Missing is unknown, not zero. A provider-backed save is complete only after the provider acknowledges the write.

## Runtime

`index.html` loads the readable static runtime directly. There is no compilation step. The service worker is release-specific. The authoritative runtime is the readable static runtime in this package; historical and legacy assets are evidence or migration inputs, not active code. Current runtime files and tests in this package are authoritative.

## Storage/provider boundary

Google Drive is the implemented alpha provider. Provider-neutral semantics remain binding. The Drive root is `Project Zeke`; canonical JSON is stored under managed subpaths such as `health/events.json`, `system/actions.json`, `system/preferences.json`, and `system/ai-connections.json`.

Browser local/session storage is limited to setup/session and UI convenience state. It is not the authoritative health record. Provider OAuth access tokens remain session-scoped. AI provider credentials intentionally live in the connected workspace so they can follow the user across devices; they are excluded from reports and diagnostics. Legacy device-only AI-key storage is migrated away.

## Longitudinal event architecture

`health/events.json` is the primary dated event stream. Events carry stable IDs, timestamps, structured fields, provenance, interpretation/confirmation state, and correction history. `updateEvent()` preserves the prior version in a correction event unless explicitly disabled for purely technical metadata changes.

Historical corrections do not erase evidence. Records excluded from analysis remain auditable. Sources/methods are preserved so measurements from DEXA, smart scales, manual entry, labs, or other methods are not silently treated as interchangeable.

## Medication architecture

Medication identity/schedule and dose occurrence history are separate:

- `system/actions.json` stores standing medication schedules, dose/unit, start/history dates, and adherence mode.
- `health/events.json` stores individual dated medication occurrences.
- Occurrence statuses include taken, missed, delayed, partial, unknown, and not-yet-taken where applicable.
- An occurrence may be explicit/confirmed or `assumed_from_schedule`.
- For an opted-in assume-scheduled medication, ZEKE reconstructs missing expected occurrences from the known schedule start date through today and continues future due occurrences.
- A later correction updates the exact dated occurrence and preserves correction provenance. Schedule changes never rewrite prior dose history.
- Longitudinal questions such as “When did I last have a dose?” are answered from occurrence history and exceptions, not from schedule text alone.

## Conversation/workflow architecture

A conversation message can be a write request, a read-only question, a clarification, or meta/product feedback. An unfinished write workflow may be suspended while a read-only question is answered and then remain available for later resumption. Product/system feedback is explicitly classified as meta-conversation and excluded from health analysis.

Workflow status must agree with canonical storage outcome. The UI must never simultaneously claim that a record is both saved and not saved.

## Calendar architecture

Google Calendar is a contextual source. Scheduling is never proof of completion. Calendar reconciliation has two phases:

1. **Candidate screening** — mobile-first review of up to the prior year, using fast Relevant / Not relevant / Unsure decisions.
2. **Health confirmation** — only selected candidates become detailed Questions for You. ZEKE compares them with existing health records first and avoids duplicates.

Confirmed calendar candidates are saved as dated health/context events with `calendar-confirmed-retrospective` provenance. Allergy/immunotherapy and vaccination candidates become clinical-exposure-style events when confirmed. Non-occurring appointments remain calendar context only.

## Measurements and Body Composition

Health → Measurements is the user-facing hierarchy. DEXA is a measurement method/source, not navigation. Body Composition supports body-fat %, fat mass, lean mass, VAT, appendicular lean mass index, bone mineral content/density, T/Z scores, regional lean mass, and vendor-specific future metrics. Provenance and method remain attached to each measurement.

## Fitness identity architecture

A canonical exercise owns variation-specific histories. New/normalized workout records can carry `exercise_family`, `variation_name`, `variation_id`, `equipment_type`, `load_basis`, and identity confidence. The original user-entered exercise wording remains preserved.

Machine, Bowflex, dumbbell, barbell, cable, band, bodyweight, and other variations are not mechanically equivalent. Canonical exercise charts overlay variations as distinct series on shared axes. Cross-variation predictive relationships may be learned from the user's data but are evidence-based estimates, not universal conversions.

## Mobile exercise architecture

The normal `+ Log Exercise` page is the mobile exercise-entry surface. There is no Gym Mode. Set display and entry are the same rows. Load/reps can differ by set; effort/pain are optional. Variation-aware Coach and Form Guide sections remain on the page and may collapse. High-quality PT visual guides are a publication gate. `DESIGN_AUTHORITY.md` is the visual contract.

## Reports/export architecture

The canonical JSON repository is source of truth. Generated XLSX/JSON outputs are reports. The Health Record Workbook is produced on demand from the current longitudinal store and includes medication dose history, measurements/body composition, labs, illness/injury context, clinical exposures, fitness, and provenance.

Legacy connected workbooks (including SJN1-style data sources) are import/migration/reconciliation inputs only. Spreadsheet edits do not silently mutate ZEKE; any future re-import uses explicit review/compare/commit semantics.

## Integrity architecture

`assets/integrity-engine.js` detects supported duplicate/import/data-quality candidates. `assets/data-layer.js` applies only reviewed changes, preserving provenance and correction history. Missing values are not invented. Current review-based exercise canonicalization follows the same non-destructive principle.

## Verification boundary

Automated package and rendered-browser evidence does not prove live-provider permissions, physical-device usability, external image availability, or clinical effectiveness. Physical-phone acceptance and complete PT media verification remain explicit release gates.
