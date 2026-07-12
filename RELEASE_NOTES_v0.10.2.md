# ZEKE v0.10.2 — Sitewide Form Focus Reliability Fix

- Extends focus and caret preservation from Talk to ZEKE to all text fields, password fields, URL fields, model fields, selects, textareas, and contenteditable controls.
- Prevents background data/storage refreshes from replacing an actively edited control.
- Preserves in-progress API key, endpoint, and model values across necessary renders without persisting secrets to Drive.
- Defers nonessential redraws until the user leaves the active form control.
- No health records, workbook data, or canonical events are migrated or rewritten by this release.
