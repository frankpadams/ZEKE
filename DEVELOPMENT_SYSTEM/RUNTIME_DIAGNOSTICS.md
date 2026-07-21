# Runtime Diagnostics

**Status:** Supporting current design  
**Current baseline:** v0.24.0 · build 2026.07.21.1

Runtime diagnostics support product repair. They are not canonical health data, not proof that a feature works, and not a substitute for a reproducible test.

## Diagnostic layers

ZEKE keeps four distinct kinds of evidence:

1. **Runtime / technical errors** — shortened browser failures, route, version/build, and safe technical detail.
2. **Unresolved interactions** — the user goal, ZEKE's understanding, intended destination, AI use, clarification attempts, actions shown, save state, retries, and resolution.
3. **Audit and decision history** — workflow transitions, imports, saves, corrections, dismissals, duplicates, and explicit closure.
4. **AI consultation history** — provider/model when available, purpose, success/failure, confidence or selected action, and safe error detail.

User corrections and UX feedback are retained as separate report streams so developers can distinguish product misunderstanding from runtime failure.

## Storage boundary

- Full workflow content and repository-backed unresolved-interaction records belong in the user's selected ZEKE storage provider.
- Browser `localStorage` may retain only minimized workflow metadata and shortened operational diagnostics.
- Local workflow metadata must not intentionally retain original health messages, complete proposals, API responses, credentials, or full canonical records.
- Runtime logs are capped and user-clearable.

## Support & Improvement Report

Settings → Diagnostics & Exports creates one privacy-filtered workbook with:

- Executive Summary;
- Technical Errors;
- Unresolved Interactions;
- AI Consultation History;
- User Corrections;
- UX Feedback;
- Potential Health Events;
- Audit History;
- Conversation Metrics;
- Workflow History;
- Developer Notes.

Privacy modes are Full developer, Technical only, and Anonymized. Credential-like fields—including API keys, access tokens, secrets, passwords, and authorization values—are excluded in every mode.

The user may choose a date range and may clear retained diagnostic logs after a successful export. Clearing diagnostics must not delete canonical health records, confirmed schedules, conversation memory, or repository settings.

## Permitted runtime fields

- timestamp;
- version/build;
- route and safe UI context;
- error/event type;
- shortened technical detail;
- workflow ID or record ID when safe;
- source action or navigation origin;
- service-worker/cache identity where available.

## Prohibited runtime content

The local runtime logger must not intentionally store:

- API keys, access tokens, passwords, or credentials;
- complete imported files;
- full canonical health records;
- unnecessary personally identifying content;
- unredacted external-AI prompts or responses.

## Verification boundary

A diagnostic entry demonstrates that ZEKE recorded an event. It does not demonstrate root cause, successful persistence, correct UI behavior, or a fixed defect. Compare diagnostics with deterministic tests, rendered runs, deployed-origin evidence, and the original workflow before making a conclusion.
