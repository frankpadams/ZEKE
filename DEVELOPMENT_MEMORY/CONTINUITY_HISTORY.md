# ZEKE Continuity & Reconciliation History

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.2 · governance 2026.08.24.3

## 2026-08-24 — v0.46.0 continuity reconciliation, governance 2026.08.24.2

### Trigger
A post-package review found that the first v0.46.0 ZIP contained current runtime/tests and some updated release documents, but several standing authorities still described v0.45.1/v0.40/v0.29-era state. `tools/project_audit.py` passed because it checked only a subset of current identity-bearing documents and did not require a per-authority current-review record.

### Documents re-read and reconciled
The reconciliation re-read the Constitution, authority/lifecycle rules, governance rules, project state, development gate, release gate, Design Authority, Architecture, root and cumulative Decision Logs, Iteration History, Continuity History, Backlog, Development Workflow, Development Error Log, Roadmap, Test Guide/Report, Package History, Artifact Registry, Project Identity, Project Health, Status Language, Runtime Diagnostics, Comprehension Checkpoint, README/deploy guidance, Documentation Map, and current release notes/scope. Historical sections remain historical; current declarations were corrected.

### Durable corrections
- Current runtime identity remains v0.46.0 build 2026.08.24.2; governance revision advances to 2026.08.24.2.
- v0.46 UX/design/anatomy decisions are encoded in the Constitution, Design Authority, Architecture, decision logs, scope, roadmap, tests, and continuity state.
- `PROJECT_STATE.json`, Project Identity/Health, README/deploy guidance, Status Language, and Runtime Diagnostics no longer advertise obsolete releases as current.
- Artifact Registry records a release-specific review stamp for every authoritative document.
- `project_audit.py` now fails if any registered authoritative artifact lacks the exact current release/build/governance review stamp or if the standing supporting continuity set is stale.
- Release-gate language distinguishes runtime build 2026.08.24.2, governance revision 2026.08.24.3, package-local evidence, and still-outstanding environment verification.

### Prevention rule
A release cannot claim “Constitution/governance/current-authority reconciliation” merely because version strings agree in a small identity subset. Every registered authoritative artifact must be explicitly reviewed for the current release, and every standing supporting continuity document that declares current state must also be reviewed.


Consolidated continuity/governance reconciliation history.


---

## Historical source: `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.22.2.md`

# Continuity Reconciliation — v0.22.2 build 2026.07.19.3

**Status:** Supporting release record

## Trigger
The user asked whether every development-continuity document had been updated. Review established that only the primary state/gate documents had been changed in the first v0.22.2 package, while several standing documents remained stale.

## Documents reviewed and updated
- README.md
- ARCHITECTURE.md
- FEATURE_STATUS.md
- HANDOFF_BRIEF.md
- DEVELOPMENT_MEMORY/BACKLOG.md
- DEVELOPMENT_MEMORY/DECISION_LOG.md
- DEVELOPMENT_MEMORY/DEVELOPMENT_ERROR_LOG.md
- DEVELOPMENT_MEMORY/PROJECT_STATE.json
- DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json
- DEVELOPMENT_MEMORY/RELEASE_GATE.md
- DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.22.2.md
- DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json
- DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json
- DEVELOPMENT_SYSTEM/PROJECT_HEALTH.md
- DEVELOPMENT_SYSTEM/COMPREHENSION_CHECKPOINT.md
- DEVELOPMENT_SYSTEM/RUNTIME_DIAGNOSTICS.md
- RELEASE_NOTES_v0.22.2.md
- TEST_REPORT_v0.22.2.md
- VERSION.txt, version.js, and index.html build identity

Redirect-only entry files were reviewed and correctly retained unchanged. Historical release records were not rewritten.

## Result
The current active continuity corpus now describes the implemented v0.22.2 activity foundation, its verification boundaries, and the deferred identity/migration work. The release package was rebuilt with fresh checksums and reopened for verification.


---

## Historical source: `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.29.0.md`

# Continuity Reconciliation — v0.29.0

**Runtime build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2  
**Status:** Supporting reconciliation record. Runtime unchanged.

## Finding

The first v0.29.0 runtime package contained current application files but stale or contradictory continuity documents. Only `PROJECT_STATE.json` had been partially changed, and it still pointed to the v0.27.2 iteration. The package therefore was a runtime candidate, not a continuity-complete authoritative master.

