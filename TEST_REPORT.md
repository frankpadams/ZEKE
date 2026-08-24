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
