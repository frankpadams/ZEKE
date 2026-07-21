# ZEKE v0.24.0 — Trust, Conversation & Workflow

**Build:** 2026.07.21.1

## Added

- Durable workflow transactions with explicit goals, missing decisions, proposed changes, save/duplicate/AI state, actions, history, and outcome.
- User-visible workflow status in Talk to ZEKE.
- Conversation Memory: Waiting for You and Things I’ve Learned.
- Context-specific medication schedule editor.
- Settings-based Support & Improvement Report workbook with privacy controls.
- Unresolved-interaction, workflow, AI, correction, feedback, technical, and audit diagnostics.
- Safe Talk attachment routing for supported structured files.

## Changed

- Review items now show original information, ZEKE’s understanding, proposed record/action, why it matters, and what ZEKE will do.
- Buttons describe the action they complete rather than generic confirmation where practical.
- Deferral, dismissal, duplicate, undo, and failure responses state whether data changed. “Later” preserves questions in Waiting for You and moves them behind newer questions.
- Pattern language says values moved in the same or opposite direction instead of implying an increase.
- Fitness time-period controls and insight layout use less space.
- Current static architecture and legacy bundles are explicitly documented.
- Existing clarification questions can now be updated or resolved without the idempotency guard mistaking the update for a duplicate.
- Open workflows restore common pending state after refresh and provide a visible Resume action.
- Diagnostic export controls now retain privacy, date-range, and clear-after choices across background renders.
- Previously inert metric overflow buttons now open the relevant metric detail; duplicate review-pill IDs were replaced with consistently bound review actions; icon-only workout controls now have accessible names.

## Safety and privacy

- Full workflow content is stored in the user-owned ZEKE repository.
- Local workflow persistence is minimized to operational metadata.
- Support exports remove credentials and offer Full developer, Technical only, and Anonymized modes.
- Calendar events remain context, not proof of attendance; scheduled medication remains expectation, not proof of a dose.

## Known environment boundaries

Live Drive, Calendar, external AI, service-worker deployment, protected workbook, download behavior on every browser, and physical-device accessibility are not established by local package tests.
