# Development Error Log

**Status:** Authoritative and cumulative

## ERR-001 — Partial version synchronization
- **Failure:** Release labels differed across index, version.js, VERSION.txt, and application fallback.
- **Impact:** A package could appear newer without being a coherent release.
- **Prevention:** Search the staged package for old version/build strings; fail the release gate if active files disagree.

## ERR-002 — Claims exceeded verification
- **Failure:** Release behavior was described as verified when only source structure had been inspected.
- **Impact:** User time was spent testing packages that had not been rendered.
- **Prevention:** Distinguish syntax, structural, rendered, and user-data tests. Never label unperformed tests as passed.

## ERR-003 — Fragile whitespace patches
- **Failure:** Repeated late CSS overrides attempted to repair a dashboard whose DOM still used coupled two-column placement.
- **Impact:** Tall cards created unrelated blank regions and fixes were difficult to trust.
- **Prevention:** Use explicit independent rows in the DOM. Empty visualizations must not be rendered or reserve height.

## ERR-004 — README and active guidance became stale
- **Failure:** README and deployment guidance lagged behind the running release.
- **Impact:** New chats and developers could follow obsolete instructions.
- **Prevention:** README update and document-index audit are release-gate requirements.

## ERR-005 — Deferred work disappeared from view
- **Failure:** Improvements discussed but not implemented were scattered across conversations and old notes.
- **Impact:** The same planning work had to be repeated.
- **Prevention:** Every deferred item receives a backlog ID, review date, reason, and resurfacing condition.

## ERR-006 — Development began before the required startup gate
- **Failure:** Development work was announced immediately after a general request to proceed, before completing the baseline audit, resurfacing eligible backlog items, presenting an iteration scope, and obtaining explicit approval.
- **Impact:** The project could have been changed without the user seeing or approving the actual scope, exclusions, data risks, or verification plan.
- **Prevention:** Every package has a root-level `00_AI_START_HERE.md`; a prescribed Pre-Development Checkpoint; an explicit stop point; a machine-readable `DEVELOPMENT_GATE.json`; and a recorded approval timestamp before the first edit. General enthusiasm or urgency never counts as scope approval.


## ERR-007 — Prior ZEKE decisions were not consulted before implementation continued
- **Failure:** After scope approval, implementation continued without first consulting accessible prior ZEKE conversations for binding synchronization, storage, confirmation, and deployment decisions.
- **Impact:** A technically plausible change could contradict requirements already decided by the user, such as cloud-canonical storage, reviewed transaction sequencing, no carried-forward observations, and confirmation before committing interpreted entries.
- **Prevention:** The startup gate and workflow now require a prior-conversation review before scope is proposed and again when the user requests clarification. User decisions are binding unless they conflict with the Constitution or verified evidence; earlier assistant claims must be corroborated by package files, data, or tests. Record the review in the iteration gate.

## v0.20.4 — Continuity framework certified despite internal contradictions
**Failure:** The release audit reported zero errors while the Constitution, release gate, development gate, document index, and file-count record disagreed.
**Cause:** The audit checked presence and a few strings rather than cross-document invariants.
**Prevention:** Maintain a machine-readable artifact registry and governance rules; compare current identity and approved scope across authorities; verify actual file count; run negative-control tests that seed contradictions and require audit failure.


## ERR-021 — Runtime version source drift
**Observed:** The browser tab identified v0.20.5 while the in-application header showed v0.20.3/build .12.  
**Cause:** `app.js` retained a stale fallback and `version.js` populated a different global name.  
**Prevention:** `version.js` now populates both `ZEKE_VERSION` and `ZEKE_BUILD`; current-release audits must inspect runtime source declarations, not only documentation.

## ERR-022 — Nonfunctional affordance in Activity Library
**Observed:** Activity cards displayed a help cursor but did not open.  
**Prevention:** Interactive cards must use pointer semantics, mouse and keyboard activation, visible expanded state, and regression/manual checks.
