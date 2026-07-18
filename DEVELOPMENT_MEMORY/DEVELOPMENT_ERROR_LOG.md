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
