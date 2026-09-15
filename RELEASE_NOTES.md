# ZEKE v0.49.0.1 — Dashboard render hotfix

Build: **2026.09.14.2**

Hotfix to v0.49.0. Corrects the Dashboard/Health-at-a-Glance renderer reference from the nonexistent `dashboardRangeHTML()` helper to the implemented `dashboardRangeControl()` helper. Adds a regression test and advances the service-worker cache identity so deployed clients do not retain the broken application shell. No repository schema or canonical-data migration is required.

# ZEKE v0.49.0 — Development package

Build: **2026.09.14.1**

This development package reconciles the major product feedback from the month leading into September 14, 2026. It is intentionally labeled a development package, not a release candidate, until rendered/mobile testing is complete.

## Implemented in this package

- Dashboard Health at a Glance exposes a visible selectable period on desktop and mobile.
- Metric drill-down is now an analytical view: selectable timeframe, dated latest value, stats, full trend graph, period-dependent narrative, contextual events, and underlying observations.
- Today’s Status no longer duplicates routine measurements; “Needs attention” is reserved for actionable review/injury context.
- Generic “data is available” insight filler is removed from the desktop dashboard.
- Timeline Snapshot rebuilt as domain rows × date columns with explicit date range, horizontal scrolling, previous/next week, Today, clickable events, and future-scheduled-context safeguards.
- Goal semantics implemented: direction of improvement, metric linkage, baseline date/value, current value, target, and baseline-to-target progress. A newly created goal is 0% complete.
- Goal entry can infer body fat/weight/steps/A1c/resting-HR/sleep semantics, allows the user to correct direction, and can capture the current verified value as baseline.
- Persistent Improvements Log added to Settings, stored locally and mirrored to the connected user repository when available.
- AI provider, parse, schema, and authority failures emit structured AI mishap events into the Improvements Log while remaining distinct from canonical health data.
- Build/version surfaces updated to v0.49.0 / 2026.09.14.1.

## Still requiring verification before release-candidate status

- Full mobile rendered pass on 320–430 px widths.
- Google reconnect persistence across browser/device restart.
- Every historical fitness/detail workflow and PT guide.
- Same-stack Back restoration of exact scroll/filter state.
- End-to-end user-repository persistence of improvements on all configured storage paths.
- Cross-domain intelligence recommendations under real user data.

## Release rule

Open Improvements Log items must be reviewed before a subsequent build is declared ready. An item may be explicitly resolved or waived, but should not disappear silently.
