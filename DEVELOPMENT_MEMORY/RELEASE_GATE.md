# Release Gate — ZEKE v0.23.1

**Build:** 2026.07.20.1

## Status

**Package verification complete.**

**Environment verification outstanding.** Live Google Drive, Calendar, direct AI providers, service-worker/cache behavior, the protected real-workbook fixture, and physical-device accessibility are not established by local package checks.

## Approved scope

- Make sleep confirmation atomic and save confirmed sleep to structured history
- Add direct sleep logging from the Health Library Sleep tile
- Replace abstract Review Questions with original input, concrete proposal, uncertainty, and explicit actions
- Repair health trend labels, suppress display duplicates, and add duplicate protections for new entries
- Recompose the Dashboard as independent vertical stacks to eliminate cross-row whitespace
- Make Coach’s Eye and insight content concrete, user-friendly, evidence-linked, and actionable
- Make Activity Library graph eligibility and metric labels consistent and explain missing graphs
- Expose the same optional RPE, pain, technique, notes, and injury-context fields during workout creation and editing
- Use one authoritative exercise recommendation across Fitness surfaces
- Move Labs into Health and Pattern Lab under Insights in primary navigation
- Add durable Potential Health Events and include them in AI relationship-analysis context
- Add health-related calendar follow-up prompts only when downstream record use is defined
- Add regression tests and synchronize the full continuity package

## Package evidence
- JavaScript syntax checks.
- Deterministic and structural regression suite.
- Governance audit and negative controls.
- Isolated Chromium rendering and interaction checks.
- Release checksums and reopened-ZIP byte comparison.

## Rollback
Restore the uploaded ZEKE v0.23.0 · build 2026.07.19.5 package. New fields are additive and require no destructive migration.
