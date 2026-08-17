# ZEKE Current Project State

**Package:** v0.43.0 RC2.1  
**Build:** 2026.08.16.3  
**Release label:** Longitudinal Integrity & Sync RC2  
**Parent candidate:** v0.43.0 RC1 · build 2026.08.15.1  
**Last known user-deployed baseline:** v0.40.5 · build 2026.08.06.5

## Current direction

v0.43 remains a release candidate focused on three connected goals: trustworthy longitudinal data, intelligent use of that data in conversation/coaching, and an attractive mobile interface that makes entry/correction easy.

RC1 established the authoritative mobile `+ Log Exercise` implementation, canonical exercise/variation charting, reviewable exercise consolidation, Body Composition/DEXA provenance, Recent Health Record editing/removal, responsive vertical navigation, and package/document consolidation.

RC2 adds/changes:

- connected-workspace AI credential sync across devices (legacy local API-key storage migrated away);
- medication dose occurrences as first-class dated history with assumed-vs-confirmed evidence;
- historical reconstruction of opted-in schedule-derived occurrences from the known schedule start;
- retroactive medication occurrence editing and correction history;
- deterministic “last dose” answers from longitudinal medication history;
- read-only question interruption without unfinished workflow hijacking;
- meta/product-feedback classification that does not create health events;
- mobile-first retrospective calendar scan of the prior year with Relevant / Not relevant / Unsure triage;
- Questions for You confirmation of selected calendar candidates and deduplicated health-record backfill;
- Health Reports & Export with generated multi-tab Health Record Workbook and canonical JSON export;
- demotion of the old connected workbook to legacy migration/reconciliation only;
- package-local design authority and full release-scope documents for team continuity.

## Canonical data boundary

User-owned provider-backed JSON remains canonical. Schedule-derived events are explicitly marked assumed. Calendar items remain candidate evidence until confirmed. DEXA is measurement provenance. Generated spreadsheets are reports. AI credentials are system configuration stored in connected user-owned storage and excluded from exports.

## Current blockers

The package remains RC until all PT/rehab visual guides are mechanically correct and verified, and the implementation receives physical-phone visual acceptance against `DESIGN_AUTHORITY.md`. Live provider behavior also requires deployed-environment verification.
