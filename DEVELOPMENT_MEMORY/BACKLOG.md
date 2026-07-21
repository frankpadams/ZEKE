# ZEKE Backlog

**Status:** Authoritative  
**Current baseline:** v0.24.0 · build 2026.07.21.1

| ID | Item | Priority | Status | Origin | Resurface when |
|---|---|---:|---|---|---|
| UI-021 | Drag-and-drop dashboard editing | High | Blocked pending evidence decision | v0.20 planning | User accepts deployed-origin responsive evidence or explicitly approves an isolated harness as sufficient |
| UI-022 | Saved layout profiles | High | Back burner | v0.20 planning | UI-021 design begins |
| UI-023 | Pin vs Auto tiles | Medium | Deferred | v0.20 planning | Layout profiles exist |
| UI-024 | Layout export/import and reset/undo | Medium | Deferred | v0.20 planning | UI-021 implementation begins |
| UI-025 | Deployed-origin responsive and accessibility verification | High | Ready for review | v0.22.2 | Next deployed test session |
| FIT-014 | Complete Fitness information architecture polish | High | Ready for review | prior iteration | Next Fitness-focused release |
| FIT-015 | Activity identity management: aliases, record/global rename, duplicate merge, recategorization | High | Ready for design | v0.22.2 | Before global Workout History operations are implemented |
| FIT-016 | Reviewed migration of ambiguous legacy activity categories | High | Blocked by FIT-015 | v0.22.2 | Canonical identity and migration rules are approved |
| FIT-017 | Full correction-history viewer and practical revert/undo | Medium | Deferred | v0.22.2 | Record-scoped editing has been used with real data and semantics are reviewed |
| FIT-018 | Rich modality-specific charts and derived metrics | Medium | Ready for review | v0.22.2 | Fitness information architecture scope is approved |
| GOV-006 | Inventory, classify, quarantine, or remove unreferenced runtime assets | High | Ready for review | independent audits | Before deleting historical assets or restructuring the build |
| GOV-007 | Package-wide personal-identity scan across active code, fixtures, fallback data, exports, and AI packets | High | Ready for verification | independent audits | Next code review or before multi-user use |
| QA-008 | Reproduce or close repeated-advice report on a hard-refreshed deployed build | Medium | Needs deployed verification | independent audit | Deployed v0.22.2 is available |
| MED-008 | Re-audit medication logger routing and confirmation preferences | High | Completed v0.20.3 | prior iteration | Reopen only if a medication regression fails or requirements change |
| DOC-003 | Consolidate or archive historical documentation | Medium | Partially completed v0.22.2 | v0.20.2 | Physical archive/pruning becomes worth compatibility risk |

## Current disposition
- The v0.22.2 application foundation is implemented; global activity identity operations remain intentionally deferred.
- No legacy activity should be silently migrated from loose regex/name matching. Ambiguous records require review.
- Asset cleanup must begin with an inventory and reference analysis, not blind deletion.
- Responsive and accessibility behavior remains an environment-dependent release boundary.
- A reported duplicate-advice condition remains unverified; do not implement speculative concurrency architecture without reproduction.

At the beginning of every iteration, resurface all **Ready for review**, **Ready for design**, and any deferred item whose condition is true.

## After v0.23.0

- Expand active conversation topics into durable, typed conversation-state objects.
- Add complete AI evidence-packet selection, repair loops, second-provider review, and diagnostics UI.
- Add medication-specific and lab-reference-aware structured record editors.
- Add activity identity global rename, recategorization review, duplicate merge, migration preview, and undo.
- Add browser-level end-to-end tests for conversation and record editing.

## After v0.23.1

| ID | Item | Priority | Status | Resurface when |
|---|---|---:|---|---|
| QA-009 | Deployed sleep save/view/undo and persistence acceptance | High | Environment verification outstanding | v0.23.1 is deployed and hard-refreshed |
| QA-010 | Protected real-workbook regression | High | Blocked by external fixture | `ZEKE_TEST_DATA_ROOT` is available |
| UI-026 | Physical-device mobile and accessibility pass | High | Environment verification outstanding | Current build is available on representative devices |
| INS-012 | Reviewed promotion/reclassification of Potential Health Events | Medium | Deferred | Sufficient real Potential Health Events exist to design safely |
| CAL-006 | Live calendar follow-up/downstream update acceptance | Medium | Environment verification outstanding | Google Calendar is connected on deployed origin |
| LAB-007 | Source-lab reference interval and target-context editor | Medium | Ready for design | Next lab-focused iteration |

The v0.23.1 stabilization scope remains complete locally. Do not reopen it as feature work unless a regression fails or deployed evidence contradicts the package checks.

## After v0.24.0

| ID | Item | Priority | Status / prerequisite |
|---|---|---:|---|
| QA-024 | Verify workflow restoration and Support Report download on the deployed origin | High | Requires live Google Drive and deployed-browser testing |
| UX-024 | Physical-device Talk to ZEKE and Conversation Memory accessibility review | High | Requires iOS/Android and keyboard/screen-reader evidence |
| AI-024 | Verify provider escalation, failure logging, and free-first routing with live keys | High | Requires user-authorized provider connections |
| DATA-024 | Re-run protected real-workbook idempotency suite | High | Requires `ZEKE_TEST_DATA_ROOT` fixture |
| CLEAN-024 | Review and remove unreferenced historical hashed bundles | Medium | Separate approved cleanup; preserve audit continuity |
| HISTORY-024 | Build a user-facing correction-history browser and broader undo | Medium | Workflow/audit foundation now available |
| WF-025 | Expand hard-refresh restoration to every specialized editor and multi-step import preview | Medium | Common question, confirmation, correction, health-history, memory, and schedule resume paths are implemented; specialized modal reconstruction needs deployed use evidence |
