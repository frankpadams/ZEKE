# AI / Developer Start Here — ZEKE v0.40.5

**Build:** 2026.08.06.5  
**Current forward baseline:** v0.40.5  
**Sprint:** Governance & Continuity

## Read in this order before editing

1. `ZEKE_CONSTITUTION.md`
2. `PROJECT_STATE.md`
3. `ARCHITECTURE.md`
4. `FEATURE_STATUS.md`
5. `DECISION_LOG.md`
6. `KNOWN_ISSUES.md`
7. `ROADMAP.md`
8. `PRE_IMPLEMENTATION_REVIEW.md`
9. `POST_RELEASE_REVIEW.md`
10. `DOCUMENTATION_MAP.md`
11. `DEVELOPMENT_MEMORY/DEVELOPMENT_ERROR_LOG.md`
12. `DEVELOPMENT_MEMORY/BACKLOG.md`

## Current runtime

`index.html` loads the readable static runtime. There is no compilation step. Verify the dependency chain from `ARCHITECTURE.md` and the current build manifest before changing code.

## Non-negotiable rules

- Preserve user ownership, raw observations, provenance, reversibility, missing-as-unknown, and provider-acknowledged saves.
- AI is advisory and replaceable.
- Mobile workout capture is part of one ZEKE interface; do not recreate a separate Gym application.
- Talk to ZEKE/input remains a primary interaction, especially on mobile.
- Show only fields meaningful to the selected activity/schema.
- Do not describe planned work as implemented or unrun checks as verified.
- Begin each sprint with governance review; end it with updated canonical docs, named test evidence, and a self-describing package.

## Next task

Sprint 5: verification and release-candidate hardening. Do not add broad feature scope before classifying the current regression and environment-verification boundary.
