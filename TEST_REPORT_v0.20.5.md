# Test Report — ZEKE v0.20.5

**Build:** 2026.07.18.1

## Independently reproduced in this build environment
- All JavaScript syntax checks passed.
- All JSON files parsed.
- Medication parser: 6 tests passed.
- Medication Today-action: 8 tests passed.
- Generated-question idempotency passed.
- Workbook commit/verify and source-replacement backup tests passed.
- Supplied Project Zeke data regression: 188 candidates; 188 unchanged; zero creates, updates, links, conflicts, skips, or unsupported updates; 258 events before and after.
- Project governance audit: zero errors and warnings.
- Negative controls passed for stale version, scope mismatch, constitutional conflict, wrong package count, and broken link.

## Package cleanup
Legacy duplicate application bundles and obsolete partial-replacement instruction files were removed from the active package. Historical release and test records remain non-authoritative audit history.

## Explicit verification boundaries
Live Google Drive, Calendar, AI-provider, branding-asset, and deployed-origin browser behavior require the user's configured environment. No claim is made that those were verified here.
