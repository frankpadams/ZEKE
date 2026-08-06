# Test Report — ZEKE v0.40.5 RC1

**Build:** 2026.08.06.5
**Date:** 2026-08-06

## Passed

- `node --check assets/app.js`
- 18 package-local JavaScript test suites
- `python3 tests/governance-negative-controls.py`
- `python3 tools/project_audit.py --root .`
- `python3 tests/rendered-workflow-smoke.py`
- `python3 tests/v040-rendered-smoke.py`
- `python3 tests/support-report-browser-smoke.py`

## Not run as package-local passes

The following require a protected/external real-data fixture through `ZEKE_TEST_DATA_ROOT`:

- `integrity-live-repair-transaction.test.js`
- `workbook-preflight.test.js`
- `workbook-real-data-idempotency.test.js`

These are classified as fixture-dependent, not regressions.

## Findings fixed during Sprint 5

- Obsolete structural expectations for legacy workout classes and the old mobile “Log” label.
- Missing accessible names on activity-entry close controls.
- Unbounded rendered-test waits and stale workout-entry interaction path.

## Environment boundary

Package-local testing cannot establish live Google Drive durability or physical-device behavior.