## Modified current documents

- `README.md`
- `00_AI_START_HERE.md`
- `HANDOFF_BRIEF.md`
- `ARCHITECTURE.md`
- `FEATURE_STATUS.md`
- `VERSION.txt`
- `README_DEPLOY.md`
- `TEST_REPORT.md` (converted to a current redirect)
- `RELEASE_NOTES_v0.29.0.md`
- `ZEKE_CONSTITUTION.md` (current baseline/status language only)
- `DEVELOPMENT_MEMORY/PROJECT_STATE.json`
- `DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json`
- `DEVELOPMENT_MEMORY/RELEASE_GATE.md`
- `DEVELOPMENT_MEMORY/BACKLOG.md`
- `DEVELOPMENT_MEMORY/DECISION_LOG.md`
- `DEVELOPMENT_MEMORY/DEVELOPMENT_ERROR_LOG.md`
- `DEVELOPMENT_MEMORY/GOVERNANCE_RECONCILIATION_2026-07-25.md` (historical-context note)
- `DEVELOPMENT_SYSTEM/PROJECT_IDENTITY.md`
- `DEVELOPMENT_SYSTEM/PROJECT_HEALTH.md`
- `DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json`
- `DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json`
- `DEVELOPMENT_SYSTEM/STATUS_LANGUAGE.md`
- `DEVELOPMENT_SYSTEM/AUTHORITY_AND_LIFECYCLE.md`
- `DEVELOPMENT_SYSTEM/COMPREHENSION_CHECKPOINT.md`
- `DEVELOPMENT_SYSTEM/REJECTED_AND_SUPERSEDED_PATHS.md`
- `DEVELOPMENT_SYSTEM/RUNTIME_DIAGNOSTICS.md`

## Added current documents

- `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.29.0.md`
- `TEST_REPORT_v0.29.0.md`
- `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.29.0.md`
- `PACKAGE_VERIFICATION_v0.29.0-CONTINUITY.json`
- `PACKAGE_PROVENANCE_v0.29.0-CONTINUITY.json`

## Reviewed unchanged

- Active runtime and test files were reviewed as the source-package baseline and preserved byte-for-byte.
- `DEVELOPMENT_MEMORY/DEVELOPMENT_WORKFLOW.md` remains authoritative and version-neutral.
- `HISTORICAL_ARTIFACTS_NOTE.md` remains accurate.
- Superseded entry-point redirects remain accurate.
- Historical versioned release notes, test reports, patch notes, and iteration records remain historical and were not rewritten.
- `GOVERNANCE_PACKAGE_PROVENANCE_2026-07-25.json` and the original v0.29.0 package manifests remain historical package evidence.

## Result

v0.29.0 is now the current runtime and forward-development baseline. v0.27.2 remains the recovery source, and v0.28.x remains rejected. The runtime remains subject to the environment-verification limits in the current test and release-gate documents.


---

## Historical source: `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.42.0.md`

# Continuity Reconciliation — v0.42.0

This file is the active consolidation of decisions through 2026-08-11. Earlier iteration records remain historical evidence; where they conflict with this document plus the Constitution, the newer explicit decision governs.

## Implemented/foundation in v0.42.0
- Unified longitudinal timeline/schema helpers with provenance and non-causal relationship proposals.
- Dashboard 14-day Timeline Snapshot based only on actual records.
- Retrospective date-range parsing for repeated daily assertions and medication-adherence reconciliation requests.
- Vaccination, allergy immunotherapy, and blood-donation/context event recognition.
- Deterministic-first ingestion/classification contract for DEXA, patient-portal screenshots, labs, medication lists, imaging, vaccinations, and immunotherapy.
- Source-specific clinical range/threshold metadata contract.
- Two-stage Google Calendar privacy policy plus per-event/category sync policy.
- Constitution additions for truthful visualization and generalized rather than anecdote-specific logic.

## Existing v0.41.0 work retained
- Exact exercise variation/equipment/load-basis model and historical reclassification.
- Variation-specific progression and evidence-aware next-session targets.
- Exercise order preservation and workout reordering.
- PT naming/ER-IR separation and form-guide truthfulness.
- Medication-specific adherence modes and assumed-dose provenance.
- Duplicate review, Discover cleanup, Trends recent-window emphasis, dashboard/local timeframe ownership.
- Questions for You, unified Talk to ZEKE, responsive/mobile and integrity foundations.

