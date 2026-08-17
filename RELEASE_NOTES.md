# ZEKE v0.43.0 RC2.1 — Continuity-Reconciled Release Candidate

**Build:** 2026.08.16.3  
**Runtime basis:** v0.43.0 RC2 longitudinal-integrity implementation  
**Status:** Release candidate; not yet approved for final production deployment.

## What this candidate contains

- Mobile `+ Log Exercise` follows the approved phone composition: canonical exercise, explicit variation, inline editable sets, optional effort/pain, Coach recommendation/rationale, and integrated Form Guide.
- Canonical exercise families retain variation-specific histories and shared-axis multi-series charts.
- Body Composition lives under Health → Measurements; DEXA is source/provenance rather than a top-level feature.
- Medication schedules are distinct from dated dose occurrences. Occurrences can be assumed from a confirmed schedule, explicitly confirmed, missed, delayed, partial, unknown, or retroactively corrected.
- Historical medication occurrence reconstruction is supported without converting schedule-derived events into false certainty.
- Read-only health questions may interrupt an unfinished write workflow; product/meta feedback is excluded from the health record.
- The calendar-to-health reconciliation UX is specifically **mobile-first**: review up to the prior year, triage candidate events as Relevant / Not relevant / Unsure, then deduplicate and explicitly confirm before backfill.
- Health Reports & Export is the normal human-readable reporting path. The legacy connected workbook is retained only for migration/reconciliation until its useful data has been verified as represented in canonical records.
- AI provider credentials are persisted in the connected user-owned workspace for cross-device continuity, not as authoritative browser-local settings. Keys are excluded from normal reports, diagnostics, and package content.
- The package is intended to be self-describing for a new development team. Current state, architecture, decisions, design authority, tests, known issues, release gate, and historical continuity are included.

## Continuity reconciliation in RC2.1

This governance/build increment does not claim new live-environment verification. It reconciles the current documentation corpus with the implemented RC2 architecture and the latest user decisions. In particular:

1. Added this living `RELEASE_NOTES.md`, which the canonical documentation map already required.
2. Recorded that retrospective calendar review is a **mobile-specific interaction requirement**, while the underlying candidate-event/provenance model remains shared.
3. Recorded that API credentials must persist through connected Drive/workspace storage across devices rather than device-local browser storage.
4. Recorded that historic dose-event data must be reconstructed and remain retroactively editable with assumed-vs-confirmed provenance.
5. Recorded that exported workbooks are generated reports, not competing canonical databases.
6. Added supersession guidance so historical “Gym Mode” documents cannot override the current `+ Log Exercise` architecture.
7. Reaffirmed that the final package must stand alone as a handoff artifact.

## Still blocking final promotion

- Six PT/rehab movements still need exact, reviewed two-frame visual guides: Band Internal Rotation, Doorway Chest Stretch, D1, D2, No Monies, and Cheerleaders.
- Physical-phone comparison against the approved exercise-page and broader mobile design references remains required.
- Live Google Drive/Calendar read-write and cross-device credential persistence still require environment verification.
- Legacy workbook/data migration must be checked against the owner’s real data before the workbook UI is fully retired.

## Verification language

Package-local tests can establish deterministic code, structure, and rendered browser behavior. They do not establish physical-device acceptance, live provider behavior, remote-media uptime, or clinical effectiveness.
