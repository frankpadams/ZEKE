# AI Start Here — ZEKE v0.40.0

**Build:** 2026.08.03.1  
**Governance revision:** 2026.08.03.1  
**Current forward baseline:** v0.40.0

Read in this order before changing code:

1. `HANDOFF_BRIEF.md`
2. `ZEKE_CONSTITUTION.md`
3. `DEVELOPMENT_MEMORY/PROJECT_STATE.json`
4. `DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json`
5. `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.40.0.md`
6. `ARCHITECTURE.md`
7. `FEATURE_STATUS.md`
8. `RELEASE_NOTES_v0.40.0.md`
9. `TEST_REPORT_v0.40.0.md`
10. `DEVELOPMENT_MEMORY/DECISION_LOG.md`
11. `DEVELOPMENT_MEMORY/DEVELOPMENT_ERROR_LOG.md`
12. `DEVELOPMENT_MEMORY/BACKLOG.md`

## Non-negotiable position

- The user-owned JSON repository is already authoritative; the historical spreadsheet is provenance, not the active record.
- AI may interpret and propose. Deterministic code plus explicit user action govern canonical writes.
- Missing is not zero. Suggested is not confirmed. Saved requires an acknowledged provider write.
- Corrections preserve provenance and supersede or quarantine old records rather than silently rewriting history.
- Every graph, route, trend, streak, comparison, and insight must represent actual available data or disclose insufficient data.
- Mobile improvements apply to the whole application. Do not recreate a separate Gym Mode architecture.
- Exercise media must truthfully depict the named movement and retain source/license metadata; otherwise show the written guide without an image.
- Do not restore rejected v0.28.x code or stale v0.29/v0.31 authority text.

## Active runtime

`index.html` loads `version.js`, `zeke-config.js`, `xlsx-bundle.js`, `assets/data-layer.js`, `assets/parser.js`, `assets/ai-router.js`, `assets/workflow-engine.js`, `assets/exercise-guides.js`, `assets/knowledge-base.js`, `assets/integrity-engine.js`, `assets/app.js`, and `assets/styles.css`. The service worker and build manifest must agree with build 2026.08.03.1.
