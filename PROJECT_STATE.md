# ZEKE Current Project State

**Package:** v0.43.1  
**Build:** 2026.08.17.1  
**Release label:** Mobile Professional Polish  
**Parent candidate:** v0.43.0 RC2.1 · build 2026.08.16.3  
**Last known user-deployed baseline before this package:** v0.43.0 RC2.1 screenshot review

## Current direction

v0.43.1 is a focused mobile-interface implementation pass over the RC2.1 longitudinal runtime. The goal is not feature reduction: existing data, health, calendar, medication, report/export, AI-credential, editing, and coaching infrastructure is retained while mobile task order, responsiveness, and visual polish are corrected.

## Mobile changes now implemented

- Mockup-aligned dark navy/teal/white mobile hierarchy and professional card treatment.
- Balanced five-item bottom navigation; no oversized blue center blob; no duplicate floating ZEKE orb at phone widths.
- Narrower vertical drawer with coherent active-state styling.
- Variation/equipment selection at the top of workout entry before Coach's Eye can depend on it.
- Exact-variation last-session/coaching context.
- Per-set load/reps plus optional per-set effort/RPE and pain.
- Compact progression when there is not enough comparable data to graph.
- Independent variation line series on canonical exercise charts; missing load is omitted rather than treated as zero.
- Fitness period control moved inside the library context it governs.
- Workout header/date/sticky controls corrected to avoid covering content.

## Canonical data boundary

User-owned provider-backed JSON remains canonical. Schedule-derived medication events are explicitly marked assumed. Calendar items remain candidate evidence until confirmed. DEXA is measurement provenance. Generated spreadsheets are reports. AI credentials are system configuration stored in connected user-owned storage and excluded from exports.

## Current blockers outside the completed mobile package-local pass

Six PT/rehab movements still lack verified exact visual media. Final physical-phone acceptance and live Google Drive/Calendar/cross-device behavior remain environment verification. Package-local rendered mobile acceptance currently passes at 320, 375, 390, and 430 px.
