# Test Report — ZEKE v0.23.1

**Build:** 2026.07.20.1

## Passed package checks

- JavaScript syntax checks passed for `assets/app.js`, `assets/parser.js`, `assets/data-layer.js`, `assets/ai-router.js`, `version.js`, and `sw.js`.
- Twelve executable Node regression tests passed, including sleep parsing, idempotent confirmation, undo, dashboard composition, navigation hierarchy, shared Fitness recommendations, medication safeguards, workbook commit verification, and source-replacement backup.
- Isolated Chromium rendering completed without page errors for Dashboard, Fitness, Health, Questions, Insights, and a 420-pixel mobile Dashboard viewport.
- Rendered interaction checks confirmed the Sleep + Log fields, sleep-specific edit fields, workout optional fields during initial entry, and a concrete sleep review showing source, proposal, question, and actions.
- Governance negative controls passed for stale identity, scope mismatch, constitutional conflict, wrong file count, broken links, stale registry identity, stale Project Health identity, contradictory gate language, and iteration lifecycle mismatch.
- Project governance audit passed after continuity reconciliation and final package count synchronization.

## Not executed in this environment

- `tests/workbook-preflight.test.js` and `tests/workbook-real-data-idempotency.test.js` require the protected external `ZEKE_TEST_DATA_ROOT` fixture. They were not executed and are not represented as passed.
- Live Google Drive, Google Calendar, configured AI providers, GitHub Pages cache/service-worker behavior, physical-device mobile behavior, and assistive-technology accessibility remain environment verification outstanding.

## Packaging checks

- The final ZIP is reopened into a fresh directory.
- File inventory and SHA-256 checksums are compared with staging.
- Syntax, structural regressions, governance audit, and release identity checks are repeated against the reopened package.
