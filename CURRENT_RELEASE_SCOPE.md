# ZEKE v0.49.0 — Development Scope

**Build:** 2026.09.14.1  
**Baseline:** v0.48.0.2 build 2026.08.30.1  
**Status:** DEVELOPMENT PACKAGE — not a release candidate yet.

## Release thesis
This is the convergence/refinement build requested after real-world use of v0.48.0.2. It is intended to make the information ZEKE already stores materially more useful, understandable, actionable, and persistent across desktop and mobile.

## Locked scope for this build
1. **Timeframe-aware metrics.** Metric/glance tiles expose the active period, and metric detail uses a selectable period rather than a hidden fixed window.
2. **Comprehensive metric detail.** Drill-down contains graph, latest/average/change/count/previous-period comparison where meaningful, period-dependent narrative, relevant contextual events, and auditable underlying records.
3. **Home semantic separation.** Recent Activity = what happened; Today's Status = what needs attention now; Next Up = what is coming; Insights = actual interpretations; Health at a Glance = trends; Quick Actions = actions. Duplicate facts should not occupy several cards without adding meaning.
4. **Actionable Today's Status.** “Needs attention” requires a reason, recency/date context, and a useful next action. It must not merely repeat recent measurements.
5. **Longitudinal timeline grid.** Event domains are row headers; dates are columns. The grid scrolls through time, keeps domain context visible, supports Previous / Next / Today, permits future scheduled context without inventing future observations, and keeps events clickable.
6. **Semantic goals.** Goals store baseline/value/date, target, unit, tracked metric/activity, and what direction or rule constitutes progress (decrease, increase, at-most, at-least, maintain). New goals begin at 0% progress unless historical progress is explicitly intended.
7. **Meaningful goal detail.** Goal cards show baseline → current → target and open a trajectory/detail view rather than an arbitrary generic progress bar.
8. **Persistent Improvements Log.** Product shortcomings survive releases; entries can be resolved or explicitly waived, can be exported, and are mirrored into the user repository when connected. Open items must be reviewed before release promotion.
9. **AI/application mishap diagnostics.** Provider failures, parsing/validation failures, rejected AI envelopes, unauthorized outcomes/action authority violations, and related runtime failures produce diagnostic evidence rather than disappearing silently.
10. **Questions for You independence.** Answering a question remains inside Questions for You with direct choices or an inline answer; it must not bounce the user into Talk/dashboard merely to answer.
11. **Carry-forward requirements.** Preserve prior Fitness exploration/planning/logging; exercise variation histories; anatomy/injury/PT connections; value-of-information questioning; medication semantics; provenance; ingestion; Google connection states; Action Integrity; mobile/desktop responsiveness; and restrained blue visual direction.

## Verification boundary for this development package
Source/static verification is recorded in `TEST_REPORT.md`. This environment did not permit a trustworthy full rendered browser/device/live-Google acceptance pass. Those checks remain required before calling v0.49.0 a release candidate.
