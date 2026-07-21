# ZEKE v0.25.2

**Build:** 2026.07.21.4  
**Release:** Trust, Conversation & Workflow

This full replacement package makes ZEKE’s conversations and review workflows explicit, durable, correctable, and diagnosable.

## Main changes

- Added the durable ZEKE Workflow Engine with visible completion states.
- Reworked Talk to ZEKE so retries, clarification, confirmation, duplicates, correction, deferral, and dismissal have defined outcomes.
- Replaced Questions/Past Decisions with **Conversation Memory**: **Waiting for You** and **Things I’ve Learned**.
- Rebuilt review items around original information, ZEKE’s understanding, proposed action, why it matters, and what ZEKE will do.
- Added a context-specific medication schedule editor.
- Routed supported Talk to ZEKE attachments through the existing safe import workflow.
- Added **Settings → Diagnostics & Exports → Download Support & Improvement Report**.
- Corrected Pattern Lab direction wording and tightened Fitness layout density.
- Documented the directly editable static runtime and identified legacy build artifacts.

See `RELEASE_NOTES_v0.25.2.md`, `TEST_REPORT_v0.25.2.md`, and `ARCHITECTURE.md`.

## Deploy
Replace the deployed ZEKE files with the contents of this folder while preserving the intended values in `zeke-config.js`. Hard-refresh once and verify that the application reports **v0.25.2 · build 2026.07.21.4**.

## Continue development
Begin with `00_AI_START_HERE.md`. The active application is the readable static runtime listed in `ARCHITECTURE.md`; do not edit historical hashed bundles as though they were source.
