# Runtime Diagnostics

**Status:** Supporting current design  
**Current baseline:** v0.22.2 · build 2026.07.19.4

ZEKE may record shortened operational errors on the current device. Diagnostics are support evidence, not canonical health data and not proof that a feature works.

## Permitted fields
- timestamp;
- version/build;
- route and viewport class;
- error/event type;
- shortened technical detail;
- optional source action or navigation origin;
- cache/service-worker version state where available.

## Prohibited content
The logger must not intentionally store API keys, access tokens, full canonical health records, complete imported files, or unnecessary personally identifying content.

## Relevant v0.22.2 diagnostics
For responsive, navigation-context, and duplicate-advice investigation, capture:
- viewport width/height;
- route and originating control;
- focused activity/context identifier, if present;
- whether navigation was scoped or generic;
- current service-worker/cache build;
- render timestamp sequence without storing health payloads.

For workout corrections, canonical audit history belongs with the correction record, not in the runtime error log. Runtime diagnostics may note success/failure and record ID only when safe.

Users must be able to export or clear local diagnostics from Settings. Runtime diagnostics remain distinct from the Development Error Log, release-test evidence, correction history, and connected-data transaction journals.
