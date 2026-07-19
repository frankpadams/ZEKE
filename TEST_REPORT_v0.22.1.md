# Test Report — ZEKE v0.22.1

**Build:** 2026.07.19.1

## Passed
- JavaScript syntax check for the active application bundle.
- Existing medication, factor-idempotency, workbook, release-structure, and navigation/coaching/profile structural regressions.
- Project governance audit with current identity, lifecycle, Project Health, and release-status consistency checks.
- Governance negative controls for stale version, scope mismatch, constitutional conflict, wrong file count, broken link, stale registry header, stale Project Health identity, contradictory release-gate status, and incorrect current-iteration lifecycle.
- JSON parse checks for authoritative machine-readable state.
- Current artifact registry and authority-set agreement.
- Final checksum generation and ZIP reopen/byte comparison.

## Not verified in this environment
- Credentialed Google Drive, Calendar, or live AI-provider behavior.
- Deployed-origin browser rendering.
- Continuous manual browser-width dragging and real-device mobile usability.
- Real-data workbook tests that require the external ZEKE_TEST_DATA_ROOT fixture.
