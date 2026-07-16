# ZEKE v0.17.1-alpha

Build 2026.07.16.5

## Purpose

Correct the unverifiable v0.17.0-alpha package and make release identity visible before and after application initialization.

## Fixes

- Corrected the `version.js` contract: `window.ZEKE_BUILD` is now the object expected by `app.js`.
- Added an immediate static splash version before JavaScript loads.
- Added visible version/build identification in splash, top bar, sidebar, connection screens, error screen, and About panel.
- Added and updated `README.md` as a release-gate artifact.
- Advanced every local asset cache key to build `2026.07.16.5`.

## Verification gate

Do not test this release unless the page visibly shows `v0.17.1-alpha` and build `2026.07.16.5`.