## Active product requirements carried forward
- Coach's Eye must be visually and semantically distinct from exercise tiles; show multiple meaningful prioritized coaching briefs when warranted, each with rationale, evidence/context, action, and uncertainty. Never pad with weak items.
- Body Area lens should connect injury/symptom/PT/exercise/imaging/context history and eventually provide a truthful body-status visualization.
- Full Timeline/Calendar should combine ZEKE events with connected Google Calendar while keeping Google non-canonical.
- DEXA import entry points: Talk to ZEKE, Health > Body Composition, and Documents/Knowledge Inbox; all route to one review-before-commit workflow.
- Patient-portal screenshots are first-class ingestion inputs; distinguish portal chrome from clinical content and support multi-image/partial/overlap cases.
- Medication reconciliation should periodically offer alias/duplicate review, active/discontinued/new medication review, schedule confirmation, and adherence-mode choice.
- DOB and height are explicit editable profile fields; calculate historical age from DOB rather than storing a static age.
- Context/exposure events are optional, privacy-sensitive, and available to analysis only when user permits. Sexual activity remains internal-only by default.
- Calendar sync: routine meds remain off by default; sensitive categories ask each time or never; show exact proposed calendar title/details before consent.
- Visual communication should expand through real-data timelines, range bars, body diagrams, comparisons, and annotations, never invented analytics.
- Continue responsive top-packing/no unexplained vertical holes, mobile vertical navigation where needed, Activity Library Favorites default, expand/collapse stability, local timeframe placement, and useful evidence drill-down links.

## Generalized coaching rule
User anecdotes are regression scenarios, not special product logic. ZEKE may compare tolerated and poorly tolerated activities/exposures using general attributes (timing, duration, load, movement/body area, order, context, symptoms/outcomes), but temporal association remains distinct from causation.

## App-pattern influences retained
- Fitbod: adaptive split/time/equipment/variety/preference ideas and transparent workout rationale.
- Lyfta/exercise libraries: stronger exercise identity, muscle/body context, and form/reference material.
- Strong/Setgraph: low-friction logging, order/editing, exercise history and progression views.
- ZOZOFIT/body-composition tools: longitudinal/regional comparison concepts, generalized to DEXA and other body-composition sources.
- Patient portals: import rather than retype, but with ZEKE provenance/review safeguards.

## Verification boundary
Package-local tests establish only package-local behavior. They do not prove live Google Drive/Calendar writes, remote AI/vision availability, physical-device rendering, or clinical validity. User acceptance after deployment remains required.


---

## Historical source: `DEVELOPMENT_MEMORY/GOVERNANCE_RECONCILIATION_2026-07-25.md`

> **Current-status note (2026.07.25.2):** This document accurately records the July 25 decisions and the then-current v0.27.2 recovery baseline. ZEKE v0.29.0 is now the current runtime built from that baseline. Use `PROJECT_STATE.json`, `FEATURE_STATUS.md`, and `ITERATION_RECORD_v0.29.0.md` for present implementation status.

# Governance Reconciliation — July 25, 2026

**Status:** Authoritative  
**Runtime baseline:** ZEKE v0.27.2 · build 2026.07.22.2319  
**Governance revision:** 2026.07.25.1  
**Runtime changes:** None

## Purpose

This document records the user-approved decisions reached after the independent Gym Mode audit and subsequent clarification. It exists to prevent future iterations from losing context or reintroducing rejected assumptions.

## Baseline and branch authority

- v0.27.2 is the authoritative recovery baseline.
- The approved Gym Mode mockup is a locked specification.
- v0.28.x is rejected as a forward-development baseline.
- v0.28.x may be reviewed only as failure evidence or for individually re-evaluated backend concepts.

## Storage and persistence

- Storage is provider-agnostic. Google Drive is first, not permanent.
- One active primary provider is used at a time.
- Confirmed records, corrections, routines, and durable preferences belong with the active provider.
- Normal-browser local storage may protect unfinished forms only.
- Local recovery is not canonical and never affects history or analysis.
- Incognito may run ZEKE, but unsaved recovery is not guaranteed.
- Saved means the provider acknowledged the write. Do not simulate a separate sync stage.

## Cross-domain entry rules

