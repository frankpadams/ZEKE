# Iteration Record — v0.20.5

**Build:** 2026.07.18.1

## Approved scope
- Reconcile all active authority and release identity contradictions
- Update the Constitution to the approved unified Talk to ZEKE design
- Make the continuity audit enforce release identity, current scope, artifact authority, package file count, supersessions, and negative controls
- Reduce competing startup paths and clearly classify current, supporting, historical, and superseded artifacts
- Clarify backlog resurfacing prerequisites and preserve inherited application/data behavior
- Run full regression and package reproducibility verification

## Findings addressed
- Constitution §14 conflicted with the approved unified Talk to ZEKE interface.
- Release gate, handoff README, document index, and approval state retained v0.20.3 identity or scope.
- The earlier audit could report zero errors despite those contradictions.
- UI-021 had an ambiguous responsive-verification prerequisite.
- Multiple start files looked authoritative and increased handoff friction.

## Implemented
- One consistent v0.20.5 release identity and authority chain.
- Machine-readable artifact registry and governance invariants.
- Strong audit plus seeded negative-control tests.
- Redirect-only treatment for competing entry documents.
- Concise handoff brief and project health report.

## Exclusions
No product feature, user-data, provider, dashboard customization, Fitness redesign, or schema migration work.
