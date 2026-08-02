# ZEKE v0.32.0 Test Report

Build: `2026.08.02.1`

## Passed targeted tests

- `sleep-data-transaction.test.js`
- `factor-idempotency.test.js`
- `activity-foundation.test.js`
- `workflow-engine.test.js`
- `v032-integrity-reconciliation.test.js`
- `release-structure.test.js`
- `workbook-preflight.test.js` against the supplied live Project Zeke export
- `workbook-real-data-idempotency.test.js` against the supplied live Project Zeke export

## New v0.32 checks

- Concurrent exact duplicate writes return the same stored record and create only one event.
- Confirmed recurring Mounjaro schedule resolves open schedule questions.
- Duplicate open questions with the same key are superseded.
- Zero average heart rate is normalized to missing.
- Superseding a record excludes the original from analysis and preserves linked provenance.

## Existing historical test caveat

Several older version-specific contract tests intentionally require v0.26/v0.27/v0.30 metadata and therefore fail after a current-version release. They are historical release assertions rather than current regression gates. A pre-existing gym-mode test also reports a missing guide-image fallback, and a pre-existing sleep/insight test reports an older schema-string expectation. These were not represented as passing.
