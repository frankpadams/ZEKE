# ZEKE v0.30.0 Test Report

## Passed

- JavaScript syntax: `assets/app.js`, `assets/data-layer.js`, `assets/parser.js`, `assets/ai-router.js`, `assets/workflow-engine.js`, `sw.js`, and `version.js`.
- v0.30 mobile workout-entry contract test.
- Existing Gym v0.29 contract test.
- Existing navigation, dashboard, medication, parser, workflow, and activity-foundation tests that do not depend on unavailable external fixtures.
- ZIP integrity and one-root-folder checks.

## Known legacy test failures

- `sleep-and-insight-stabilization.test.js` still expects legacy workout field identifiers.
- `v026-regression-contract.test.js` rejects wording that remains in a historical/custom-activity creation path.
- `v0261-regression-contract.test.js` incorrectly requires v0.26.1 metadata in the current release.
- Workbook tests requiring `ZEKE_TEST_DATA_ROOT` were not run because the protected fixture was unavailable.

## Environment limits

The local browser runner was blocked by the execution environment’s navigation policy. Physical phone testing and deployed remote-image testing remain required before calling the rendered experience fully verified.
