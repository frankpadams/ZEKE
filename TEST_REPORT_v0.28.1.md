# ZEKE v0.28.1 Test Report

Build: 2026.07.23.0418

## Package checks completed

- `node --check` passed for `assets/app.js`, `assets/exercise-guides.js`, `version.js`, and `sw.js`.
- The guide-library contract passed for all 17 reviewed guides, including required Setup, Movement, Common Mistakes, Tips, photo source, creator, and license fields.
- The full JavaScript regression suite passed: 19 test files, 19 passed, 0 failed.
- The two real-workbook tests reported a truthful environment skip because `ZEKE_TEST_DATA_ROOT` was not supplied; they did not claim real-data verification.
- `python tools/project_audit.py --root .` passed with 0 errors and 0 warnings.
- All governance negative controls passed.
- Script ordering confirms `assets/exercise-guides.js` loads before `assets/app.js`.
- The final package was compared directly with the v0.28.0 ZIP for byte identity and archived modification timestamps.
- The final ZIP was reopened and passed integrity testing.

## Rendered/environment boundary

The legacy rendered-workflow smoke script exceeded the available execution window and did not produce a result. This release therefore does not claim rendered-browser, live-network image, deployed service-worker, connected Drive/Sheets, protected-workbook, physical-device, or accessibility-device verification. Those remain environment checks.

## Media boundary

Photos are loaded from Wikimedia Commons at runtime. The package verifies that every reviewed photo has explicit source, creator, and license metadata and that image-load failure produces a visible fallback. It does not claim that the remote image files are embedded in the ZIP or available offline.
