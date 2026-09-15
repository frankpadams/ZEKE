# Persistent Improvements Log — Seed / release continuity

This file documents the release-process contract. Runtime entries live in ZEKE itself and, when connected, are mirrored to the user-owned repository as `improvement_log` factors.

## Open items carried into v0.49.0 development

- Verify mobile time-range controls remain visible and usable.
- Verify comprehensive metric detail graphs and period-dependent interpretation on real data.
- Verify Timeline Snapshot domain-row/date-column grid on desktop and mobile, including backward/forward navigation and Back state restoration.
- Verify goal progress semantics for decrease, increase, threshold, maintenance, exercise-load, and frequency goals.
- Verify Today’s Status contains only actionable current information and does not duplicate routine Recent Activity/Health at a Glance data.
- Verify Insights avoid repetitive “data available” and deliberately declined nutrition-tracking nags.
- Verify AI mishaps and application errors are logged without contaminating canonical health data.
- Verify Google connection persistence/reconnect states.
- Verify Talk panel close/expand/collapse and mobile More navigation.

Before a release candidate is declared, review runtime Improvements Log entries plus this continuity seed. Resolve or explicitly waive each release-blocking item.

## v0.49.0.1 hotfix — 2026-09-14

- **Release-blocking display regression (resolved):** Dashboard crashed with `Can't find variable: dashboardRangeHTML` because `v47HealthHTML()` referenced a nonexistent helper introduced during the v0.49 timeframe integration. Corrected the renderer to use the existing `dashboardRangeControl('health')` helper.
- Added a regression assertion that fails if `dashboardRangeHTML(` reappears or the Health-at-a-Glance range control is not wired to the defined helper.
- This failure affected display only; no canonical stored-data mutation was involved.
