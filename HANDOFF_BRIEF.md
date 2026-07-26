# ZEKE Handoff Brief

**Authoritative runtime baseline:** ZEKE v0.27.2 · build 2026.07.22.2319  
**Governance revision:** 2026.07.25.1  
**Recovery position:** v0.27.2 is authoritative; v0.28.x is rejected as a forward-development baseline.

Start with `00_AI_START_HERE.md`, then read `ZEKE_CONSTITUTION.md`, `DEVELOPMENT_MEMORY/GOVERNANCE_RECONCILIATION_2026-07-25.md`, and `DEVELOPMENT_MEMORY/PROJECT_STATE.json`.

## What this package is

This is the v0.27.2 runtime plus reconciled governance documentation. No Gym Mode or application behavior is claimed fixed by this documentation-only revision.

## Locked direction

- Storage is provider-agnostic, with one active primary provider at a time.
- Confirmed records live with that provider; optional local storage is temporary unfinished-form recovery only.
- Incognito use is allowed, but preservation of unsaved work is not guaranteed.
- Effective dates are visible and editable on every data-entry screen.
- Sleep supports multiple true segments in the same sleep day.
- Gym Mode is phone-first and must not break desktop ZEKE.
- Routines are starting templates, not mandatory historical workout units.
- Primary exercise fields may be prefilled from prior confirmed performance; optional details remain blank.
- Readiness is qualitative, evidence-bounded, and may use a numberless gauge plus written explanation.
- History and Form Guide remain within Gym Mode.
- Form Guide images must actually show the named exercise being performed.
- AI keys use a provider-backed encrypted vault, PIN unlock through a narrowly scoped security service, and recovery-code/reset paths.
- Release packaging, timestamps, hashes, and verification language are integrity requirements.

## Development boundary

Do not patch the rejected v0.28.x interface forward. Begin the next implementation from v0.27.2, preserve the approved mockup, establish state and persistence tests first, and keep mobile Gym Mode changes scoped away from desktop ZEKE.
