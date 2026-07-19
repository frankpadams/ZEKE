# Test Report — ZEKE v0.22.2

**Build:** 2026.07.19.3

## Passed locally
- JavaScript syntax checks for active runtime modules.
- Existing regression suite, including activity-foundation structural tests.
- `python tools/project_audit.py`.
- `python tests/governance-negative-controls.py`.
- JSON parsing of all active machine-readable continuity files.
- Markdown relative-link validation through the project audit.
- Runtime-file registry presence checks.
- Full SHA-256 checksum regeneration after continuity reconciliation.
- Final ZIP reopen, extraction, checksum verification, and repeated project audit.

## Documentation reconciliation checks
- README and deployment identity match the current runtime build.
- Architecture and Feature Status describe v0.22.2 rather than obsolete snapshots.
- Backlog contains deferred activity identity/migration work and deployed verification.
- Decision and error logs contain the binding lessons from the independent reviews and incomplete first documentation pass.
- Artifact registry identifies the current iteration, release notes, test report, and continuity reconciliation record correctly.

## Not verified in this environment
- Live Google Drive, Calendar, and AI providers.
- Service-worker/cache upgrade on the deployed origin.
- Continuous arbitrary-width visual behavior.
- Physical-device mobile, touch, keyboard, and screen-reader behavior.
- Reproduction of the reported repeated-advice condition.
