# ZEKE Architecture — Current v0.22.2 Baseline

**Status:** Supporting current architecture  
**Build:** 2026.07.19.4

This document describes the current architectural baseline. Authority and contradiction resolution remain defined by `00_AI_START_HERE.md`, the Constitution, Project State, and the artifact registry.

## Product boundary
ZEKE is a private, user-owned personal-management system. Health and fitness are the first mature domain, but the core must remain capable of supporting later pet, vehicle, home, finance, and project modules without making Health the universal schema.

## Canonical data and persistence
- Durable personal data belongs in user-owned storage, currently Google Drive for the alpha.
- Browser storage may hold device preferences, temporary navigation context, cached presentation state, and shortened diagnostics, but must not become the unacknowledged canonical health repository.
- Raw observations, imported source material, provenance, and correction history must be preserved.
- Missing values remain unknown rather than being silently carried forward.

## Data flow
1. Capture raw text, structured form input, file import, or connected-source data.
2. Preserve source identity and provenance.
3. Interpret deterministically where possible; use AI only as advisory assistance.
4. Request confirmation when ambiguity or consequential correction exists.
5. Commit canonical records through deterministic code.
6. Rebuild derived views such as tiles, charts, Coach's Eye, and Pattern Lab from canonical records.

## Activity foundation
The current application uses one canonical activity-category registry shared by entry and library views:
- Strength
- Cardio
- Mobility & Stretching
- Rehabilitation/PT
- Recovery
- Sport & Recreation
- Chores & Functional Activity

Each activity has a primary category. Optional attributes may describe secondary characteristics without forcing duplicate activity identities. Examples include endurance, loaded carry, overhead work, balance, or aerobic demand.

Metric presentation is modality-aware. Strength may use sets, reps, resistance, RPE, and pain; cardio may use duration, distance, steps, pace, level, and heart rate; mobility, rehabilitation, recovery, sport, and functional tasks use fields appropriate to their context. Missing fields remain null/unknown and do not fall back to irrelevant units.

## Workout correction architecture
Build 2026.07.19.2 introduced record-scoped editing only:
- one workout record can be corrected;
- the prior record state is preserved in correction history;
- the corrected canonical record drives downstream views;
- derived views refresh after the correction.

Not yet implemented: global rename, duplicate identity merge, bulk recategorization, ambiguous automatic migration, full undo UI, or event-sourced replay. These require a separate data-integrity design and explicit approval.

## Presentation architecture
- Dashboard sections should use independent, content-sized layout rows rather than paired columns that force unrelated heights.
- Empty data must not reserve visualization space.
- Responsive behavior must be verified at arbitrary widths, not inferred solely from named breakpoints.
- Navigation context may be passed temporarily, but generic navigation must clear stale focus.

## AI architecture
- Tier 0: deterministic local rules and analysis.
- Tier 1: manual structured AI packet exchange.
- Tier 2+: optional direct providers through the configured router and privacy controls.
- AI output is proposed interpretation or analysis, never an automatic canonical fact.

## Runtime and governance
The release integrity system registers active runtime files in addition to continuity documents. Historical and unreferenced assets must be inventoried before deletion; no file should be purged merely because a static scan does not immediately show a reference.

## Verification boundary
Local syntax, structural tests, governance checks, checksums, and package reopen can establish package integrity. They cannot establish live Google/AI behavior, deployed-origin rendering, continuous resize behavior, or physical-device accessibility.
