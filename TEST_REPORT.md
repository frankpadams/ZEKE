# ZEKE v0.49.0.1 Hotfix Test Report

**Build:** 2026.09.14.2  
**Purpose:** dashboard render regression hotfix

## Hotfix verification
- `node --check assets/app.js`
- `node --check sw.js`
- `tests/v049-dashboard-render-hotfix.test.js`
- `tests/v049-coherence.test.js`
- Package-local Node suite rerun after patch; results recorded below.

## Root cause
`v47HealthHTML()` called undefined `dashboardRangeHTML('health')`; the implemented helper is `dashboardRangeControl('health')`. The undefined reference aborted Dashboard rendering.

---

# ZEKE v0.49.0 Current Test Report

**Build:** 2026.09.14.1  
**Status:** development package verification  
**Baseline:** v0.48.0.2 build 2026.08.30.1

## Passed in this environment
- `node --check assets/app.js`
- `node --check assets/ai-router.js`
- `tests/v049-coherence.test.js`
- 28 of 34 package-local Node test files returned success.
- The successful set includes activity foundation, conversation security/editing, dashboard layout acceptance, factor idempotency, form-guide library, medication action/parser checks, mobile professional polish structural checks, navigation/coaching profile, sleep stabilization/transactions, adaptive activity/workout intelligence, trust/workflow UX, workbook commit/source-replacement, and workflow/exploration/log checks.
- Three owner-fixture tests returned their expected explicit SKIP message because `ZEKE_TEST_DATA_ROOT` was not supplied: integrity live repair, workbook preflight, and real-data idempotency.

## Historical/version-pinned test files
Six older test files currently fail on hard-coded prior-version identity assertions rather than on a demonstrated v0.49 behavior failure:
- `tests/release-structure.test.js` initially referenced the prior DEVELOPMENT_MEMORY identity; the active project-state/gate metadata have now been advanced to v0.49.0 and should be rerun before RC promotion.
- `tests/v043-mobile-exercise-measurement.test.js`
- `tests/v043-rc2-longitudinal.test.js`
- `tests/v047-preserved-functionality.test.js`
- `tests/v048-interaction-integrity.test.js`
- `tests/v04801-longitudinal-product-coherence.test.js`

The latter five are historical gates whose first assertion requires a specific previous runtime identity. They are preserved as historical evidence and are not being relabeled as v0.49 passes.

## Newly added/changed acceptance coverage
`tests/v049-coherence.test.js` asserts the new release identity and the source-level presence of the v0.49 convergence features, including analytical metric detail, semantic goals, timeline navigation, Improvements Log, and AI mishap plumbing.

## Outstanding before release-candidate promotion
- Full rendered desktop acceptance of Dashboard, metric detail, goal detail, Questions for You, Timeline, Fitness, Health, Settings, and Talk.
- Rendered mobile checks at representative widths, especially metric timeframe controls, scrollable timeline, modal/detail overflow, bottom navigation, and inline Questions for You.
- Exact Back/scroll/filter restoration acceptance for same-stack detail navigation.
- Live Google silent reconnect / reconnect-required / offline state behavior after reload and browser restart.
- Live AI-provider failure/recovery behavior and verification that mishaps appear in diagnostics without writing unvalidated AI output into canonical data.
- Owner-data workbook/preflight/idempotency fixtures.

No live-provider, physical-device, or full rendered-browser pass is implied by this report.
