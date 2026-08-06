# ZEKE v0.40.5 RC1 — Verification Hardening

**Build:** 2026.08.06.5
**Status:** Release candidate; not final until user acceptance.

## Changes

- Reconciled outdated tests with adaptive activity schemas and the unified ZEKE mobile action.
- Added rendered verification for custom Rehabilitation/PT activity fields, including no mandatory weight.
- Fixed accessible naming for activity-entry and custom-activity close buttons.
- Hardened rendered workflow tests with bounded timeouts and current UI paths.
- Reconciled runtime, service-worker, governance, test, and package identity for RC1.

## Verification

- 18 applicable JavaScript regression suites passed.
- 3 real-data/workbook suites require `ZEKE_TEST_DATA_ROOT` and were not run as package-local passes.
- Governance negative controls passed.
- Project audit passed with 0 errors and 0 warnings.
- Rendered workflow, v0.40 milestone, and support-report browser tests passed.
- JavaScript syntax validation passed.

## Outstanding acceptance

- Live Google Drive reconnect and durable write/readback.
- Physical iPhone and representative Android testing.
- User acceptance of the deployed release candidate.
