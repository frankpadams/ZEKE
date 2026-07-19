# ZEKE Feature Status — v0.22.2

**Status:** Supporting current feature inventory  
**Build:** 2026.07.19.3

## Implemented and locally verified
- User-owned Google Drive architecture and reviewed workbook transaction safeguards.
- Unified Talk to ZEKE input and preserved raw-input/provenance principles.
- Dashboard, Health, Fitness, Pattern Lab, Settings, and supporting navigation routes.
- Persistent desktop/tablet/mobile navigation structure.
- Coach's Eye lanes for Now, Next Session, and Patterns.
- Canonical activity-category registry shared by Activity Library and Add Activity.
- Modality-aware activity summaries.
- Health Favorites with separate versioned device preference storage.
- Pattern Lab focus propagation from scoped links and stale-focus clearing on generic navigation.
- Basic record-scoped workout editing with prior-state correction history and derived-view refresh.
- Runtime-file registration in project integrity checks.
- Medication parsing, schedule/status behavior, and connected-workbook regression safeguards inherited from prior verified releases.

## Implemented but requiring deployed or real-device verification
- Arbitrary-width Dashboard and Fitness reflow.
- Mobile bottom navigation and tablet/desktop rail behavior on physical devices.
- Touch target sizing, focus behavior, and screen-reader semantics throughout the current UI.
- Live Google Drive, Calendar, and direct AI-provider flows.
- Cache/service-worker behavior after deployment upgrades.

## Partial or intentionally limited
- Workout History editing: one record at a time only; no global rename, merge, bulk correction, or full undo browser.
- Activity taxonomy migration: current registry exists, but ambiguous legacy records require a reviewed migration path.
- Fitness Insights: compact empty behavior exists; richer evidence-based insight cards remain incomplete.
- Coach's Eye and Pattern Lab: present, but usefulness depends on sufficient real data and continuing validation.
- Runtime diagnostics: shortened local operational logging exists as a design boundary; field usefulness needs real-use feedback.

## Planned near-term
- Deployed-origin responsive and accessibility verification.
- Runtime asset inventory and documented quarantine/removal decisions.
- Activity identity management design: aliases, record-only rename, global rename, merge, and recategorization safeguards.
- Reviewed migration queue for ambiguous historical activity categories.
- Complete Fitness information architecture polish and richer modality-specific charts.
- Full workout correction-history viewing and practical revert/undo design.

## Deferred
- Multi-user/commercial hardening.
- Pets, vehicles, home, finance, and project modules.
- Event-sourced replay architecture unless a demonstrated need justifies its complexity.
