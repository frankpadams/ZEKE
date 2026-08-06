# ZEKE v0.20.3 Release Notes

**Build:** 2026.07.17.12  
**Release:** Development Gate & Data Compatibility Release

## Development continuity
- Adds `00_AI_START_HERE.md`, a mandatory stop-and-approval gate for every new development conversation.
- Adds a machine-readable development authorization record.
- Records the startup-gate failure and new prevention rules in the cumulative error log.
- Requires future handoffs to consult accessible prior ZEKE conversations for binding user decisions while independently verifying earlier assistant claims.

## Workbook safety and compatibility
- Preserves the exact-cell provenance created by the v0.16.3 recovery.
- Recognizes all 188 verified workbook observations in the supplied repository without rewriting their IDs, source keys, dates, or provenance.
- Adds a read-only **Run preflight** action in Settings.
- Stops synchronization before writing when conflicts or unsupported changes are detected.
- Removes automatic workbook synchronization from ordinary Talk to ZEKE saves and corrections.
- Requires read → normalize → compare → preview → explicit commit → persisted verification, with an append-only transaction journal.
- Archives the previously connected source workbook before an approved replacement, while continuing to regenerate only a separate event mirror after verification.

## Medication reliability
- Separates **taken**, **missed**, **not taken yet**, and uncertain medication mentions.
- Requires a known daily or weekly schedule before expanding a date range.
- Shows every proposed backfill date before confirmation and identifies matching existing records that will be skipped.
- Uses canonical medication identities for matching while retaining original wording.
- Stores confirmation preferences in the user-owned ZEKE repository rather than browser-only storage.
- Prevents null schedule records from appearing as January 1, 1970.
- Prevents missed, not-yet-taken, pending, or uncertain medication records from completing Today’s Actions.
- Repairs damaged word-boundary characters in concept matching and activity-name formatting.

## Review workflow
- Prevents concurrent startup routines from creating duplicate open clarification questions with the same question key.
- Preserves existing duplicate records as audit history; this release does not silently delete user data.

## Verification
- Passed syntax, JSON, structural, medication, question-idempotency, workbook transaction, source-backup, and real-data idempotency regressions.
- Rendered the dashboard at 1440, 1024, 768, and 390 pixel widths with no document-level horizontal overflow.
- Live Google Drive, Calendar, AI-provider, and deployed-origin behavior remains a deployment test.

## Deployment
Deploy as a full replacement. Do not merge individual files into an older release. Read `README.md` and verify v0.20.3 / build 2026.07.17.12 after deployment.
