# Iteration Record — v0.20.3

**Status:** Authoritative release record  
**Build:** 2026.07.17.12  
**Release:** Development Gate & Data Compatibility Release

## Approval
The Pre-Development Checkpoint was presented before editing. The user explicitly approved the proposed scope and repository-based medication confirmation preferences at **2026-07-18T02:54:01Z**.

## Prior-conversation continuity review
At the user’s direction, accessible prior ZEKE conversations were reviewed before further implementation. The review reaffirmed Google Drive as the canonical durable repository; local storage as UI/session state only; synchronization as read → normalize → compare → preview → explicit commit → verify with backup and transaction journal; confirmation before committing interpreted alpha entries; no carried-forward observations; patching the existing application rather than restarting it; preservation of Google connection continuity; no GitHub references in the user interface; and delivery as a full replaceable ZIP with visible version verification. Earlier assistant claims were treated as unverified unless corroborated by the package, data, or tests.

## Source baseline
`ZEKE-v0.20.2-Continuity-and-Layout-FULL(1).zip`

## User-data fixture reviewed
`Project Zeke.zip` was treated as read-only. Its repository, source workbooks, recovery records, mirrors, and historical AI artifacts were used to design and test compatibility. No file in that archive was modified or included in this release.

## Approved scope
- Harden the mandatory startup and scope-approval gate.
- Preserve and recognize v0.16.3 exact-cell workbook identities without rewriting recovered data.
- Add a read-only workbook preflight and require the supplied data fixture to reconcile as 188 unchanged observations with zero creates, updates, or conflicts.
- Complete MED-008: distinct statuses, schedule-aware backfill, explicit previews, duplicate protection, canonical identity with original wording retained, null-date safety, and repository-based confirmation preferences.
- Prevent duplicate generated clarification questions while retaining audit history.
- Synchronize documentation, version identity, tests, checksums, and the final package.

## Explicit exclusions
See `DEVELOPMENT_GATE.json`. In particular, this iteration does not rewrite the supplied repository, reconstruct legacy AI evidence links, redesign Fitness, implement dashboard editing, migrate all schemas, or redesign AI-key storage.

## Implemented
- Added a root-level mandatory startup gate and machine-readable authorization state.
- Added backward-compatible exact-cell workbook identity generation and legacy alias support.
- Expanded workbook mapping to cover all 188 verified source observations, including body-fat, laboratory, and two-cell workout evidence.
- Added an independently callable, non-writing preflight in Settings.
- Removed automatic workbook synchronization after conversational saves and corrections.
- Added medication canonical IDs while retaining original labels.
- Distinguished taken, missed, not taken yet, and uncertain mentions.
- Required a known or explicit regimen before range backfill; previewed every proposed date; and avoided implicit daily expansion.
- Stored medication confirmation preferences in the user-owned repository.
- Added null/invalid date display protection.
- Added idempotent generated-question writes.
- Ensured medication Today’s Actions complete only for confirmed administered doses, never missed, not-yet, pending, or uncertain records.
- Added reviewed workbook transactions with an append-only journal, persisted post-commit verification, and archival backup of a previously connected source before replacement.
- Repaired literal control characters that had broken concept word-boundary matching and fallback activity-title formatting.

## Verification
Automated tests passed for medication parsing, medication Today-action completion, generated-question idempotency, structural release identity, workbook preflight, workbook commit and persisted verification, source replacement archival, and real-data no-change idempotency. The actual 258-event fixture remained at 258 events and reconciled all 188 workbook observations unchanged. The dashboard rendered at 1440, 1024, 768, and 390 pixel widths without document-level horizontal overflow. See `TEST_REPORT_v0.20.3.md` and `RELEASE_GATE.md` for exact boundaries. The supplied real-data fixture is not distributed with ZEKE.


## Completion
The release package was reopened into a clean directory and compared with staging. All 223 files matched exactly, all 20 critical SHA-256 checksums passed, and the applicable regression suite passed again from the unzipped package. Live connected-service testing remains a deployment responsibility and is not represented as complete.
