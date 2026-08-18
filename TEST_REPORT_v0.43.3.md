# ZEKE v0.43.3 Mobile Mockup Fidelity — Verification

Static verification performed in this build environment:

- JS syntax: `node --check assets/mobile-first-rebuild-v0433.js` — PASS.
- Version identity: v0.43.3 / build 2026.08.17.3 — consistent across index, version.js, VERSION.txt, service worker.
- Splash screen contains visible version/build text — PASS.
- Service worker cache bumped and includes v0.43.3 mobile CSS/JS — PASS.
- More drawer is not hidden by CSS; sidebar uses off-canvas transform and `body.nav-open` — PASS.
- More reliability handler exists — PASS.
- Generic mobile Fitness insight card suppression exists — PASS.
- Mobile action bars account for bottom nav plus `env(safe-area-inset-bottom)` — PASS.
- Desktop rules are outside the max-width:760px mobile block except the max-width:390px refinement — PASS.

Physical-device acceptance still required:
1. More opens/closes drawer and all drawer navigation items work.
2. Home top viewport visually matches the approved Home mockup.
3. Fitness top viewport visually matches the approved canonical exercise library mockup.
4. Bicep Curl/other canonical tile charts show separate variation series.
5. Exercise detail becomes a focused phone view and remains escapable.
6. PT/exercise logger Save remains fully above the bottom navigation.
7. Form guide expands/collapses and remote/fallback visual still works.
8. No horizontal overflow at 390px and 430px iPhone widths.
