# ZEKE v0.43.1 — Current Release Scope

This file is the complete current release contract. It supersedes scattered conversational requirements.

## v0.43.1 mobile acceptance overlay

The current implementation pass is deliberately mobile-only. Preserve every functional requirement below, but phone task order and presentation must also satisfy `DESIGN_AUTHORITY.md`: required variation selection precedes variation-dependent coaching; canonical strength charts show independent exact-variation lines; missing load is omitted rather than plotted as zero; insufficient-data charts collapse to useful compact states; no phone overlay/header obscures content; navigation remains vertical/balanced; and no functionality is removed merely to improve appearance.

## A. Mobile exercise entry

The `+ Log Exercise` page is the authoritative mobile strength/PT entry surface. It must preserve canonical exercise + selected variation; allow selecting or creating a variation; use editable set rows in-place; allow different load/reps per set; make effort/RPE and pain optional per set; provide add/remove set controls; show ZEKE Coach (last relevant workout → suggestion → why); and show a substantial collapsible high-quality Form Guide on the same page. It is not a separate Gym Mode.

## B. Canonical exercises and variations

Canonical exercise tiles aggregate all variations while preserving variation-specific history. Known user mappings include PF independent-arm and PF bilateral/linked-arm bicep curl machines, dumbbell bicep curl, Bowflex bicep curl, PF lat pulldown, and Bowflex lat pulldown. Historical consolidation is reviewable and preserves original entered wording. Shared charts use separate variation series on the same axes. Cross-variation prediction is user-specific learned evidence, never a universal weight conversion.

## C. Coaching context

Recommendations can use exact variation, prior set history, exercise order, muscles already used, effort/RPE, pain, injury/PT context, recovery context, and learned cross-variation relationships. `Why this recommendation?` exposes the important supporting evidence.

## D. PT visual guide gate

Every included PT/rehab movement requires a mechanically correct high-quality visual guide. No misleading “close enough” images. RC1 audit had 8/14 verified; the remaining visual gaps are tracked in `KNOWN_ISSUES.md` and `FORM_GUIDE_MEDIA_LICENSES.md`.

## E. Health measurements and body composition

Mobile `+ Add Body Measurement` must not assume waist. Health → Measurements supports ordinary circumferences plus Body Composition. DEXA is source/method provenance. The schema supports body-fat %, fat mass, lean mass, VAT, ALM index, BMC/BMD, T/Z scores, and regional lean mass, using the August 2026 DEXA report as a seed case while remaining vendor-neutral. Different measurement methods remain distinguishable longitudinally.

## F. Medication occurrence history

Medication definitions/schedules and dated dose occurrences are separate. Every expected tracked dose can have a status such as taken, missed, delayed, partial, unknown, or not-yet-taken. Occurrences record expected/actual date, dose/unit, confirmation status, provenance, and correction history. `assumed from schedule` must never be presented as equivalent to explicit confirmation.

A user correction such as “I missed last Friday” must update the relevant existing assumed occurrence rather than leaving a contradictory assumed-taken record. Changing a future schedule never rewrites past occurrences.

## G. Historical medication reconstruction

For opt-in schedule-assumption tracking, ZEKE creates missing historical expected occurrences from the known schedule start date through today, marks them as assumed, preserves explicit exceptions, and avoids duplicate dates. Manual reviewed backfill remains available. The system must not force the user to enter months of weekly history one row at a time.

## H. Conversational longitudinal reasoning

Questions such as “When did I last have a dose?” are answered from the dated medication occurrence history plus exceptions, with evidence status disclosed. An unfinished write workflow must not monopolize later read-only questions. Product/system feedback must be classified as meta-conversation, not saved as a health event.

## I. Save-state consistency

The interface cannot simultaneously say an item is saved and not saved. Workflow status, canonical storage result, and user-visible confirmation must reflect the same transaction state.

## J. Recent Health Record editing

Appropriate recent health records support View/Edit/Remove. Edits preserve prior values as correction history; removal excludes from future analysis without silently destroying evidence.

## K. Mobile calendar → health reconciliation

This is primarily a mobile interaction requirement. ZEKE can scan up to the prior year of connected calendar items, identify potentially health-relevant candidates, and present a fast first pass: Relevant / Not relevant / Unsure. Only relevant/unsure items become detailed Questions for You. Calendar candidates are deduplicated against the existing health record. Confirmed events are backfilled with calendar-review provenance. Scheduled events are never assumed to have occurred.

Examples include allergy immunotherapy, vaccinations, PT/medical visits, DEXA/body-composition assessments, blood donation, procedures, workouts, and other health-relevant context.

## L. Questions for You

Questions should reduce meaningful uncertainty, not ask for confirmation of obvious interpretations. Calendar reconciliation, unresolved medication schedules, duplicate/import conflicts, and missing clinically relevant details are appropriate. Completed questions update the underlying record and leave the pending queue.

## M. Reports and legacy workbook role

The canonical longitudinal JSON repository is source of truth. `SJN1.xlsx` / connected-health-workbook behavior is legacy migration/reconciliation functionality, not a continuously maintained second database. Settings provides Health Reports & Export, including a generated multi-tab Health Record Workbook and canonical JSON export. Generated spreadsheets are reports, not competing databases. Reports exclude credentials.

## N. AI credentials across devices

AI provider API keys/configuration live in `Project Zeke/system/ai-connections.json` in the connected workspace so they follow the user across devices after storage sign-in. Legacy device-only key storage is migrated and removed. Credentials are never exported into support/health reports or diagnostic logs.

Security note: this alpha model relies on the confidentiality of the user-owned connected storage account and its OAuth authorization. A future hardened release may add a user-managed encryption layer without changing the provider-neutral credential contract.

## O. Responsive/navigation contract

The side menu remains a true vertical navigation drawer on mobile and intermediate widths. No horizontal compressed button strip. Dashboard cards pack upward; controls live inside the card/section they govern; phone pages must not horizontally overflow.

## P. Existing UI/workflow requirements retained

Timeframe controls remain section-owned; Dashboard disclosures remain usable; Favorites is the default useful Fitness view; Review Relationships and Coach evidence destinations must be meaningful; stale notices can be dismissed; Coach’s Eye must perform multi-factor analysis rather than restating cards.

## Q. Package continuity

The package must be sufficient for a new team to resume development without prior chat history. Current architecture, decisions, design authority, release scope, tests, known issues, history, deployment instructions, and provenance are included. Test/release/provenance history stays consolidated rather than proliferating per-version files.

## Release gates

1. Package audit clean.
2. JavaScript/runtime tests pass or explicitly identify external-fixture blocks.
3. Rendered mobile navigation and exercise-entry gates pass without overflow.
4. Medication historical reconstruction/correction regression passes.
5. Meta-conversation and interrupted-workflow regression passes.
6. Calendar retrospective candidate/reconciliation regression passes.
7. AI credential cross-device storage regression passes.
8. Health-report export smoke passes.
9. PT visual guides complete and verified.
10. Physical-phone visual acceptance against `DESIGN_AUTHORITY.md`.
