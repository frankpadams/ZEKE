# ZEKE v0.16.3 — Evidence-First Sync Repair

## Critical data-integrity repairs
- Workbook synchronization no longer substitutes the sync time when a workbook date is missing or cannot be parsed.
- Spreadsheet rows are read without collapsing blank rows, preserving real Excel row numbers.
- Every workbook observation must identify the exact nonblank source cell, not merely a row.
- Source identity is now based on source cell + observation type and remains stable when blank rows are present.
- Sync aborts before writing if any candidate lacks a valid date, source cell, or unique source identity.
- Backups include app version and event count.

## Recovery
Use the separately supplied `events-repaired.json` only after retaining the current `events.json` and quarantine file. It rebuilds connected-workbook observations from literal populated cells and preserves non-workbook records.
