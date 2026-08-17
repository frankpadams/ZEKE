# ZEKE Documentation Map

## Read first — current authority

1. `00_AI_START_HERE.md`
2. `ZEKE_CONSTITUTION.md`
3. `PROJECT_STATE.md`
4. `ARCHITECTURE.md`
5. `FEATURE_STATUS.md`
6. `DECISION_LOG.md`
7. `KNOWN_ISSUES.md`
8. `ROADMAP.md`
9. `CHANGELOG.md`
10. `RELEASE_NOTES.md`
11. `HANDOFF_BRIEF.md`

## Development controls

- `PRE_IMPLEMENTATION_REVIEW.md`
- `POST_RELEASE_REVIEW.md`
- `DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json`
- `DEVELOPMENT_MEMORY/RELEASE_GATE.md`
- `DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json`
- `DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json`

## Historical evidence

- Historical per-version release notes are consolidated verbatim into `CHANGELOG.md`; no separate release-note directory is shipped.
- `DEVELOPMENT_MEMORY/ITERATION_RECORD_*.md`
- Version-specific test reports, manifests, package verifications, and provenance snapshots

Historical evidence explains how the project arrived here. It does not override the current canonical documents unless the authority registry explicitly says so.

## Runtime authority

The files actually loaded by `index.html` are the active application. Unreferenced source, old bundles, fixtures, and historical artifacts are not active merely because they are present.

## Historical interpretation rule

Historical documents may contain superseded terms or architectures. Use `DECISION_LOG.md`, `CURRENT_RELEASE_SCOPE.md`, `DESIGN_AUTHORITY.md`, `PROJECT_STATE.md`, and `RELEASE_NOTES.md` to resolve current behavior. Historical material is traceability, not authority.
