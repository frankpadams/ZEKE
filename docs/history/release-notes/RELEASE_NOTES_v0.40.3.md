# ZEKE v0.40.3 — Sprint 3 Workout Intelligence & User Control

Built on v0.40.2.

## Added
- Per-activity recommendation preferences: More, Balanced, Less, and Exclude.
- Clear explanations of how each preference affects recommendations.
- Persistent, reversible preference storage separate from workout records.

## Changed
- Excluded activities are hidden from recommendation-oriented activity views but remain available in All for management and history.
- Coach's Eye will not recommend an activity marked Exclude.
- Activity cards display non-neutral preference status.

## Preserved
- Specific activity relationship reviews.
- Evidence and limitations views.
- Form guides, favorites, activity-specific schemas, and provenance.

## Known limitation
Routine generation does not yet fully weight More/Less preferences. That integration is deferred to a later refactor.
