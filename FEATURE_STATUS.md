# ZEKE v0.43.0 RC2.1 Feature Status

**Build:** 2026.08.16.3

## Implemented in package

- Canonical user-owned JSON repository with provenance/corrections.
- Unified Talk to ZEKE conversation and workflow engine.
- Mobile `+ Log Exercise` page using inline editable set rows, variation selector/creation, optional per-set effort/pain, ZEKE Coach, and variation-aware Form Guide.
- Canonical exercise families with separate variation series on shared chart axes.
- Reviewable historical exercise-name consolidation with preserved original wording.
- Health Measurements/Body Composition schema including DEXA-derived fields and source/method provenance.
- Recent Health Record edit/remove with correction history.
- Medication schedules plus individual dated dose occurrences.
- Opt-in assumed-from-schedule occurrences and historical reconstruction from known schedule start.
- Retroactive medication occurrence editing (taken/missed/delayed/partial/unknown/not-yet-taken).
- Longitudinal last-dose question answering with evidence disclosure.
- Meta/product-feedback separation from health records.
- Read-only conversational interruption of unfinished workflows.
- Upcoming Google Calendar context.
- Mobile-first retrospective calendar scan (past year) with Relevant / Not relevant / Unsure first pass.
- Calendar candidate → Questions for You → confirmed health-record backfill with provenance/deduplication.
- On-demand Health Record Workbook and canonical health JSON export.
- Legacy workbook migration/reconciliation workflow retained but demoted from source-of-truth role.
- AI Router with connected-workspace credential sync across devices.
- Vertical responsive side navigation and mobile overflow gates.
- Consolidated living release/test/provenance histories.

## Implemented but requires environment/user acceptance

- Live Google Drive persistence/reconnect.
- Cross-device AI credential hydration on separate physical devices.
- Calendar retrospective scan against the user's real calendar.
- Physical-phone visual fidelity/touch ergonomics.
- Generated health workbook review against the user's real longitudinal data.

## Incomplete release gates

- Verified visual media for every included PT/rehab movement.
- Physical-phone visual comparison to approved mobile exercise/dashboard design authority.

## Planned / not claimed complete

- Encrypted cross-device credential vault beyond Drive-account protection.
- Additional storage providers (OneDrive/Dropbox/WebDAV/SFTP/local adapter).
- Apple/Outlook calendar connectors.
- Automated causal inference; ZEKE remains association/context oriented.
- Mature learned cross-variation progression prediction (data architecture supports it; learning model remains future work).
