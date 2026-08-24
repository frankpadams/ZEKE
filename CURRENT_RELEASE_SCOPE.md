# ZEKE v0.46.0 — Current Release Scope

**Runtime build:** 2026.08.24.1  
**Governance revision:** 2026.08.24.2  
**Continuity review:** 2026-08-24  
**Status:** runtime implementation package-local verified; continuity reconciled; environment verification outstanding.

## Release purpose

v0.46.0 is a UX stabilization and connected-knowledge release. It preserves the v0.45.1 longitudinal/adaptive-training foundation while rebuilding the desktop composition and interaction grammar so ZEKE is easier to scan, navigate, understand, and trust.

## Included — UX architecture
- Purpose-driven desktop Dashboard organized around current state, meaningful change, next action, recent activity, and questions/attention rather than component categories.
- Dashboard uses a selective Health snapshot rather than duplicating the Health page.
- Structured Recent Activity feed with stable visual category cues; bounded desktop scrolling is permitted when it improves comprehension.
- Cold-load/page-scroll hardening so content remains reachable and temporary scroll locks are cleaned up.
- Talk to ZEKE explicit closed/compact/expanded behavior with obvious close control and preserved access to the rest of ZEKE.
- Questions for You/duplicate-resolution actions provide immediate persistent selected/working feedback; Edit is separated from answer choices.
- Repeated information, oversized empty states, and narrow narrative-card patterns are reduced.

## Included — Fitness and exercise navigation
- Browse-first Exercise Library with Recent, Favorites, PT/Rehab, body-area/context pathways and optional search.
- Exercise detail shows linked primary/secondary body areas instead of internal “canonical exercise” labeling.
- Body-area views can connect exercises, PT/rehab, anatomy context, recent training, and known injury/symptom context.
- Variation rows are ordered by recency and show their own latest load × reps × sets/date without redundant “Last,” “Current,” or variation-count labels.
- Selecting a variation focuses its detail/history while retaining the parent exercise comparison context.
- Collapsed sparklines provide glance-level trend recognition; detailed exercise charts preserve separate variation series on shared axes, omit missing load, and preserve one-point series.

## Included — connected anatomy/reference knowledge
- Versioned reference knowledge maps relevant exercise/PT/injury concepts to muscles, joints, bones/body regions, clinically useful soft-tissue structures, laterality, and movement patterns.
- Relationships distinguish primary, secondary, stabilizing, direct, and indirect involvement where the knowledge supports that distinction.
- Anatomy links provide navigation/context, not automatic contraindications.
- General reference knowledge remains separate from personal history and clinician/PT facts and carries provenance/version/review metadata with stale detection/refresh governance.

## Included — workout planning
- Recommended workouts are proposals until accepted.
- Normal planning UI leads with the user task, not internal diagnostic-state language.
- Each meaningful recommendation may present a short decision-relevant **Why this** first, with deeper training/clinical/evidence reasoning on demand.
- Active-workout adaptation still preserves completed work and may revise only remaining unsaved work using order/fatigue, pain/RPE, user choices, and explicit restrictions.

## Inherited and preserved from v0.45.1
- Top-level Log plus non-mutating Fitness exploration/planning/training workflow.
- Generic PDF/image intake with embedded-text-first PDF extraction, OCR fallback, source provenance/preview, and review-before-save.
- DEXA structured extraction within generic Body Composition/document intake.
- Illness/injury/context intervals with ongoing/approximate dates.
- Medication reconciliation and dated occurrence semantics.
- Staged Calendar privacy consent.
- Movement-specific PT guide release gate.
- Manual plus connected-AI consultation paths.

## Binding interaction behavior
- Navigation is informational by default; Start/Log/Save/Complete/Correct/Delete are explicit mutations.
- Every consequential user action visibly responds and eventually ends in a truthful state.
- All rendered content remains reachable; first-load and refreshed behavior are distinct test conditions.
- Search is useful but not required for ordinary exercise navigation.
- Visual category cues are stable across Dashboard, Recent Activity, Health/Fitness context, and related detail surfaces.

## Safety / truth boundary
ZEKE is decision support, not diagnosis, prescription, contraindication, or medical clearance. Clinician/PT restrictions outrank AI suggestions. Missing pain/symptom data remains unknown. Source facts, restrictions, AI inferences, reference knowledge, and observed response retain separate provenance/evidence classes.

## Governance reconciliation in revision 2026.08.24.2
The first v0.46.0 package correctly carried much of the runtime scope but did **not** update every standing continuity authority. Governance revision 2026.08.24.2 corrects that documentation drift, adds current-review metadata to all registered authoritative artifacts, updates the current architecture/design/decision/continuity chain, and strengthens `tools/project_audit.py` so the same class of stale-authority package cannot pass silently.

This governance reconciliation does not claim new runtime features beyond build 2026.08.24.1.

## Environment verification outstanding
- owner physical-phone acceptance;
- representative owner desktop hands-on acceptance;
- live Google Drive/Calendar behavior;
- connected-AI provider behavior;
- first real PDF/screenshot/DEXA extraction review in deployment.

## Preserved continuity contracts
- **Generated spreadsheets are reports**, not a second canonical database.
- **Medication occurrence history** remains dated, revision-safe, and distinguishable from schedule-derived assumptions.
- **Package continuity** remains a release requirement: a competent future team must be able to understand and continue the project from the package without prior chat history.
