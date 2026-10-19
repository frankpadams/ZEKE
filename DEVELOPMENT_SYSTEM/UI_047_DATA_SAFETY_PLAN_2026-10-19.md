# ZEKE 0.47 UI preservation and data-integrity gate
Date: 2026-10-19
Status: proposed implementation plan; NOT an approved release.

## Non-negotiable constraints
- Treat 0.47 as a visual reference, not a database or code rollback.
- Preserve all later 0.48/0.49 behavior and data unless the owner explicitly approves a change.
- Never overwrite, migrate, or delete live personal records during visual work.
- Never display a successful save until durable storage confirms it.
- Record failed writes, reads, and AI interactions in the existing Improvements Log, with stable IDs and deduplication.
- Do not claim tests passed without actual evidence.

## Required implementation sequence
1. Inventory every persistence path (browser, local files, Google Drive), schemas, credentials boundary, and migration logic.
2. Create a verified, restorable backup/snapshot before any data-affecting operation. Test restoration with nonproduction data.
3. Compare the 0.47 UI to current dashboard and mobile layouts; identify presentational changes independently from data flows.
4. Make UI adjustments incrementally without replacing 0.48/0.49 components or persistence logic wholesale.
5. Implement explicit save states: pending, confirmed, failed, retry; avoid false confirmation.
6. Log failures with timestamp, operation, error, retry state, and link to an existing issue when duplicate.
7. Run automated regressions, mobile/desktop rendering checks, and nonproduction save/reload/duplicate/reconnect tests.
8. Require owner acceptance and live-provider validation before release or production data migration.

## Release blockers
- Missing or untested backup/restore procedure.
- Silent save failure, duplicate record creation, or destructive migration.
- Unreviewed Improvements Log issues.
- Visual regressions relative to approved 0.47 baseline.
- Any assertion of live integration success without observed evidence.

This document records safeguards only. It does not establish that the audit, backup, code changes, or tests have occurred.
