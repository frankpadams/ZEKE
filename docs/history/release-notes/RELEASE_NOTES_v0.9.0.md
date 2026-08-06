# ZEKE v0.9.0 — Data Integrity Read-Only Alpha

Build: **v0.9.0 · 2026.07.11.5**

This release adds a read-only Data Integrity workspace so missing display data can be diagnosed without changing existing records.

## Added
- Repository census with loaded event counts, category counts, source counts, and date coverage.
- Explicit distinction between recognized workouts and possible workout-shaped records.
- Metric registry showing how health/lab names map to dashboard metrics.
- Import diagnostics using preserved import-batch reports.
- Canonical repository map for the files ZEKE expects under `Project Zeke`.
- Searchable repository browser showing classification, summary, provenance, and status.
- Exportable JSON data audit for troubleshooting and handoff.

## Data safety
- No migration is run.
- No source spreadsheet is edited.
- No canonical JSON file is rewritten by opening or filtering the Data Integrity page.
- No uncertain record is automatically reclassified or merged.
- Export creates a local audit download only.
