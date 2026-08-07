# Release Gate — ZEKE v0.41.0 RC1

**Runtime build:** 2026.08.07.1  
**Governance revision:** 2026.08.07.1

## Status

**Package verification complete for the v0.41.0 RC1 scope.**  
**Environment verification outstanding.**

This package is a release candidate built directly from the exact v0.40.5 package the user deployed successfully. It is not yet represented as user-deployed or production-accepted.

## Scope verified in-package

- Exact exercise family / variation / equipment / load-basis identity, with ambiguous historical equipment left unknown until review.
- Non-destructive historical exercise-identity review that appends correction metadata rather than overwriting original exercise wording.
- Expanded PT/rehab library, readable abbreviation expansion, separate ER/IR records, flexible rehab fields, and verified public-domain images where a movement-level match was available.
- Progressive-overload guidance embedded in workout logging, with RPE/RIR, pain/PT, gap, uncertainty, exact-variation, and evidence handling.
- Discover primary feed centered on screened findings rather than system buckets; Pattern Lab is a secondary “Explore all patterns” drill-down.
- Recent-oriented Trends & Analysis and section-owned Dashboard timeframe controls.
- Compact Today behavior, plain-language duplicate review, and medication-specific adherence modes including opt-in schedule-assumed doses with explicit provenance.

## Verification evidence

- Active JavaScript syntax checks: passed.
- v0.41 structural/regression test: passed (15 checks).
- Form-guide library regression: passed.
- Release-structure identity/runtime-order regression: passed.
- Rendered Chromium workflow smoke: passed on desktop and mobile routes with no page errors, missing control names, unbound visible controls, or tested mobile activity-library overflow.
- Support-report browser smoke: passed.
- Governance negative controls: passed.
- Broader JavaScript suite: 16 passed; 6 returned non-zero and are classified in `TEST_REPORT_v0.41.0.md` rather than represented as passing.

## Classified non-zero tests

Three require the external protected `ZEKE_TEST_DATA_ROOT` fixture and therefore cannot run in this package-only environment. Three are historical/legacy expectation tests whose assertions intentionally conflict with v0.41 identity or the approved v0.41 UX/schema changes. Current v0.41 replacement coverage passed.

## Environment verification outstanding

- Deploy the complete package as one consistent set and confirm startup identity/cache activation.
- Confirm live Google Drive authentication and provider-backed write/readback.
- Confirm the revised workout logger, duplicate review, medication adherence settings, and Discover/Trends behavior with real user data.
- Complete physical mobile acceptance on representative devices.
- Confirm remote form-guide media availability in the deployed environment; truthful written fallback remains required.

## Rollback

Restore the complete user-deployed v0.40.5 package. v0.41 historical exercise-identity repair uses correction-based metadata and is designed to remain reviewable/reversible.
