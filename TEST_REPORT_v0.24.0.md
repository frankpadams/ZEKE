# ZEKE v0.24.0 Test Report

**Build:** 2026.07.21.1  
**Release:** Trust, Conversation & Workflow  
**Test date:** 2026-07-21

## Verified locally

### Active-runtime syntax

`node --check` passed for:

- `assets/app.js`;
- `assets/workflow-engine.js`;
- `assets/data-layer.js`;
- `assets/parser.js`;
- `assets/ai-router.js`;
- `version.js`;
- `sw.js`.

### Deterministic JavaScript regressions

The non-fixture JavaScript suite passed:

- activity foundation;
- conversation security and editing;
- dashboard layout acceptance;
- clarification-factor idempotency and later update/resolution;
- medication action status;
- medication parser;
- navigation, coaching, and profile hierarchy;
- release structure and cache identity;
- sleep and insight stabilization;
- sleep transaction save/repeat/undo;
- Trust, workflow, and Conversation Memory structure;
- workbook commit/verify and repeated-sync idempotency;
- workbook source replacement backup;
- workflow-engine state, logs, privacy filtering, metrics, and clearing.

### Rendered Chromium workflow smoke

An isolated Chromium render passed with no page errors on:

- Dashboard;
- Fitness;
- Health;
- Conversation Memory;
- Insights;
- mobile-width Dashboard.

The rendered run directly exercised:

- workout create fields for effort, pain, technique, and injury context;
- sleep create and edit fields;
- narrative review source, proposed data, and all decision actions;
- Later preserving the review in Waiting for You;
- editing a non-medication recurring action through the focused schedule editor;
- restoration of an open workflow and its visible Resume path with contextual choices;
- an automated visible-control contract audit on Dashboard, Fitness, Health, Conversation Memory, Insights, and the mobile-width Dashboard. The audit found no visible enabled control without a bound action and no icon-only control without an accessible name.

### Support & Improvement Report download

An isolated Chromium download test created and reopened the workbook. It verified these tabs:

1. Executive Summary
2. Technical Errors
3. Unresolved Interactions
4. AI Consultation History
5. User Corrections
6. UX Feedback
7. Potential Health Events
8. Audit History
9. Conversation Metrics
10. Workflow History
11. Developer Notes

The test selected Anonymized mode, applied a date range, enabled clear-after-export, and verified those choices survived intervening UI renders. It reopened the workbook, confirmed the selected privacy mode, verified retained runtime and unresolved-interaction logs were cleared only after a successful download, and scanned workbook XML for credential-like test values; none were found.

### Governance and package controls

- project audit passed;
- all governance negative controls passed;
- all JSON documents parsed successfully;
- active runtime files matched the artifact registry;
- final staged file count matched the development gate;
- release checksums were regenerated;
- the final ZIP was reopened and compared with the staged directory.

## Not run: external fixture tests

These tests require `ZEKE_TEST_DATA_ROOT` and were not run because the protected external fixture was not supplied:

- `tests/workbook-preflight.test.js`;
- `tests/workbook-real-data-idempotency.test.js`.

This is an explicit external-fixture boundary, not a passing result.

## Environment verification outstanding

Local package testing does not establish:

- live Google Drive persistence or cross-device restoration;
- live Google Calendar access and follow-up writes;
- Gemini, Groq, or other real provider routing/failover;
- deployed service-worker replacement and hard-refresh behavior;
- report download behavior across every supported browser/device;
- protected real-workbook behavior without the external fixture;
- physical-device accessibility, screen-reader, and touch acceptance.

These remain environment verification tasks after deployment.
