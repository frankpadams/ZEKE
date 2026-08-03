# ZEKE v0.40.0 Test Report

**Build:** 2026.08.03.1  
**Package verification:** Passed  
**Environment verification:** Outstanding

## Passed current JavaScript regressions

- activity foundation
- conversation security and editing
- dashboard layout acceptance
- factor idempotency
- integrity live-fixture repair transaction, backup, and undo
- form-guide library
- medication action/status and parser
- navigation/coaching/profile
- release structure
- sleep and insight stabilization
- sleep transaction and undo
- trust/workflow UX
- v0.40 major milestone
- workbook commit/verify, preflight, real-data idempotency, source replacement/backup
- workflow engine

## Rendered Chromium smoke

Passed on desktop routes and a 390×844 mobile viewport:

- no page errors
- no horizontal page overflow
- dashboard v3 with three story cards, weekly plan, and review status
- mobile center action labeled Log
- 103 visible fitness cards when All is selected (102 knowledge objects plus the user/custom path represented by the UI)
- guide opens and includes targeting/mind-muscle content
- representative Repair Center shows exact duplicate, import legend, implausible sleep, paddling fields, and answered-question candidates

## Live-data fixture evidence

The supplied read-only live fixture produced 18 candidates: 3 exact-duplicate groups, 1 import artifact, 7 zero-as-missing heart-rate candidates, 1 paddling-field candidate, 1 implausible sleep candidate, 1 answered medication question, and 4 stale/duplicate discoveries. Source files were not modified during testing. The live-fixture transaction test applied all 18 proposed repairs in an isolated in-memory provider, verified the expected supersession/quarantine/field cleanup/question/discovery results, and restored the original event/factor/discovery state through Undo.

## Governance and package checks

- `python tools/project_audit.py`: passed after current authority reconciliation.
- `python tests/governance-negative-controls.py`: passed all negative controls.
- JavaScript syntax checks: passed.
- Final ZIP: reopened and compared against file-level manifest/provenance.

## Not established by this report

- Live Google Drive authentication and write acknowledgements.
- Physical iPhone/Android usability.
- Remote-media uptime.
- Medical or clinical effectiveness.
