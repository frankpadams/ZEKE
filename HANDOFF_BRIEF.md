# ZEKE Handoff Brief — v0.43.0 RC2.1

**Build:** 2026.08.16.3  
**Release label:** Longitudinal Integrity & Sync RC2

Start with `00_AI_START_HERE.md`. The package is designed to stand alone without prior conversation history.

## What changed in RC2

RC2 continues the RC1 mobile exercise/body-composition work and addresses issues exposed by real use: medication dose occurrences are treated as longitudinal dated data; known schedules can reconstruct assumed historical occurrences; assumed occurrences can be corrected retroactively; direct medication-history questions are answered from stored occurrences rather than requiring redundant clarification; meta/product feedback is kept out of health data; read-only questions can interrupt an unfinished write workflow without being hijacked by it; retrospective calendar relevance review was added as a mobile-first workflow; Health Reports & Export replaces the old workbook as the normal human-readable reporting path; the connected workbook is demoted to legacy migration/reconciliation; and AI provider credentials sync through the connected workspace rather than local browser storage.

## Design authority

Read `DESIGN_AUTHORITY.md`. Do not reintroduce Gym Mode. Do not separate set display from set entry. Do not collapse variations into separate canonical tiles. Do not make total volume the primary exercise metric merely because it appeared in an older analytics mockup.

## Data authority

Canonical longitudinal JSON is source of truth. Generated XLSX/JSON outputs are reports. Calendar items are candidate evidence. Medication schedule assumptions are evidence-labeled occurrences, not confirmed administrations. DEXA is measurement provenance/method.

## Release status

This remains a release candidate. PT visual-guide completion and physical-phone visual acceptance remain hard gates. Run `TEST_GUIDE.md` and `tests/v043-rc2-longitudinal.test.js` before any promotion.
