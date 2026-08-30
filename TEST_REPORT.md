# ZEKE v0.48.0.2 Test Report

**Current authority review:** 2026-08-30 · runtime v0.48.0.2 · build 2026.08.30.1 · governance 2026.08.30.1

**Evidence state:** package verification complete after clean extraction and rerun of critical gates. Live Google/provider/device checks remain environment verification and are not implied here.

## Current package-local verification

**Passed:**
- Complete package-local JavaScript regression matrix.
- Three owner-fixture tests correctly reported **SKIP**, not pass: `integrity-live-repair-transaction.test.js`, `workbook-preflight.test.js`, and `workbook-real-data-idempotency.test.js`.
- `v04801-rendered-acceptance.py` at 390 px and 1280 px: Timeline Day/Week/Month/Year controls, sleep period-comparison language, no browser errors, no horizontal overflow.
- `v048-release-gate-rendered.py` at mobile size: Talk compact → expanded → closed; clickable ongoing injury → period editor; workout proposal → editable active workout → save first exercise → adapt only remaining unsaved work; no browser errors or horizontal overflow.
- `mobile-professional-polish.test.py` at 320/375/390/430/768 px: checked routes report no horizontal overflow/browser errors; bottom navigation and Fitness workflow assertions pass.
- PT visual release gate: 14 rehab entries checked; 6 movement-specific local guide pairs verified.
- Project audit: **0 errors / 0 warnings across 155 files** before packaging.
- Release/version structure contract: v0.48.0.2 / build 2026.08.30.1 with a version-derived cache token rather than a hard-coded prior-release suffix.

## Clean-extraction package verification

- Candidate ZIP clean-extracted successfully.
- All 154 files listed in `BUILD_MANIFEST.json` matched recorded size and SHA-256.
- Extracted project audit remained **0 errors / 0 warnings**.
- Extracted release-structure, longitudinal-product-coherence, PT visual, Timeline/sleep rendered, release-gate rendered, and mobile rendered gates passed.

## Evidence boundary

Live Google Drive/Calendar authorization restoration, provider-backed persistence after real browser/app restart, live AI-provider behavior, physical-device acceptance, and real external PDF/OCR edge cases require the owner's deployed/authorized environment. They remain **environment verification outstanding**, not package-local failures and not package-local passes.

## Historical verification record

# ZEKE Current Test Report — v0.47.0

**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6

**Build:** 2026.08.24.1  
**Package-local status:** verification in progress; do not treat as packaged release until Release Gate says package verification complete.  
**Environment status:** live Google/AI-provider checks outstanding.

## Recovery verification already completed
- Deep continuity review identified v0.45.1 as the stable rollback source and reconciled v0.46.0 build 2026.08.24.2 as the functional donor.
- Actual Chromium Dashboard renders reviewed at 1024, 1280, 1440, and 1600 desktop widths.
- Actual major-route renders reviewed at desktop and phone widths.
- Sparse, normal, dense, and deliberately long-text Dashboard fixtures pass bounded-layout checks.
- Oversized controlled SVG regression gate confirms v0.47 UI icons remain within 24px visual boxes.
- Desktop top/middle rows align with uniform 16px gutters at >=1200px; primary Dashboard briefing remains within the first desktop viewport.
- Purpose-built mobile Dashboard continuity is retained instead of forcing desktop geometry onto mobile.
- New `v047-preserved-functionality.test.js` verifies v0.45.1/v0.46 carry-forward contracts.

## Tests to complete before packaging
- complete package-local JavaScript regression matrix;
- legacy/current rendered workflow and mobile checks;
- PT visual gate;
- support-report browser smoke;
- project audit + governance negative controls;
- manifest/hash generation;
- clean ZIP re-extraction and repeat audit/integrity checks.

## Evidence boundary
Package-local visual/functional checks do not prove live Google Drive/Calendar or external AI-provider availability. Those remain environment verification items.

## v0.48.0 development verification — 2026-08-25

- JavaScript syntax: **pass** for active runtime JavaScript files.
- Package-local JavaScript regression files: **32 returned success**; three of those explicitly reported SKIP because external owner-data fixtures were not supplied (`integrity-live-repair-transaction`, `workbook-preflight`, `workbook-real-data-idempotency`).
- `tests/v048-interaction-integrity.test.js`: **pass (9 checks)**.
- `tests/factor-idempotency.test.js`: **pass**.
- v0.47 preserved-functionality carry-forward: **pass** after making its runtime-identity assertion current-version aware.
- Governance negative controls: **all pass**.
- `tools/project_audit.py`: **0 errors / 0 warnings** before packaging.
- Existing full Chromium route/visual gate was attempted in this environment but exceeded the 45-second execution window; **no new rendered-test claim is made for this development package**. The v0.47 presentation layer itself was not redesigned in this delta.
- Live Google-provider duplicate-resolution round trip: **outstanding**. The repair is therefore **coded + source-tested**, not persistence-tested/environment-tested.


## v0.48.0.2 development verification — 2026-08-29

**Current authority review:** 2026-08-29 · runtime v0.48.0.2 build 2026.08.30.1 · governance 2026.08.30.1

- Baseline JavaScript regression suite: passed before v0.48.0.2 changes; rerun required after implementation.
- Mobile structural/browser checks at 320/375/390/430px: baseline passed before changes; rerun required.
- Rendered workflow smoke: began successfully but exceeded tool execution window; **not counted as passed**.
- Live Google Drive/Calendar persistence: environment verification outstanding.
- Package audit: in progress.


## v0.48.0.2 package-local verification result — 2026-08-29

**Current authority review:** 2026-08-29 · runtime v0.48.0.2 build 2026.08.30.1 · governance 2026.08.30.1

**Passed:**
- All package-local JavaScript regression tests (`tests/*.test.js` and JS release gates). Fixture-dependent tests correctly report SKIP when external fixtures are not supplied.
- Governance negative controls.
- Mobile rendered/professional-polish checks at 320, 375, 390, 430, and 768 px: no reported route overflow/browser errors in the checked matrix.
- v0.48.0.2 targeted rendered acceptance at 390 px and 1280 px: Timeline Day/Week/Month/Year controls render and switch; no browser errors/horizontal overflow; sleep period-comparison language renders from longitudinal test data.
- PT visual release gate: movement-specific local guide pairs verified for the gated rehab entries.
- Project audit: **0 errors / 0 warnings** before packaging.

**Not promoted beyond demonstrated evidence:**
- Live Google Drive/Calendar persistence and authorization restoration require the owner's deployed authorized environment and remain **environment verification outstanding**.
- The long-form legacy adversarial/rendered suite can exceed the current execution window; targeted current rendered gates and the mobile matrix passed, but a timeout is not recorded as a pass.
- External real-data fixtures were not present for the package-local fixture-dependent workbook/repair tests; those tests reported SKIP rather than false success.

This package is a **development candidate**, not a user-verified promoted release.


### Final ZIP integrity result

The candidate ZIP was re-extracted into a clean directory. BUILD_MANIFEST verification passed for every listed file, project audit remained 0 errors / 0 warnings, and current release-specific source/rendered acceptance tests passed from the extracted copy. Live-provider environment verification remains outstanding.
