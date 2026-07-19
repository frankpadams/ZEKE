# Test Report — ZEKE v0.22.0

**Build:** 2026.07.18.3

## Passed
- JavaScript syntax check for the active application bundle.
- Medication parser, medication action, factor idempotency, workbook commit/verify, release-structure, and navigation/coaching/profile structural regressions.
- Project governance audit: 0 errors, 0 warnings.
- Governance negative controls: stale version, scope mismatch, constitutional conflict, wrong file count, and broken link all detected.
- JSON parse checks for authoritative machine-readable state.
- Final ZIP reopened and byte-compared with staging.

## Not verified in this environment
- Credentialed Google Drive, Calendar, or live AI-provider behavior.
- Deployed-origin browser rendering.
- Continuous manual browser-width dragging and real-device mobile usability.
- Real-data workbook tests that require the external ZEKE_TEST_DATA_ROOT fixture.
