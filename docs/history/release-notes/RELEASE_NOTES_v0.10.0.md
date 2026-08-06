# ZEKE v0.10.0 — Idempotent Workbook Synchronization Alpha

Build: **v0.10.0 · 2026.07.11.6**

## Purpose

This release links the historical health workbook once, stores a ZEKE-managed XLSX copy inside the user-owned `Project Zeke/imports/originals` Drive folder, and synchronizes that workbook with `health/events.json` across releases.

## SJN1 compatibility

- Detects the actual multi-row workbook header rather than assuming row 1.
- Recognizes `Exercise Desc.` and `Exercise Duration` as workout history.
- Recognizes weight, body fat, dose, energy, appetite, resting heartbeat, symptoms, notes, A1c, average glucose, cholesterol, LDL, HDL, triglycerides, CBC values, ALT, B12, ApoB, and Lp(a).
- Converts a populated daily row into separate typed events without altering the original longitudinal sheet.

## Duplicate and data-loss protection

- Stable source identity for the connected workbook.
- Deterministic source keys based on source, sheet, date, category, and metric/activity.
- Content fingerprints distinguish unchanged rows from edits.
- Repeated synchronization is idempotent.
- Existing semantically identical JSON records are linked rather than duplicated.
- Blank spreadsheet cells never delete JSON events.
- Conflicts are counted and preserved rather than overwritten.
- A timestamped JSON backup is written before every synchronization commit.
- Events are written in one reconciliation commit rather than one full-file rewrite per imported cell.

## Spreadsheet peer

ZEKE keeps the connected source workbook byte-for-byte intact and maintains a separate `Project Zeke/imports/ZEKE-Event-Mirror.xlsx` spreadsheet containing canonical event IDs and normalized event details. This avoids risking charts, formulas, styles, or workbook structure during browser-based synchronization.

## Important limitation

Browser security does not allow a static site to reopen an arbitrary local file automatically. ZEKE therefore stores and synchronizes a managed copy in the user's Project Zeke Drive folder. The originally uploaded local file is never modified silently.
