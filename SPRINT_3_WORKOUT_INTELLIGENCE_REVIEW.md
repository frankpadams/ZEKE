# Sprint 3 — Workout Intelligence & User Control

## Baseline
ZEKE v0.40.2 Sprint 2 Adaptive Activity Schemas.

## Implemented
- Added four-state activity recommendation preferences: Recommend more, Balanced, Recommend less, and Exclude.
- Preferences are stored locally in `zeke.fitness.activityPreferences.v1` and do not rewrite workout history.
- Excluded activities remain available in the All view for management and historical review, but are removed from ordinary recommendation-oriented library views.
- Coach's Eye does not surface an excluded activity as its actionable activity recommendation.
- Expanded activity cards explain how each preference affects ZEKE's future recommendations.
- Activity cards visibly identify non-neutral preferences.
- Existing specific Review Relationships and Research & Evidence flows remain attached to the selected activity rather than redirecting to a generic page.

## Governance alignment
- User control is explicit and reversible.
- Historical observations are preserved when an activity is excluded.
- Preferences are separated from factual activity records.
- Recommendation suppression does not silently delete or transform data.

## Known limits
- Preference weighting influences the activity library and Coach's Eye selection guard in this sprint. Full routine-generation weighting is deferred until routine generation is refactored to consume the same preference service.
- Published research context remains limited to evidence already represented in the package.
