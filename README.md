# ZEKE v0.43.1 — Mobile Professional Polish

**Build:** 2026.08.17.1  
**Status:** package-local mobile implementation verified; final promotion still respects existing PT-media, physical-device, and live-provider gates.

ZEKE is a private, user-owned personal-management application. This package is intentionally **self-describing**: a new developer or AI team should be able to resume development from this package alone, without prior chat history.

## Start here

1. `00_AI_START_HERE.md`
2. `CURRENT_RELEASE_SCOPE.md`
3. `DESIGN_AUTHORITY.md`
4. `ARCHITECTURE.md`
5. `PROJECT_STATE.md`, `FEATURE_STATUS.md`, `KNOWN_ISSUES.md`
6. `DEVELOPMENT_MEMORY/RELEASE_GATE.md` and `TEST_REPORT.md`

## v0.43.1 focus — mobile professionalism without functional loss

- restored the approved dark-navy / teal / white mobile design language instead of the flatter generic-card drift;
- removed the oversized center-navigation “blue blob” and duplicate floating ZEKE action while preserving ZEKE access in bottom navigation and the drawer;
- corrected phone header, drawer, card, spacing, sticky-action, and responsive behavior across core routes;
- moved exact exercise variation/equipment selection **before** variation-dependent Coach guidance in workout entry;
- preserved per-set load/reps and optional per-set effort/RPE and pain in direct and batch workout workflows;
- corrected canonical strength charts to render **one independent line per exact variation** on shared axes; observations from unlike equipment are never connected;
- missing/unrecorded load remains unknown and is omitted rather than becoming a false 0 lb point;
- replaced oversized empty progression charts with compact insufficient-data states;
- kept all v0.43 longitudinal medication, calendar, body-composition, report/export, credential, correction-history, and provenance functionality intact.

## Release boundary

Package-local phone-width rendered checks pass at 320, 375, 390, and 430 px, including core-route overflow checks and the variation-first workout flow. Do not claim final production promotion until the six remaining PT/rehab visual guides are verified and the outstanding physical-device/live-provider checks in `DEVELOPMENT_MEMORY/RELEASE_GATE.md` are completed.
