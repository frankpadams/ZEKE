# ZEKE Backlog

**Status:** Authoritative  
**Current baseline:** v0.22.2 · build 2026.07.19.3

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
