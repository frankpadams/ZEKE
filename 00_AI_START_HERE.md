# AI / Developer Start Here — ZEKE v0.46.0

**Runtime build:** 2026.08.24.1  
**Governance revision:** 2026.08.24.2  
**Release:** UX Architecture + Connected Anatomy  
**Continuity review:** 2026-08-24 — current authority chain reconciled after post-package audit.

This package is the current authoritative Project ZEKE baseline. Runtime behavior is v0.46.0 build 2026.08.24.1; governance revision 2026.08.24.2 corrects the release/continuity documentation and strengthens the audit so stale standing authorities cannot silently pass again. This reconciliation does not claim additional runtime behavior beyond build 2026.08.24.1.

## Read in this order
1. `ZEKE_CONSTITUTION.md` — binding product principles.
2. `DEVELOPMENT_SYSTEM/AUTHORITY_AND_LIFECYCLE.md` — document authority/lifecycle rules.
3. `DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json` — machine-readable release invariants.
4. `DEVELOPMENT_MEMORY/PROJECT_STATE.json` — exact current release/build/governance state.
5. `CURRENT_RELEASE_SCOPE.md` — current implementation scope, boundaries, and status.
6. `DESIGN_AUTHORITY.md` — approved desktop/mobile composition and interaction contract.
7. `ARCHITECTURE.md` — current architecture and durable data/knowledge boundaries.
8. `DECISION_LOG.md` and `DEVELOPMENT_MEMORY/DECISION_LOG.md` — binding current decisions and cumulative history.
9. `DEVELOPMENT_MEMORY/ITERATION_HISTORY.md` and `DEVELOPMENT_MEMORY/CONTINUITY_HISTORY.md` — current iteration and reconciliation history.
10. `TEST_REPORT.md` and `DEVELOPMENT_MEMORY/RELEASE_GATE.md` — verification evidence and remaining environment gates.
11. `DOCUMENTATION_MAP.md` — map of the living documentation set.

## Current product/UX direction
- Dashboard is a cross-domain daily briefing: orient, prioritize, show meaningful change, and surface next actions. It is not a miniature Health page and not a free-form card wall.
- The whole screen is the unit of visual quality. Feature components may not independently dictate unusable geometry.
- Small visual aids—stable icons, sparklines, status markers, timelines, and compact charts—exist to improve recognition and scanning, not as decoration.
- Recent Activity is a structured visual feed; intentional scrolling is acceptable when it improves comprehension.
- Talk to ZEKE has predictable **closed / compact / expanded** states and an obvious close control.
- Every consequential user action produces an immediate, persistent, visible response; silent clicks are defects.
- Exercise discovery is browse-first. Linked body areas provide a non-search route into exercises, injuries/PT context, and history.
- Exercise variations remain mechanically distinct. Expanded charts show separate variation series on shared axes and never turn missing load into zero.
- Exercise/body-area/injury/PT relationships use a shared anatomy knowledge layer. Anatomy overlap supplies context, not an automatic prohibition.
- General anatomy/reference knowledge is versioned, source-traceable, refreshable, validated before activation, and rollback-capable. It is separate from personal records and clinician/PT facts.
- Recommended workouts show a concise decision-relevant **Why this** first; deeper reasoning is available on demand.

## Non-negotiable data/safety boundaries
- User-owned canonical data remains authoritative; AI output is advisory.
- Missing data remains unknown. Blank pain is not pain-free.
- Clinical source facts, clinician restrictions, AI inference, and observed exercise response remain distinct evidence classes.
- ZEKE may provide evidence-bounded training decision support, but does not diagnose, prescribe, provide medical clearance, or silently convert anatomical or imaging context into a prohibition.
- Explicit clinician/PT restrictions outrank AI-generated workout suggestions.
- Manual AI packets remain supported when an API/provider connection is unavailable.
- Mobile may use a purpose-built presentation layer, but it must preserve the same canonical data, workflows, provenance, and desktop capability.
- Physical-device/deployed-provider checks are not considered passed unless they actually ran.

## Release state
Package-local governance/static/rendered verification is reconciled for runtime build 2026.08.24.1 and governance revision 2026.08.24.2. The continuity audit now checks every registered authoritative document for current-release review metadata in addition to identity agreement. Physical-device visual acceptance and live connected-provider verification remain environment gates and are not implied by package-local checks.
