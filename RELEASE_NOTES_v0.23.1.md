# ZEKE v0.23.1 — Health & Fitness Workflow Stabilization

**Build:** 2026.07.20.1

## What changed

### Sleep and confirmation
- Added deterministic parsing for explicit sleep periods and duration-only sleep reports.
- A typed affirmative response to a pending save now completes that transaction before general interpretation.
- Added direct structured sleep logging from the Health Library Sleep tile.
- Added saved-record navigation and undo support.

### Health records and review
- Sleep is displayed as its own health-event type.
- Recent Health Record and dashboard evidence include sleep and Potential Health Events.
- Review Questions now show the original information, concrete proposal, and exact decision.
- Metric deltas are described as change over the selected period, not as reference-range status.
- Exact display duplicates are collapsed while source records remain preserved.

### Fitness
- Activity tiles consistently select and label a comparable numeric metric or explain why no chart is available.
- Flat trends render rather than disappearing.
- Coach’s Eye and Activity Library use one shared recommendation.
- Initial workout logging and workout editing expose the same optional RPE, pain, technique, notes, and injury/PT context fields.

### Insights, calendar, and navigation
- Replaced internal parsing terminology with concrete observations and useful next actions.
- Added defined-use health follow-up prompts for recent health-related calendar events; calendar presence is never proof of attendance or completion.
- Added a durable Potential Health Events context stream for future relationship analysis.
- Moved Labs into Health and Pattern Lab under Insights.

### Layout
- Rebuilt the dashboard as independent vertical stacks and improved narrow-column coaching readability.

## Compatibility and safety
- Canonical storage and user ownership are unchanged.
- New fields and records are additive.
- AI remains advisory; deterministic code controls record writes.
- No migration is required to roll back to the uploaded v0.23.0 package.