- Effective date is visible and editable anywhere data is entered or corrected.
- Event time and record time remain distinct.
- Blank is not zero.
- Suggested is not confirmed.
- In progress is not saved.
- Corrections preserve provenance.

## Sleep

- Multiple sleep chunks may belong to one sleep day.
- Each segment retains actual start/end timestamps.
- Total sleep sums segments and excludes gaps.
- Overnight sleep defaults to the final-awakening date, which remains editable.

## Fitness and Gym Mode

- Workout history is adequately grouped by day and exercise; named sessions are not required.
- Routine names are template labels only and need not appear as historical workout units.
- Users can add, remove, skip, edit, and reorder routine exercises.
- Custom exercises are allowed.
- Gym Mode is primarily for phone use while at the gym.
- Desktop ZEKE keeps its full experience and receives a separate spacious Workout Entry.
- Tablets are supported responsively but are secondary to phone and desktop.
- Add Exercise shows commonly performed exercises first and adds one at a time; library search is available below.
- Exercise order may be rearranged but does not imply performance order.
- Cardio intensity may be blank, a single value, or a range.
- End Workout closes the active entry context but does not prevent later same-day exercise entries.
- Removing a saved exercise requires confirmation.

## Exercise screen

- Coach’s Eye includes a written evidence-based category.
- A numberless speedometer-style gauge may show rough qualitative readiness.
- Progression includes a sparkline and trend statement.
- Last Time uses a condensed summary when sets are uniform and a clear set-by-set layout when they differ.
- Primary set fields are prefilled from the most recent confirmed exercise entry.
- Each set’s weight is editable; initial values may propagate only to untouched blank set fields.
- Optional pain, RPE, rest, and notes live in an expandable section and begin blank.
- Apply Recommended Progression updates the unsaved form only and can be undone.
- Cancel and Save remain at the end of the form rather than fixed over the viewport.
- After provider-confirmed save, briefly show Saved and return to Today’s Workout.
- History opens full-screen inside Gym Mode on phones and returns to the same exercise.

## Form Guide

- The bottom sheet occupies roughly 75–80% of the phone screen.
- Setup, Movement, Common Mistakes, and Tips are vertically stacked.
- One verified instructional image is shown initially.
- Tapping it opens an expanded movement sequence.
- The image must actually show the named exercise being performed.

## Readiness and progression

- Use evidence-based categories, not a numeric percentage.
- The methodology is versioned and considers comparable confirmed sessions, consistency, performance, effort when available, recency, goals, and restrictions.
- Pain is optional. Missing pain is not zero pain.
- When evidence is insufficient, say so and do not show Apply Recommended Progression.

## AI connections

- AI credentials are stored in an encrypted vault with the active storage provider.
- A short PIN requires a narrowly scoped, rate-limited security service.
- That service stores no health records, workouts, AI conversations, or plaintext provider credentials.
- Decrypted credentials exist only in browser memory.
- Recovery code may reset the PIN; loss of both recovery code and PIN permits destructive vault reset and re-entry of provider keys.
- AI-vault recovery is unrelated to Gym Mode recovery.

## Release and development integrity

- Preserve existing internal application structure.
- Use one clearly named top-level extraction folder.
- Preserve unchanged bytes and timestamps exactly.
- Use actual modification times for changed/new files.
- Publish hashes and provenance.
- Do not use “verified” beyond the exact tests performed.
- Test phone and desktop as separate protected experiences.

## Current continuity reconciliation — v0.43.0 RC2.1

**Build:** 2026.08.16.3

Historical text below may describe previously approved architectures, including a separate “Gym Mode,” workbook-first storage, or device-local AI keys. Those passages are retained as historical evidence only. They do **not** override the current authorities.

Current superseding rules:

- Mobile exercise entry is the normal `+ Log Exercise` page; no separate Gym Mode.
- The approved exercise-page composition is canonical exercise + explicit variation + inline sets + optional effort/pain + Coach rationale + integrated Form Guide.
- Calendar candidate review is a mobile-first interaction, with shared candidate/provenance infrastructure beneath it.
- Medication history includes dated occurrences distinct from schedule definitions; reconstructed occurrences preserve assumed/confirmed provenance and remain editable.
- Canonical longitudinal records, not the legacy workbook, drive analysis and generated reports.
- AI keys persist via connected user-owned storage across devices; device-local persistence is legacy/noncanonical.
- The release package itself is the handoff unit and must remain sufficient to resume work.
