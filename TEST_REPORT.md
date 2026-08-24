# ZEKE Current Test Report — v0.46.0

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.4 · governance 2026.08.24.5

**Build:** 2026.08.24.3  
**Package-local status:** release-gate checks passed before final ZIP generation.  
**Environment status:** outstanding where noted below.

## Continuity reconciliation verification — governance 2026.08.24.3

The post-package continuity audit identified stale standing authority documents that the original project audit did not detect. Governance revision 2026.08.24.3 re-read/reconciled the entire registered authoritative set and strengthened `tools/project_audit.py` to require current review stamps across that set plus standing supporting-continuity documents.

Verification for this reconciliation includes:
- JSON parse validation for Project State, Development Gate, Governance Rules, Artifact Registry, Package History, and Release Checksums;
- project audit with full-authority review-stamp checks;
- governance negative controls;
- current version/build/governance consistency across standing authorities/supporting continuity;
- Markdown relative-link checks through the project audit;
- active JavaScript syntax/regression suites to confirm the documentation reconciliation did not damage runtime files;
- reopened ZIP integrity/path/permission/hash comparison before final delivery.

Runtime behavior remains build 2026.08.24.3; this continuity revision does not promote unrun environment behavior to Verified.


## Passed package-local checks

- `python tools/project_audit.py`: **0 errors, 0 warnings** after governance/current-document reconciliation.
- `python tests/governance-negative-controls.py`: **12/12 negative controls passed** (including stale full-authority review stamp and stale supporting-continuity governance state).
- Active JavaScript syntax: **all `.js` files parsed successfully with `node --check`**.
- Package-local JavaScript regression suite: **all executable tests returned success**, including v0.46.0 integrated release, Fitness/Log workflow, canonical exercise/variation behavior, sleep, medication, workflow, security/editing, form-guide, ingestion, workbook transaction, and historical protected-contract tests.
- PT visual release gate: **14 rehab entries passed; 6 newly local guide pairs verified movement-specific**. The six local pairs were also visually reviewed as named-movement schematics; they are explicitly clinician-directed rather than pretending to be individualized PT instruction.
- `python tests/mobile-professional-polish.test.py`: **passed** after updating the test harness to the complete current runtime. No horizontal overflow at 320/375/390/430/768 px on audited core routes; canonical multi-series variation behavior and variation-first workout entry remained intact.
- `python tests/v040-rendered-smoke.py`: **passed** with the current consolidated Insights contract and current top-level Log navigation expectation.
- `python tests/v043-mobile-rendered-smoke.py`: **passed**.
- `python tests/rendered-workflow-smoke.py`: **passed** after updating its harness to the complete current runtime chain.
- `python tests/support-report-browser-smoke.py`: **passed**; anonymized support workbook generated, expected tabs present, credentials excluded, retained diagnostic/workflow logs cleared when requested.

## Explicit skips / not counted as passes

The following JavaScript fixture tests reported **SKIP** because `ZEKE_TEST_DATA_ROOT` was not provided:
- live repair transaction against external Project Zeke fixture;
- workbook preflight against external Project Zeke fixture;
- real-data workbook idempotency against external Project Zeke fixture.

These are not counted as passes.

## Environment verification outstanding

- Owner hands-on physical-phone visual/workflow acceptance against `DESIGN_AUTHORITY.md`.
- Representative owner desktop hands-on acceptance.
- Live Google Drive/Calendar connection/readback behavior.
- Connected-AI provider clinical/workout generation with real credentials/provider responses.
- First real PDF/screenshot/DEXA extraction review in the deployed browser/network environment.

Package-local tests do not substitute for these environment checks.


## 2026-08-24 visual acceptance correction
Build 2026.08.24.4 replaces the failed build 2026.08.24.3 desktop attempt. The approved desktop mockup is binding visual authority for geometry, density, spacing, icon language, and information hierarchy. A UI build may not be described as visually accepted without rendered geometry checks and human screenshot comparison.
