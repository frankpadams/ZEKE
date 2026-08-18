ZEKE mobile mockup-fidelity patch
Baseline: current GitHub main v0.43.1 / build 2026.08.17.1

Contents:
- index.html: current production index plus two new mobile fidelity assets.
- assets/mobile-mockup-fidelity-v044.css: mobile-only visual fidelity layer.
- assets/mobile-mockup-fidelity-v044.js: broken form-guide image fail-safe.

Purpose:
- Move production mobile styling toward the approved six-screen mockup standard.
- Preserve desktop styling and existing functional code.
- Make exercise entry feel like a native, organized mobile workflow.
- Make fitness analytics calmer and less nested.
- Prevent a broken exercise image from rendering as an empty/broken box.

Important limitation:
The connected GitHub integration allowed read access but returned HTTP 403 on write/create operations, so this patch could not be committed automatically. It is prepared to overlay onto the current repository/deployment.

This patch intentionally does not claim to fix the underlying Bicep Curl data-series reconciliation or medication-language parsing. Those require source-logic changes and regression tests, not CSS.
