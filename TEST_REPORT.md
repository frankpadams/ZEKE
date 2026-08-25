# ZEKE v0.48.0 Development Test Report

**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2

**Current evidence:** package-local source/syntax/regression testing completed as recorded below. Live Google persistence is not package-local evidence and remains outstanding.

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
