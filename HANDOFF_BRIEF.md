# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.22.2 · build 2026.07.19.3  
**Release:** Responsive Stabilization, Activity Foundation & Continuity Reconciliation

## Why this build exists
Build 2026.07.19.2 implemented the approved stabilization and activity-foundation work. Build 2026.07.19.3 reconciles the complete active continuity corpus after the user correctly identified that several standing documents still described obsolete releases. Application behavior is unchanged except for the visible build identity.

## Implemented application scope
- Independent content-sized Dashboard/Fitness layout structure.
- Canonical activity categories shared across entry and library views.
- Chores & Functional Activity category.
- Modality-aware activity summaries and detail metrics.
- Health Favorites with a distinct versioned preference key.
- Pattern Lab focus propagation and stale-focus clearing.
- Basic editing of one workout record at a time with correction history and derived-view refresh.
- Integrity coverage for active runtime files.

## Binding design boundaries
- User-owned canonical storage and preserved provenance.
- Raw observations are not silently overwritten or discarded.
- Missing data is unknown; no silent carry-forward.
- AI proposes; deterministic code commits.
- One primary activity category may have secondary attributes.
- Legacy category migration must use deterministic/high-confidence mappings and a review queue for ambiguity.
- Global rename, merge, bulk recategorization, and full undo are not part of the current implementation.

## Highest-priority next work
1. Deployed-origin responsive/accessibility verification.
2. Runtime asset inventory and safe classification before removal.
3. Activity identity and migration design.
4. Complete Fitness information architecture polish.
5. Correction-history viewing and practical revert design.

## Verification limits
Local package integrity does not establish live Google Drive, Calendar, AI-provider, service-worker, arbitrary-width deployed rendering, or physical-device behavior.

## Startup
Read `00_AI_START_HERE.md` and follow its mandatory sequence. Do not infer authorization from this brief.
