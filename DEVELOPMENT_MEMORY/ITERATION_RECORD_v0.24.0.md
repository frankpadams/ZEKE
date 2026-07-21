# Iteration Record — ZEKE v0.24.0

**Build:** 2026.07.21.1  
**Release:** Trust, Conversation & Workflow

## User-approved scope

- Implement a durable ZEKE workflow engine that coordinates Talk to ZEKE, review, AI, editors, audit, and unresolved interactions
- Give every meaningful conversation an explicit saved, not saved, duplicate, dismissed, waiting, completed, or failed outcome
- Replace Questions for You and Past Decisions with Conversation Memory: Waiting for You and Things I’ve Learned
- Rebuild each review item around original information, ZEKE’s understanding, proposed action, why it matters, what ZEKE will do, and explicit choices
- Add a context-specific medication schedule editor and improve natural weekly or daily schedule handling
- Route supported Talk to ZEKE attachments through the existing safeguarded import workflow
- Add the multi-tab Support & Improvement Report under Settings → Diagnostics & Exports with privacy controls
- Separate and connect technical, unresolved-interaction, AI, correction, UX-feedback, audit, and workflow diagnostics
- Correct Pattern Lab wording so direction does not imply that improving values increased
- Reduce wasted space in Fitness chart-period, Coach’s Eye, insight, and history composition
- Document the authoritative static runtime, no-build-step architecture, and legacy artifact boundary
- Add regression tests and synchronize the full continuity and handoff package

## Implementation summary

- Added `assets/workflow-engine.js` with durable transaction state, terminal outcomes, metrics, privacy-filtered export, and minimized local persistence.
- Mirrored full workflow state and unresolved-interaction diagnostics into the user-owned ZEKE repository.
- Added visible Talk to ZEKE workflow status, common pending-state restoration, a Resume action, and instrumentation for save, correction, duplicate, defer, ignore, question, AI, and failure paths.
- Added Conversation Memory tabs, editable/removable learned context, a narrative review workspace, and Later behavior that preserves questions while moving them behind newer work.
- Added a medication schedule editor with frequency, weekday, dose, unit, start date, and notes.
- Routed XLSX, XLS, JSON, CSV, and TSV attachments through the standard import workflow.
- Added the Support & Improvement Report workbook and retained-log controls under Settings.
- Added direction-neutral pattern language and denser Fitness layout rules.
- Corrected factor idempotency so an existing clarification question can be resolved or updated without being mistaken for a duplicate.
- Reconciled architecture, release, handoff, governance, backlog, and historical-artifact documentation.
- Added a rendered interaction-contract audit across major desktop routes, key open editors, and the mobile Dashboard; repaired inert metric controls, duplicate review control IDs, and unlabeled icon controls found by that audit.
- Made Support Report privacy, date-range, and clear-after selections durable across deferred background renders.

## Explicit exclusions

- New paid AI providers or changes to the free-first router policy.
- Destructive migration or deletion of user health history.
- Automatic diagnoses, clinical conclusions, or treatment decisions.
- Global activity rename/merge and legacy taxonomy migration.
- Removal of historical hashed bundles without a separate cleanup review.

## Acceptance criteria

- Active interactions have a durable workflow ID, a visible result state, and an actionable resume path for common restored pending states.
- A workflow can be mirrored to the user repository without leaving personal source text in browser-local persistence.
- Conversation Memory exposes unresolved and learned context with edit/remove paths.
- Review items show source, understanding, proposal, purpose, downstream action, and choices.
- Medication schedule wording such as weekly on Fridays is safely converted or opens a focused editor.
- Supported Talk attachments enter the same import safeguards as Settings.
- Settings exports all named Support & Improvement Report tabs and excludes credentials.
- Pattern wording accurately describes same-direction or opposite-direction movement.
- All syntax, structural, governance, regression, packaging, and reopened-ZIP checks pass or are precisely reported.

## Rollback

Restore ZEKE v0.23.1 · build 2026.07.20.1. The new workflow records are additive factors and do not require destructive migration.
