# Iteration Record — v0.26.1

**Status:** Authoritative  
**Build:** 2026.07.22.2  
**Release:** Fitness Navigation & Evidence Hotfix

## User-approved scope

- Preserve the resolved v0.25.2 mobile workout-save path
- Default the Activity Library to Favorites on every fresh application load
- Replace overflowing activity-type chips with the responsive Favorites, Recent, Strength, Cardio, Mobility/PT, Sports, Custom, and All selector
- Add Activity Library search without creating another horizontal control strip
- Keep Dashboard trend and private-summary disclosures open across normal rerenders until the user closes them
- Make Review relationships open activity-specific evidence or a specific data-sufficiency explanation rather than a generic page
- Include workout and sleep values in paired-date relationship screening
- Attach specific research articles and transparent limitations to Coach considerations
- Preserve the v0.26.0 daily-briefing, Health architecture, sleep-record, medication, goal, profile, and reversible-removal improvements

## Reported regressions addressed

- Activity Library could reopen an older persisted category instead of Favorites.
- Activity-type buttons extended beyond the panel and were difficult to navigate.
- Native Dashboard disclosures lost their open state when ZEKE rerendered.
- Activity relationship links routed to a generic Pattern Lab destination without activity-specific findings.
- Coach considerations lacked a useful explanation of the personal trigger and direct research support.

## Implementation

- The Activity Library view now initializes to Favorites and does not restore a stale category from browser storage.
- The chip row was removed and replaced by one responsive selector plus search. The approved view order is preserved.
- Trend and private-health `<details>` state is tracked in memory and restored after rerenders.
- Activity relationship review now names the selected activity, lists recent dated records, reports exact tested relationships when available, and gives a specific minimum-data explanation when unavailable.
- Paired-date screening now includes sleep duration and activity-specific load, repetitions, duration, RPE, pain, and session count.
- Coach evidence modals separate the user-data trigger, ZEKE interpretation, product logic, published research, and limitations.
- Direct links are included for the 2026 ACSM resistance-training overview, the 2009 ACSM progression model, and the 2022 sleep-loss performance meta-analysis.
- The resolved mobile Save Workout handler and form-submit fallback remain unchanged.

## Explicit limits

- Relationship screening remains exploratory and requires at least five paired observations with non-zero variance.
- Correlation does not establish causation, and same-day pairing may miss delayed effects.
- Research is group-level context, not medical clearance or individualized treatment.
- Live Google Drive, Calendar, AI, deployed-cache, protected-workbook, accessibility, and physical-device verification remain environment checks.

## Rollback

Restore v0.26.0 build 2026.07.22.1. No data migration is introduced by this hotfix.
