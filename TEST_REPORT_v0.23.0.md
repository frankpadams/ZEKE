# Test Report — ZEKE v0.23.0

**Build:** 2026.07.19.5

## Automated checks

- JavaScript syntax checks: passed for app.js, ai-router.js, and data-layer.js.
- Release-structure test: passed after version/cache reconciliation.
- Conversation/security/editing structural acceptance test: passed.
- Existing activity, dashboard, medication, factor, navigation, workbook commit/verify, and source-backup tests: passed.
- Real-workbook tests require ZEKE_TEST_DATA_ROOT and were not executed without that external fixture.

## Manual acceptance scenarios required after deployment

1. Click Review/Edit on Weight or Body Fat and verify the selected record opens in a modal without navigating to Dashboard.
2. Start a record correction, then enter a sleep observation; verify the stale correction is paused and sleep is interpreted independently.
3. Ask ZEKE a question that expects a yes/no answer, reply “sure,” and verify it continues the conversation without offering to save the reply.
4. Verify transcript date separators and times.
5. Test wide desktop, tablet, and mobile layouts for large unexplained gaps.
6. Connect an AI provider and verify malformed or action-seeking structured output is rejected.
