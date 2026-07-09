# ZEKE v0.6.6 — Standalone Dashboard Shell Fix

## Purpose
This release fixes the v0.6.5 failure where importing the compiled legacy bundle remounted the old React UI into `#root` and prevented the mockup-aligned dashboard from becoming the actual visible application.

## Fix
- Added `assets/zeke-core-data-v066.js`, a side-effect-free copy of the recovered core bundle.
- Removed only the final legacy React mount from that core copy.
- Preserved the recovered storage/event/calendar/factor API exports for the new dashboard.
- `assets/zeke-app-v066.js` imports the side-effect-free core instead of the legacy UI bundle.
- `index.html` loads only the AI router and the new v0.6.6 dashboard app as visible application layers.
- The old compiled UI bundle remains in the package only as a historical dependency/reference and is not loaded by `index.html`.

## Acceptance checks performed
- JavaScript syntax check passed for the new app, side-effect-free core, and AI router.
- Verified the side-effect-free core contains no `createRoot(...#root...)` mount call.
- Verified all local assets referenced by `index.html` exist.
- Verified module-relative dependencies referenced by the new app/core exist.
- Verified the static server serves `index.html` and the referenced assets.

## Known limitation
Automated Chromium screenshot capture is blocked/hanging in the current build environment, so final browser visual acceptance must be performed on the deployed GitHub Pages build.
