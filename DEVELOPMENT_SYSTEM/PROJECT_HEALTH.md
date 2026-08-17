# Project Health — v0.43.0

**Runtime build:** 2026.08.16.3  
**Governance revision:** 2026.08.16.3

## Current position

- Last confirmed user-deployed baseline remains v0.40.5.
- Current package candidate: v0.43.0 RC2.1 · build 2026.08.16.3.
- Package-local audit, governance, JavaScript, and rendered mobile/workflow checks are passing.
- Environment verification outstanding: live Google Drive/cross-device behavior and physical-device acceptance still require the user environment.

## Implemented in RC2

- Approved mobile `+ Log Exercise` architecture remains authoritative; no separate Gym Mode.
- Canonical exercises preserve variation-specific histories and shared-axis variation charts.
- Medication schedules now support reconstructable dated occurrence histories with assumed-vs-confirmed provenance and retroactive correction.
- Direct medication-history questions can be answered from longitudinal occurrences while unrelated pending write workflows remain resumable.
- Meta/product feedback is excluded from health-event creation.
- Mobile calendar review can scan the prior year, triage potential health relevance, dedupe, and ask for explicit confirmation before backfill.
- Health Reports & Export generates current workbook/JSON output from canonical data; the legacy connected workbook is migration/reconciliation only.
- AI provider credentials are synced through connected workspace configuration so they can follow the user across devices; legacy local-only keys are migrated and cleared.
- Current release scope and design authority are package-local so a new team can continue without prior chat history.

## Remaining blockers

- PT visual audit remains blocked on six exact movement guides: Band Internal Rotation, Doorway Chest Stretch, D1, D2, No Monies, and Cheerleaders.
- Physical-phone visual acceptance against `DESIGN_AUTHORITY.md` remains outstanding.
- Live Drive write/readback, historical medication reconstruction against real data, retrospective calendar behavior, and cross-device credential continuity require deployed-environment verification.
- The alpha connected-workspace credential model relies on Drive/OAuth confidentiality and does not yet add a separate ZEKE-managed end-to-end encryption layer.

- RC2.1 package-local JS suite: 26/26 passed; project audit 0/0; phone rendered smoke passed. Environment gates remain open.
