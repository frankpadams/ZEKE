# ZEKE v0.41.0 RC1 Test Report

**Build:** 2026.08.07.1  
**Verification boundary:** package-local unless explicitly stated otherwise

## Passed checks

### Runtime / targeted regression

- `node --check assets/app.js` — passed.
- `node --check assets/knowledge-base.js` — passed.
- `tests/v041-fitness-intelligence.test.js` — passed, 17 checks.
- `tests/form-guide-library.test.js` — passed.
- `tests/release-structure.test.js` — passed; v0.41.0 / 2026.08.07.1 identity confirmed.

### Rendered browser

`tests/rendered-workflow-smoke.py` — passed in isolated Chromium.

Covered desktop Dashboard, Fitness, Health, Questions, Discover and mobile Dashboard/Fitness. The smoke found no page errors, missing accessible names, or unbound visible controls on the tested routes. The tested mobile Fitness activity library defaulted to Favorites and did not horizontally overflow. Existing medication confirmation, workflow resume, search, dashboard disclosure persistence, specific relationship review, Coach evidence, goal save, rehab-field activity creation, sleep log/edit, medication review/backfill, review deferral, and recurring-schedule editor flows remained functional.

### Support/privacy workflow

`tests/support-report-browser-smoke.py` — passed. The generated support workbook remained anonymized and cleared logs as expected.

### Governance

`tests/governance-negative-controls.py` — passed all negative controls.

## Broader JavaScript regression suite

**16 passed; 6 returned non-zero.**

### Non-zero: protected fixture unavailable

These tests require `ZEKE_TEST_DATA_ROOT`, which is not available in the package-local test environment:

- `tests/integrity-live-repair-transaction.test.js`
- `tests/workbook-preflight.test.js`
- `tests/workbook-real-data-idempotency.test.js`

They are not represented as passing or failing runtime behavior; they are environment/fixture-blocked.

### Non-zero: obsolete historical expectations

- `tests/sprint2-adaptive-activity.test.js` hardcodes the v0.40.x version pattern and v2 exact rehab-field/schema strings. v0.41 intentionally advances the activity schema/field set; current rehab behavior is covered by the v0.41 structural and rendered tests.
- `tests/trust-workflow-ux.test.js` requires the old technical review headings such as “Original information” and “Proposed record or action.” The approved v0.41 duplicate-review redesign intentionally removes that implementation-facing language; current review interactions are covered by rendered/structural checks.
- `tests/v040-major-milestone.test.js` is a historical v0.40 milestone assertion and hardcodes the prior current-version identity. It is retained as historical evidence rather than rewritten to manufacture a current pass.

## Feature-specific v0.41 checks

The new v0.41 regression verifies presence/structure for:

- exact exercise identity and review-based historical mapping;
- exact-variation progressive-overload/evidence behavior;
- section-owned Dashboard ranges and removal of the detached topbar range selector;
- Discover screening and recent-oriented trend logic;
- plain-language duplicate review;
- schedule-assumed medication adherence provenance;
- expanded PT entries and removal of uncertain `K` shorthand assertions;
- v0.41 styling hooks.

## Not established by package-local testing

- Live Google Drive authentication and durable provider-backed write/readback.
- Physical iPhone/Android behavior.
- Remote form-guide media network availability in the deployed environment.
- Protected real-workbook fixture behavior without `ZEKE_TEST_DATA_ROOT`.
- User acceptance of recommendations against the user's real workout history.

**Package verification complete; environment verification outstanding.**
