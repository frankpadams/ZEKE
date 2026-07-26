# Project Health — v0.27.2

**Runtime build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1

## Current position

- Runtime baseline: v0.27.2.
- v0.28.x: rejected as a forward-development baseline.
- Governance corpus: reconciled to the decisions approved July 25, 2026.
- Runtime behavior: unchanged by this package.

## Highest risks before the next implementation

- Gym Mode state and navigation defects must not be patched forward from v0.28.x.
- Mobile Gym Mode changes must remain scoped away from desktop ZEKE.
- Save language must correspond to real provider acknowledgement.
- Storage abstractions must remain provider-neutral.
- Optional local recovery must never become canonical data.
- Exercise-media review must verify the depicted movement, not merely licensing fields.
- Release timestamps and provenance must remain honest and independently verifiable.

## Required next gate

Before code changes, present a scoped recovery plan based on v0.27.2, define rendered phone/desktop acceptance, and obtain explicit user approval.
