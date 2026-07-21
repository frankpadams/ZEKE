# ZEKE Feature Status — v0.24.0

**Build:** 2026.07.21.1

## Implemented and locally testable

- Unified Talk to ZEKE with durable workflow state, restored common pending interactions, a Resume action, and explicit closure language.
- Automatic local interpretation → AI consultation → clarification → focused editor fallback.
- Duplicate-safe confirmation, view, undo, correction, defer, ignore, and no-save outcomes.
- Conversation Memory with Waiting for You and Things I’ve Learned; Later preserves the question and reorders it behind newer work.
- Review workspace showing source, understanding, proposal, purpose, downstream action, and decision controls.
- Medication schedule editor with frequency, weekday, dose, start date, and notes.
- Supported file attachment routing for XLSX, XLS, JSON, CSV, and TSV.
- Support & Improvement Report workbook under Settings with three privacy levels and eleven tabs.
- Separate technical, unresolved-interaction, AI, correction, feedback, audit, and workflow logs.
- Direction-neutral Pattern Lab wording and denser Fitness control/insight layout.
- Current static runtime and legacy-artifact boundaries documented.

## Requires deployed or environment verification

- Live Google Drive persistence and workflow restoration across devices.
- Live Google Calendar follow-up behavior.
- Real Gemini/Groq/other provider calls and provider failover.
- Browser download behavior for the multi-tab report across all supported devices and deployed origins. An isolated Chromium download was verified locally.
- Service-worker cache replacement on the deployed origin.
- Protected real-workbook fixtures, physical-device mobile layout, and accessibility testing.

## Partial or deferred

- Full correction-history browser and global undo.
- Activity identity rename/merge and reviewed legacy migration.
- Automatic clinical promotion of Potential Health Events.
- Removal of unreferenced historical bundles in a dedicated cleanup release.
