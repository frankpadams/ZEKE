# ZEKE v0.22.2

**Build:** 2026.07.19.4  
**Release:** Responsive Stabilization, Activity Foundation, Continuity Reconciliation & Dashboard Acceptance Repair

This is the authoritative full replacement package for ZEKE v0.22.2. Build 2026.07.19.4 preserves the application and continuity work from builds .2 and .3 and makes one narrowly scoped correction: the deployed Dashboard now uses an independent main content stream and Health at a Glance rail so the rail cannot create a large blank vertical gap.

## Implemented application work
- Stabilized Dashboard and Fitness layout structure with independent content-sized rows.
- Added one canonical activity-category registry shared by the Activity Library and Add Activity flow.
- Added **Chores & Functional Activity** as a user-facing category.
- Added modality-aware activity summaries and non-strength metrics.
- Added Health Favorites using a separate versioned preference key.
- Repaired Pattern Lab focus propagation and stale-focus clearing.
- Added basic editing of one workout record at a time, preserving the prior state in correction history and refreshing derived views.
- Extended integrity checks to active runtime files.

## Continuity reconciliation in build 2026.07.19.3
- Rewrote the current Architecture and Feature Status documents so they no longer present v0.5/v0.17 snapshots as the operative design.
- Updated the Backlog with deferred activity-identity operations, taxonomy migration work, deployment verification, asset inventory, and continuity follow-through.
- Added binding decisions for canonical activity categories, primary modality plus attributes, record-scoped editing, and safe legacy migration.
- Added development-error entries for documentation/code audit blind spots, stale screenshot evidence, unverified consultant claims, and incomplete continuity reconciliation.
- Expanded the Handoff Brief, Comprehension Checkpoint, Runtime Diagnostics, Project Health, release gate, release notes, test report, artifact registry, and project state.
- Rebuilt checksums and re-audited the reopened package.

## Important boundaries
The following remain deferred:
- global activity rename across all historical records;
- duplicate activity-identity merge;
- bulk recategorization or silent automatic migration of ambiguous legacy activities;
- a full correction-history browser, global undo, or event-sourced replay architecture;
- deployed-origin and physical-device visual verification;
- live Google Drive, Calendar, and AI-provider verification.

## Deploy
Replace the deployed ZEKE files with the contents of this folder. Preserve the existing values in `zeke-config.js` where appropriate. Hard-refresh once and verify that the header reports **v0.22.2 · build 2026.07.19.4**.

## Continue development
Future AI development must begin with [`00_AI_START_HERE.md`](00_AI_START_HERE.md), not this README. The README is a current overview; it does not authorize edits or override the authority chain.

## Build 2026.07.19.4 dashboard acceptance repair

This replacement build changes only Dashboard composition and its verification. The main Dashboard content is now an independent vertical stream beside a separately sized Health at a Glance rail. A tall health rail can no longer create empty grid rows or push Coach’s Eye, insights, and support cards downward. No activity, health-data, integration, parser, or editing behavior was intentionally changed.
