# ZEKE v0.8.3 — Data Visibility and Compact Dashboard Safety Release

## Purpose
This release fixes data invisibility and awkward dashboard gaps without migrating, rewriting, deleting, or consolidating existing records.

## Data safety
- No automatic repository migration.
- No changes to `health/events.json` format.
- No deletion or replacement of imported source records.
- Compatibility normalization is performed in memory for display only.
- Repository and workout diagnostics are read-only.

## Improvements
- Flexible recognition of health and lab records across legacy/imported field names.
- Expanded Health at a Glance metric catalog.
- Recent Health Evidence panel displays useful records even when there are too few points for a graph.
- Read-only repository inventory reports loaded record categories and recognized metrics.
- Workout Data Status distinguishes recognized workouts, possible unrecognized candidates, and source files/sheets.
- Independent dashboard columns remove large blank grid areas when panels have uneven heights.
- Visible build identification updated to v0.8.3 / 2026.07.11.4.
