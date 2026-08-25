# ZEKE v0.48.0 — Current Development Scope

**Runtime build:** 2026.08.25.1  
**Governance revision:** 2026.08.25.2  
**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2  
**Status:** active development; not release-promoted.

## Purpose
v0.48.0 refines the v0.47 visual/functionality foundation while correcting integrity defects discovered through owner use. v0.47.0 remains the user-tested release baseline until v0.48 reaches the required evidence states.

## Currently coded in this development package
- Evidence-integrity governance: observation before interpretation, artifact-backed claims, explicit evidence-state ladder, requirement-derived falsification, and contradiction stop rules.
- Questions-for-You duplicate-resolution repair: failed factor writes roll local state back instead of leaving an unsaved resolution in memory.
- Provider write path performs one silent retry when Google authorization has expired; if that fails, reconnect-required state is surfaced.
- Duplicate-review feedback uses one reusable live status region instead of stacking identical failure messages.
- Preference/action/AI-connection writes restore prior in-memory state on provider failure.

## Approved v0.48 work still to implement/verify
- ZEKE-owned longitudinal explorer with Day / Week / Month / Year semantic zoom and clickable cross-domain lanes.
- Google Calendar relevance candidates that require user inclusion/confirmation rather than becoming the Timeline database.
- Medication regimen → scheduled/due occurrence → confirmed administration logic, including effective-dated schedule changes.
- Workout-planning redesign and persistence feedback.
- Natural-language CREATE / UPDATE / DELETE / MERGE / RESOLVE / LINK transaction engine with strict AI interpreter contract and ZEKE validation.
- Mobile navigation and workflow refinement at 320/375/390/430px without losing v0.47 functionality.

## Evidence boundary
The interaction repair in this package is **coded + source-tested**. It is not yet persistence-tested against the owner's live Google workspace. Remaining items above are **specified** unless a later current artifact records stronger evidence.

## Preserved release contracts
- Generated spreadsheets are reports; canonical records and provenance remain governed by ZEKE's durable data model.
- Medication occurrence history remains part of the longitudinal record and reconciliation workflow.
- Package continuity requires verified functional carry-forward, governance reconciliation, and clean package re-extraction before release promotion.
