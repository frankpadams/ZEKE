# ZEKE v0.43.1 — Mobile Professional Polish

**Build:** 2026.08.17.1  
**Runtime basis:** v0.43.0 RC2.1 Continuity-Reconciled  
**Status:** Mobile implementation and package-local rendered verification complete; broader release gates remain explicit.

## Mobile interface correction

This release is a focused mobile-quality pass. It preserves the existing v0.43 functionality while bringing phone workflows back to the approved design language in `DESIGN_AUTHORITY.md` and the July mobile mockup.

### Workout / Fitness

- Exact variation/equipment is now a primary exercise-setup decision, placed before Coach's Eye. ZEKE no longer tells the user to choose a variation while hiding that choice under “optional details.”
- Coach history and recommendations use the selected exact variation whenever the distinction affects load interpretation.
- Strength set rows preserve separate load, reps, optional effort/RPE, and optional pain values per set.
- A one-session progression state is compact and truthful rather than reserving a large empty graph.
- Canonical exercise analytics now draw each exact variation as a separate line series on one shared chronological/load chart. Different variations are never connected to one another.
- Missing/unrecorded load is omitted from load charts and summaries; it is never coerced to 0 lb.
- Fitness period controls live inside the Fitness library context they govern.

### Mobile visual system

- Restored the approved dark-navy header, teal actions, crisp hierarchy, compact white cards, restrained semantic accents, and phone-first spacing.
- Removed the oversized center-navigation blue blob.
- Removed the duplicate floating ZEKE orb on phone widths while keeping ZEKE available through bottom navigation and the drawer.
- Tightened the mobile drawer and kept navigation vertically stacked.
- Corrected the workout header/date composition so fixed/sticky elements do not cover the exercise form.
- Dashboard/Health and Fitness now use a more coherent shared ZEKE visual language rather than unrelated card styles.

## Functionality preserved

The v0.43 longitudinal-data work remains present: medication occurrences and correction history, retrospective calendar reconciliation, Health Reports & Export, Body Composition/DEXA provenance, Recent Health Record edit/remove, connected-workspace AI credential persistence, conversation interruption/meta separation, unified Talk to ZEKE, and provider-backed canonical data rules.

## Verification boundary

Automated/package-local verification includes JavaScript syntax/regressions, rendered workflow tests, 320–430 px route overflow checks, drawer/nav geometry, variation-first batch entry, per-set effort/pain controls, compact single-session progression, and multi-series canonical charts. Physical-phone acceptance, live Drive/Calendar behavior, and six outstanding PT visual guides remain outside what this local package can truthfully establish.

Historical release details are retained in `CHANGELOG.md`, `TEST_REPORT.md`, `DEVELOPMENT_MEMORY/ITERATION_HISTORY.md`, and `PACKAGE_HISTORY.json` rather than proliferating per-version files.
