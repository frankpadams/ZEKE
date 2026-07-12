# ZEKE v0.10.1 — Conversation Input Focus Reliability Fix

## Fixed
- Talk to ZEKE no longer loses keyboard focus while background repository or workbook synchronization events arrive.
- Draft text and caret/selection position are preserved across unavoidable UI renders.
- Background data-change renders are deferred while the Talk to ZEKE field is actively being edited, then applied after the field loses focus.
- Draft text is tracked continuously rather than only immediately before a full render.

## Data safety
This release changes presentation/event-handling behavior only. It does not migrate, rewrite, delete, or re-import health data.
