# ZEKE v0.42.0 RC1 — Package Test Report

**Run:** 2026-08-11  
**Scope:** extracted package, local static/runtime tests only.

## Passed
- JavaScript syntax: `assets/app.js`, `parser.js`, `longitudinal-schema.js`, `ingestion-engine.js`, `calendar-privacy.js`.
- New v0.42 longitudinal/ingestion regression test: retrospective 12-day protein assertion, two-month medication-adherence reconciliation flag, allergy immunotherapy, blood donation, DEXA classification, source-specific reference range, calendar privacy defaults, timeline normalization.
- Existing package tests passed: activity foundation; conversation security/editing; dashboard layout acceptance; factor idempotency; form guide library; medication action status; medication parser; navigation/coaching/profile; sleep/insight stabilization; sleep transaction; Sprint 3 workout intelligence; workbook commit/verify; workbook source replacement backup; workflow engine.
- `rendered-workflow-smoke.py` passed, including medication backfill and review workflows.

## Not counted as regressions
Several inherited tests encode an exact historical version string (v0.40.x/v0.41.0) and fail after a truthful version bump; they are historical release assertions rather than forward-compatible behavior tests. `trust-workflow-ux.test.js` also contains an inherited exact-copy expectation not introduced by v0.42.0.

## Environment-gated / not run as acceptance
- Live integrity/workbook tests requiring `ZEKE_TEST_DATA_ROOT` were not supplied a live extracted user repository.
- The older `v040-rendered-smoke.py` exceeded the local execution time budget and is superseded by the passing current rendered workflow smoke for this package.
- No claim is made for live Google Drive/Calendar write-readback, remote AI/vision/OCR, remote media, or physical-device rendering.

## Release assessment
Package-local v0.42.0 additions pass their dedicated regression checks and the current rendered workflow smoke. Release remains RC1 pending deployment and connected-provider/user acceptance.
