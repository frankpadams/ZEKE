# Iteration Record — v0.22.0

**Status:** Approved for implementation  
**Baseline:** v0.21.0 · build 2026.07.18.2  
**Target build:** 2026.07.18.3  
**Approval:** User explicitly approved the combined scope on 2026-07-18T19:35:08Z.

## Approved scope
- Replace the clunky hamburger-led desktop navigation with a persistent navigation rail.
- Use a mobile bottom navigation with Dashboard, Health, Fitness, Pattern Lab, and More; keep additional modules first-class in the More sheet.
- Make layout behavior fluid at arbitrary widths rather than tuned only to named breakpoints.
- Remove unexplained dashboard whitespace while preserving the currently accepted expanded-tile reflow behavior.
- Restructure Coach's Eye into abbreviated Now, Next Session, and Patterns coaching surfaces.
- Keep full exercise evidence and recommendations authoritative in each activity tile; Coach's Eye links to the relevant tile.
- Make coaching charts compact by default and reserve large evidence views for explicit expansion or Pattern Lab.
- Remove repeated coaching advice inside expanded activity tiles and across coaching surfaces.
- Preserve exercise/context when navigating to activity details, Pattern Lab, or Talk to ZEKE.
- Replace hard-coded personal names with an optional profile-backed preferred name and neutral fallback.
- Update governance, continuity, tests, release notes, and independent-review materials.

## Explicit exclusions
- Canonical user-data migration.
- Live provider credential changes.
- New non-health/fitness modules.
- Automatic recommendations becoming Today's Actions without user agreement.
- Replacing the accepted expanded activity-tile layout behavior.

## Machine-readable approved scope mirror
- Persistent desktop navigation rail and mobile bottom navigation with More overflow
- Fluid arbitrary-width layout and dashboard whitespace correction
- Coach's Eye restructuring into Now, Next Session, and Patterns
- Compact coaching charts and advice deduplication
- Context-preserving coaching navigation
- Profile-backed optional preferred name with neutral fallback
- Continuity, governance, testing, packaging, and independent review brief updates
