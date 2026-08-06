# ZEKE v0.11.0

## Bundled improvements
- Multi-date workout parsing: one Talk to ZEKE message can create separate sessions for each explicit date.
- Date normalization: month/day, two-digit-year, and four-digit-year forms normalize to the same date when context supports it.
- Stairclimber records preserve both duration and step count.
- Natural-language medication backfill supports statements such as “I took my atorvastatin for the past 3 days,” with medication aliases and duplicate-safe repository reconciliation.
- Fitness now includes exercise progression cards, cardio summaries, history, evidence-based next-session suggestions, and confidence labels.
- Metric tile sparklines use the full selected range rather than an arbitrary final 12 points, preserving first/last values and chronological time spacing.
- AI provider cards clearly identify connected providers, successful test time, and connection state; the page summary names connected providers.
- Dashboard diagnostic record counts were replaced by a compact data-current status. Detailed counts remain in Data Integrity.
- Header Help and ZEKE Status controls now respond and explain their purpose.
- The date-range control adapts at narrower browser widths.

## Data safety
- No migration or deletion of existing health/workout records.
- Existing idempotent workbook/JSON synchronization remains in place.
- Ambiguous or questionable data remains reviewable rather than being silently deleted.
