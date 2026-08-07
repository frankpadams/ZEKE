# AI / Developer Start Here — ZEKE v0.41.0 RC1

**Package build:** 2026.08.07.1  
**Last user-deployed baseline:** v0.40.5 · build 2026.08.06.5  
**Release theme:** Fitness Intelligence & Clarity

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

`index.html` loads the readable static runtime. There is no compilation step. v0.41.0 RC1 is a descendant of the exact v0.40.5 package the user deployed successfully; it is not reconstructed from older sprint packages.

## Non-negotiable rules

- Preserve user ownership, raw observations, provenance, reversibility, missing-as-unknown, and provider-acknowledged saves.
- AI is advisory and replaceable.
- Mobile workout capture remains part of one ZEKE interface.
- Show only fields meaningful to the selected activity/schema.
- Equipment-specific exercise variations are separate progression units; do not equate machine, dumbbell, barbell, Bowflex, band, cable, or bodyweight loads.
- Historical exercise identity repair is review-based and non-destructive. Never rewrite the original exercise wording merely to normalize it.
- Clinician/PT instructions take priority over generic progression guidance.
- Do not describe planned work as implemented or unrun checks as verified.
- Begin each iteration with continuity/governance review and end with current docs, named test evidence, and a self-describing package.

## v0.41.0 implementation focus

- movement families plus exact equipment-specific variations and load basis;
- review-based historical exercise identity metadata;
- broader PT activity support with expanded names and abbreviations in parentheses;
- PT form guides and recognition help;
- explainable progressive-overload targets directly in workout logging;
- Discover centered on meaningful findings with stronger pattern screening;
- recent-state and momentum-oriented Trends & Analysis;
- Dashboard range controls attached to the sections they control;
- compact Today behavior;
- plain-language duplicate-record review;
- medication-specific opt-in scheduled-adherence assumptions.

The uploaded `events (3).json` is read-only reference material for compatibility planning. Do not modify it.
