# Release Notes — ZEKE v0.21.0

**Build:** 2026.07.18.2

## User-facing improvements
- Fitness Activity Library tabs: Frequent, Favorites, Strength, Cardio, Mobility, Recovery.
- Frequent activities are ranked using recent use and session count.
- Activity cards are compact by default and expand for recent details and coaching.
- Stair climber is now treated as a cardio activity rather than a standalone top-level section.
- Coach’s Eye is compact by default and expands for evidence, recent sessions, and actions.
- Replaced unclear deeper-analysis language with View full analysis, Ask ZEKE, and Open in Pattern Lab.
- Health adopts a Frequent, Measurements, and Labs library with expandable items.
- Proactive Health insights remain visible while Pattern Lab handles deeper analysis.
- Added local runtime diagnostics export and clearing controls in Settings.

## Continuity and release discipline
- Single runtime version source is exposed through both `ZEKE_VERSION` and `ZEKE_BUILD`.
- Current-state, gate, iteration, release, and audit records identify this release consistently.
- Development errors, release evidence, runtime diagnostics design, rejected paths, and backlog remain separated by purpose.

## Not yet verified live
Google Drive, Calendar, AI providers, and deployed-origin rendering require environment testing.
