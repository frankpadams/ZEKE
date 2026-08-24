# ZEKE Iteration History

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.4 · governance 2026.08.24.5

## Current iteration — ZEKE v0.46.0 — UX Architecture + Connected Anatomy

**Build:** 2026.08.24.3  
**Date:** 2026-08-24  
**Status:** Runtime package-local verification complete; continuity reconciled in governance 2026.08.24.3; environment verification outstanding.

### Approved scope
- Rebuild desktop Dashboard around user priorities rather than component categories
- Fix scroll/lifecycle traps and make all rendered content reachable
- Rebuild Talk to ZEKE close/expand/collapse interaction with predictable state
- Give Questions for You immediate visible feedback after consequential decisions
- Make exercise discovery browse-first with body-area navigation and optional search
- Connect exercises, body areas, injuries/PT context, and versioned anatomy reference knowledge
- Preserve separate exercise-variation histories and compare them on shared axes
- Show a short decision-relevant Why this explanation before deeper workout-planning reasoning
- Keep stable visual identities and compact visual cues across Recent Activity and Dashboard
- Enforce current runtime version identity from one source and prevent stale startup strings

### Implementation summary
- Purpose-driven desktop Dashboard composition and selective Health snapshot.
- Scan-friendly Recent Activity with stable visual category cues.
- Talk to ZEKE close/expand/collapse state model repaired.
- Questions for You decision feedback made immediate and visible.
- Browse-first Fitness library with linked body areas and injury context.
- Versioned anatomy/body-structure knowledge registry added.
- Exercise variations retain independent shared-axis chart series with recency-ordered summaries including load, reps, and sets.
- Workout planning surfaces a short “Why this” before deeper reasoning.
- Runtime version labels now derive from the current build authority.

### Continuity reconciliation
- Re-read and updated every registered authoritative continuity document for v0.46.0.
- Corrected stale current-state declarations inherited from v0.45.1/v0.40/v0.29-era documents.
- Added binding Constitution/Design/Architecture rules for screen-level UX, visible action feedback, reachability, body/anatomy relationships, and governed reference-knowledge updates.
- Strengthened the project audit to require current-release review stamps across the full authoritative set.
- Runtime behavior remains build 2026.08.24.3; documentation/governance revision is 2026.08.24.3.

---


## Current iteration — ZEKE v0.45.0 — Adaptive Training + Mobile-First Recovery

**Build:** 2026.08.23.2  
**Date:** 2026-08-23  
**Status:** Package governance/static verification complete; environment verification outstanding.

### Approved scope
- Reconstruct one complete authoritative package from the last available full build and verified later patch
- Use a coherent mobile-first presentation layer rather than piecemeal responsive patches while preserving functionality and desktop behavior
- Add adaptive PT/rehab, strength, and cardio training intelligence
- Interpret supplied clinical context into source-traceable anatomy, movement/load implications, explicit restrictions, rehab emphasis, confidence, and uncertainty
- Keep clinician restrictions, source facts, AI inference, and observed response distinct
- Support connected AI plus provider-agnostic manual AI consultation packets
- Use actual exercise response to support progression/regression without treating missing pain as pain-free
- Preserve canonical exercise variation histories as independent series on shared charts
- Consolidate current documentation without deleting substantive historical information
- Reconcile the full package against the Constitution and machine-readable governance before promotion

### Verification boundary
Package-local governance/static checks do not prove physical-device usability, live-provider behavior, remote media availability, or clinical effectiveness. Those remain explicit gates.

---


## Current iteration — ZEKE v0.43.1 — Mobile Professional Polish

**Build:** 2026.08.17.1  
**Parent:** ZEKE v0.43.0 RC2.1 · build 2026.08.16.3

**User direction:** focus 100% on the mobile interface; inspect the approved mockups; verify reachable workflows are useful and expected; edit until the result is functional, beautiful, and professional; do not sacrifice functionality.

### Implemented

- Restored approved dark-navy/teal/white mobile visual language and stronger hierarchy.
- Reworked mobile bottom navigation, drawer, dashboard/health cards, Fitness cards, and workout header/sticky controls.
- Promoted exact variation/equipment from optional details to top-of-workout exercise setup before Coach guidance.
- Kept exact-variation history/mechanical identity separate while retaining canonical exercise aggregation.
- Corrected canonical strength charts to independent line series per variation on shared axes and omitted unknown load rather than plotting false zero values.
- Preserved per-set load, reps, optional effort/RPE, and pain in workout save payloads.
- Replaced oversized empty progression states with compact useful messages.
- Added package-local multi-width rendered mobile regression coverage.

### Verification boundary

Package-local mobile browser acceptance can verify geometry, workflow order, controls, chart semantics, and overflow. It cannot substitute for final physical-phone acceptance or live provider behavior. The existing six-item PT visual gate remains open and is not concealed by this focused mobile pass.

---

## Prior RC1 iteration — ZEKE v0.43.0 RC1

**Build:** 2026.08.15.1  
**Status:** implementation/package verification in progress; PT visual completeness and physical-device acceptance remain release blockers.

### Approved scope

- Match approved mobile design references before publish
- Implement + Log Exercise mobile page with variation selector, inline multi-set entry, optional effort/pain, Coach rationale, and high-quality form guide
- Canonicalize exercise families while plotting variations separately on shared axes and preserve original wording
- Provide guided historical exercise consolidation with intelligent reviewable suggestions
- Fix Body Measurement mobile selector and add Body Composition/DEXA-derived fields with source provenance
- Add Recent Health Record edit/remove
- Fix persistent horizontal side-menu regression with vertical responsive drawer
- Consolidate release/test/provenance documentation without losing historical information

### Implementation status

- Mobile `+ Log Exercise` now uses canonical exercise + explicit variation, inline editable sets, optional effort/pain, Coach rationale, and integrated Form Guide.
- Canonical exercise tiles can overlay variation-specific strength series on shared axes.
- Historical exercise identity review includes user-confirmed Planet Fitness, Bowflex, and dumbbell mappings while preserving original text.
- Body Measurement now exposes measurement categories including Body Composition; DEXA is retained as source/method provenance.
- Recent Health Record edit/remove and correction history are wired.
- Mobile/intermediate-width side navigation is explicitly vertical.
- Historical test/release/provenance/iteration artifacts are being retained in consolidated living histories rather than separate per-release files.

### Verification boundary

Package-local automated verification is in progress. Real-device mobile visual acceptance and complete verified visual media for every included PT movement must remain outstanding until actually demonstrated.

---

Living consolidated record of prior implementation iterations. New releases append/edit this file instead of adding another iteration-record document.


## Current release — v0.43.0 RC1

### v0.43.0 RC1
Approved scope includes mobile exercise-page fidelity, canonical exercise/variation architecture, PT visual-guide completeness, measurement/body-composition expansion, Recent Health Record editing, responsive navigation repair, and package/document consolidation.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.2.md`

# Iteration Record — v0.20.2

**Status:** Authoritative release record

## Requested outcome
Build a functional release from the known v0.19.2 baseline with an integrated development-handoff and continuity mechanism. Prevent repeated release, documentation, and whitespace failures.

## Source baseline
`ZEKE-v0.19.2-Dashboard-Correction-FULL(1).zip`

## Implemented
- Replaced dashboard cross-column placement with explicit priority, health, guidance, and support rows.
- Added responsive one-column transitions and content-sized chart/empty states.
- Added cumulative error log, backlog with resurfacing rules, decision log, workflow, project-state JSON, release gate, and handoff entry point.
- Updated README and synchronized release identity.

## Deferred
See `BACKLOG.md`; dashboard customization and saved profiles remain deliberately deferred.

## Verification
Syntax, structural, version-integrity, and final-package audit were performed. Headless Chromium did not complete successfully in this environment, so rendered visual testing and live connected-service testing remain explicitly unverified.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.3.md`

# Iteration Record — v0.20.3

**Status:** Authoritative release record  
**Build:** 2026.07.17.12  
**Release:** Development Gate & Data Compatibility Release

## Approval
The Pre-Development Checkpoint was presented before editing. The user explicitly approved the proposed scope and repository-based medication confirmation preferences at **2026-07-18T02:54:01Z**.

## Prior-conversation continuity review
At the user’s direction, accessible prior ZEKE conversations were reviewed before further implementation. The review reaffirmed Google Drive as the canonical durable repository; local storage as UI/session state only; synchronization as read → normalize → compare → preview → explicit commit → verify with backup and transaction journal; confirmation before committing interpreted alpha entries; no carried-forward observations; patching the existing application rather than restarting it; preservation of Google connection continuity; no GitHub references in the user interface; and delivery as a full replaceable ZIP with visible version verification. Earlier assistant claims were treated as unverified unless corroborated by the package, data, or tests.

## Source baseline
`ZEKE-v0.20.2-Continuity-and-Layout-FULL(1).zip`

## User-data fixture reviewed
`Project Zeke.zip` was treated as read-only. Its repository, source workbooks, recovery records, mirrors, and historical AI artifacts were used to design and test compatibility. No file in that archive was modified or included in this release.

## Approved scope
- Harden the mandatory startup and scope-approval gate.
- Preserve and recognize v0.16.3 exact-cell workbook identities without rewriting recovered data.
- Add a read-only workbook preflight and require the supplied data fixture to reconcile as 188 unchanged observations with zero creates, updates, or conflicts.
- Complete MED-008: distinct statuses, schedule-aware backfill, explicit previews, duplicate protection, canonical identity with original wording retained, null-date safety, and repository-based confirmation preferences.
- Prevent duplicate generated clarification questions while retaining audit history.
- Synchronize documentation, version identity, tests, checksums, and the final package.

## Explicit exclusions
See `DEVELOPMENT_GATE.json`. In particular, this iteration does not rewrite the supplied repository, reconstruct legacy AI evidence links, redesign Fitness, implement dashboard editing, migrate all schemas, or redesign AI-key storage.

## Implemented
- Added a root-level mandatory startup gate and machine-readable authorization state.
- Added backward-compatible exact-cell workbook identity generation and legacy alias support.
- Expanded workbook mapping to cover all 188 verified source observations, including body-fat, laboratory, and two-cell workout evidence.
- Added an independently callable, non-writing preflight in Settings.
- Removed automatic workbook synchronization after conversational saves and corrections.
- Added medication canonical IDs while retaining original labels.
- Distinguished taken, missed, not taken yet, and uncertain mentions.
- Required a known or explicit regimen before range backfill; previewed every proposed date; and avoided implicit daily expansion.
- Stored medication confirmation preferences in the user-owned repository.
- Added null/invalid date display protection.
- Added idempotent generated-question writes.
- Ensured medication Today’s Actions complete only for confirmed administered doses, never missed, not-yet, pending, or uncertain records.
- Added reviewed workbook transactions with an append-only journal, persisted post-commit verification, and archival backup of a previously connected source before replacement.
- Repaired literal control characters that had broken concept word-boundary matching and fallback activity-title formatting.

## Verification
Automated tests passed for medication parsing, medication Today-action completion, generated-question idempotency, structural release identity, workbook preflight, workbook commit and persisted verification, source replacement archival, and real-data no-change idempotency. The actual 258-event fixture remained at 258 events and reconciled all 188 workbook observations unchanged. The dashboard rendered at 1440, 1024, 768, and 390 pixel widths without document-level horizontal overflow. See `TEST_REPORT_v0.20.3.md` and `RELEASE_GATE.md` for exact boundaries. The supplied real-data fixture is not distributed with ZEKE.


## Completion
The release package was reopened into a clean directory and compared with staging. All 223 files matched exactly, all 20 critical SHA-256 checksums passed, and the applicable regression suite passed again from the unzipped package. Live connected-service testing remains a deployment responsibility and is not represented as complete.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.4.md`

# Iteration Record — v0.20.4

## Approved scope
Correct the unsafe interpretation of the broad term “GLP-1” as tirzepatide and replace the handoff approach with a faster, stricter continuity framework that permits fresh review without uncontrolled scope drift.

## Implemented
- Removed GLP-1 class phrases from tirzepatide aliases in deterministic parsing and workbook identity comparison.
- Added explicit clarification when natural language names only the GLP-1 medication class.
- Added a single root startup authority, fast orientation path, comprehension checkpoint, anti-wandering constraints, artifact authority/lifecycle rules, rejected-path record, and required status language.
- Added an executable project consistency/dead-link/unsafe-alias audit.

## Verification status
- Medication parser tests: verified locally.
- Existing automated regression tests: rerun locally.
- Real-data 188-observation no-change regression: required before packaging and recorded in the final test report.
- Live Google Drive, Calendar, and AI-provider behavior: implemented but unverified in this package environment.
- Deployed-origin UI behavior: requires deployment verification; no claim is made beyond tests actually recorded.

## Explicit exclusions
No unrelated dashboard, Fitness, AI-provider, storage architecture, or canonical-data redesign was authorized.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.5.md`

# Iteration Record — v0.20.5

**Build:** 2026.07.18.1

## Approved scope
- Reconcile all active authority and release identity contradictions
- Update the Constitution to the approved unified Talk to ZEKE design
- Make the continuity audit enforce release identity, current scope, artifact authority, package file count, supersessions, and negative controls
- Reduce competing startup paths and clearly classify current, supporting, historical, and superseded artifacts
- Clarify backlog resurfacing prerequisites and preserve inherited application/data behavior
- Run full regression and package reproducibility verification

## Findings addressed
- Constitution §14 conflicted with the approved unified Talk to ZEKE interface.
- Release gate, handoff README, document index, and approval state retained v0.20.3 identity or scope.
- The earlier audit could report zero errors despite those contradictions.
- UI-021 had an ambiguous responsive-verification prerequisite.
- Multiple start files looked authoritative and increased handoff friction.

## Implemented
- One consistent v0.20.5 release identity and authority chain.
- Machine-readable artifact registry and governance invariants.
- Strong audit plus seeded negative-control tests.
- Redirect-only treatment for competing entry documents.
- Concise handoff brief and project health report.

## Exclusions
No product feature, user-data, provider, dashboard customization, Fitness redesign, or schema migration work.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.21.0.md`

# Iteration Record — ZEKE v0.21.0

**Build:** 2026.07.18.2  
**Status:** Implemented; packaged verification pending final report

## Approved scope
- Implement compact expandable activity tiles with granular detail and coaching recommendations
- Convert Coach’s Eye to a compact expandable card with clear actions and evidence language
- Unify cardio activities under the Activity Library instead of a standalone Stair Climber section
- Add Frequent, Favorites, Strength, Cardio, Mobility, and Recovery views
- Apply the same compact library architecture to Health with Frequent, Measurements, and Labs
- Keep proactive page insights while routing deeper analysis to Pattern Lab
- Refine integrated handoff, development continuity, internal consistency, and runtime diagnostics

## Explicit exclusions
- No canonical-data migration.
- No new external provider integration.
- No drag-and-drop dashboard customization.
- No claim of credentialed live-service verification.

## Implementation summary
The Fitness and Health pages now share a compact library-plus-expanded-detail architecture. Cardio is a category, not a Stair Climber-specific section. Coach’s Eye is compact and expandable. Pattern Lab remains the deeper-analysis destination. Runtime diagnostics are retained locally and exportable.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.22.0.md`

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


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.22.1.md`

# Iteration Record — v0.22.1

**Status:** Implementation and package verification complete  
**Baseline:** v0.22.0 · build 2026.07.18.3  
**Target build:** 2026.07.19.1  
**Approval:** User explicitly approved the corrected complete packet on 2026-07-19T00:22:27Z.

## Purpose
Create one authoritative linear continuation that preserves the full v0.22.0 feature release while repairing continuity contradictions before independent review. This is not a feature branch and does not roll back or replace the v0.22.0 application work.

## Approved scope
- Preserve all v0.22.0 navigation, responsive-layout, coaching, context, and profile features unchanged.
- Correct stale release identity and release-status language across current continuity authorities.
- Normalize the artifact registry release/build headers and current versus historical lifecycle states.
- Rewrite Project Health for the current complete baseline and its verification limits.
- Strengthen governance audit and negative controls against stale continuity metadata and contradictory status.
- Update project state, development gate, handoff, release notes, test report, checksums, and independent-review request.
- Keep independent review focused on both the application features and continuity sufficiency.

## Explicit exclusions
- New application features or visual redesign beyond the already delivered v0.22.0 scope.
- Canonical user-data migration.
- Live provider credential changes.
- New non-health/fitness modules.
- Automatic recommendations becoming Today’s Actions without user agreement.
- Replacing the accepted expanded activity-tile layout behavior.

## Result
The v0.22.0 application feature set is preserved. Current continuity authorities now agree on v0.22.1, distinguish complete local/package verification from pending environment verification, and direct the independent reviewer to assess both the features and the packet’s ability to support development without prior conversation context.

## Machine-readable approved scope mirror
- Preserve all v0.22.0 navigation, responsive-layout, coaching, context, and profile features unchanged
- Correct stale release identity and release-status language across current continuity authorities
- Normalize the artifact registry release/build headers and current versus historical lifecycle states
- Rewrite Project Health for the current complete baseline and its verification limits
- Strengthen governance audit and negative controls against stale continuity metadata and contradictory status
- Update project state, development gate, handoff, release notes, test report, checksums, and independent-review request
- Keep independent review focused on both the application features and continuity sufficiency


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.22.2.md`

# Iteration Record — v0.22.2

**Status:** Implementation and local/package verification complete  
**Baseline:** v0.22.1 · build 2026.07.19.1  
**Target build:** 2026.07.19.3  
**Approval:** User explicitly approved the reconciled stabilization-plus-activity-foundation scope on 2026-07-19T02:26:15Z.

## Purpose
Stabilize the responsive interface and continuity tooling while establishing a consistent, modality-aware activity foundation and safe basic editing of individual workout records.

## Approved scope
- Repair and consolidate responsive dashboard and fitness layouts.
- Extend governance coverage to active runtime code and inventory legacy assets without unsafe deletion.
- Repair Pattern Lab context propagation and stale-context clearing.
- Add Health Favorites with separate versioned preference storage.
- Create one canonical activity taxonomy including Chores & Functional Activity.
- Make activity summaries and detail metrics modality-aware.
- Add basic authoritative per-record workout editing with correction history and derived-view refresh.
- Scan active runtime files for hard-coded personal identity and correct verified occurrences.
- Update tests and continuity documents to match only implemented and verified behavior.

## Explicit exclusions
- Global activity rename across all records.
- Merging duplicate activity identities.
- Bulk historical recategorization or automatic ambiguous migration.
- Full undo interface or event-sourced runtime replay.
- Live provider credential changes.
- New non-health/fitness modules.

## Acceptance criteria
- Dashboard and Fitness layouts reflow without paired empty-height coupling at tested widths.
- All Pattern Lab entry points either carry explicit focus or clear stale focus.
- Health and activity favorites use distinct versioned keys.
- Add Activity and Activity Library use the same category registry.
- Non-strength cards do not show irrelevant reps/sets summaries.
- A user can edit one workout record; the original state remains in a correction record and all derived views refresh.
- Active runtime files are covered by release integrity checks.

## Result
The approved stabilization and activity-foundation scope was implemented. Basic workout editing is intentionally record-scoped and uses the existing correction-history mechanism. Global identity operations remain deferred.

## Verification completed
- JavaScript syntax checks for active runtime modules.
- Existing medication, navigation/coaching/profile, factor-idempotency, release-structure, workbook commit/verify, and source-backup regressions where environment-independent.
- New activity-foundation structural regression.
- Governance audit and negative controls.
- Fresh ZIP reopen, checksum verification, and repeated project audit.

## Environment-dependent verification outstanding
- Live Google Drive, Calendar, and AI providers.
- Real-device mobile and deployed-origin arbitrary-width visual inspection.

## Post-delivery continuity reconciliation — build 2026.07.19.3
After the user asked whether all continuity documents had been updated, review showed that several standing documents still described obsolete releases. The user explicitly requested a full correction, including README and related documents, on 2026-07-19T02:35:49Z.

The reconciliation reviewed and updated the active README, Architecture, Feature Status, Handoff Brief, Backlog, Decision Log, Development Error Log, Comprehension Checkpoint, Runtime Diagnostics, Project Health, Project State, development/release gates, artifact registry, release notes, test report, checksums, and runtime build identity. No new application feature was introduced. The final package was rebuilt and re-verified as build 2026.07.19.3.

## Dashboard acceptance repair — build 2026.07.19.4

The user rejected the deployed v0.22.2 Dashboard because the health rail still created a large blank region in the main content flow. Scope was frozen to this single issue. The repair separates the Dashboard into an independent main stream and Health at a Glance rail, adds a focused structural regression test, refreshes cache-busting identifiers, and updates only continuity records affected by this failed acceptance test. No additional product feature was added.

Approved scope: Repair the deployed Dashboard blank-space defect by separating the main content flow from the Health at a Glance rail without changing other application behavior


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.23.0.md`

# Iteration Record — ZEKE v0.23.0

**Build:** 2026.07.19.5

## Approved scope

- Record-specific Recent Health Record review/edit routing.
- Conversation-state isolation so stale correction flows cannot capture unrelated later messages.
- Natural handling of affirmative replies to active ZEKE questions.
- Transcript date separators and timestamps.
- First trusted AI background-consultation contract and fixed safe outcome allowlist.
- System-wide content-driven responsive layout principle, including a fluid Health at a Glance rail.

## Governing decisions

1. External AI output is untrusted and may advise but never execute.
2. No imported content may grant itself permissions or override ZEKE policy.
3. Independent page sections size from their own content and may not create cross-column vertical gaps.
4. Record review/edit controls must retain the selected record identity through the full edit transaction.
5. Pending interaction state must be scoped and safely superseded by clearly unrelated user input.

## Verification

See `TEST_REPORT_v0.23.0.md`.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.23.1.md`

# Iteration Record — ZEKE v0.23.1

**Build:** 2026.07.20.1  
**Status:** Implementation complete; package verification in progress  
**Approved:** 2026-07-20T05:55:29Z

## Baseline

- Uploaded authoritative package: ZEKE v0.23.0 · build 2026.07.19.5.
- User supplied deployed screenshots and direct acceptance feedback.
- The baseline continuity audit exposed stale release authorities; reconciliation is included in this release.

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

## Explicit exclusions

- Global activity rename, merge, or legacy taxonomy migration beyond existing behavior.
- Paid AI-provider changes or canonical-storage architecture changes.
- Automatic clinical conclusions, diagnoses, treatment recommendations, or inferred appointment completion.
- Silent deletion of historical source observations.

## Implementation summary

- Pending confirmations now route before general parsing. Confirmed sleep saves once, reports the saved destination, and supports undo.
- Sleep is a first-class event with a Health Library tile, structured + Log form, wake-date history, duration, quality, interruptions, notes, and provenance.
- Review Questions display the original source, proposed record/action, uncertainty, and explicit Answer now/Later/I don’t know/Dismiss paths.
- Health metric tiles describe change over the selected period rather than mislabeling change as reference-range status. Display duplicates are suppressed without deleting source history.
- Dashboard cards are arranged in independent vertical stacks. Fitness uses one recommendation engine and consistent graph descriptors.
- Workout creation and editing expose equivalent optional effort, pain, technique, notes, and injury/PT fields.
- Insights and Coach’s Eye use concrete, actionable language. Calendar follow-ups state their downstream use and do not treat scheduled events as proof.
- Potential Health Events are durable, auditable context included in direct and manual AI relationship-analysis packets.
- Labs is a Health subview and Pattern Lab is an Insights subview.

## Verification record

See `../TEST_REPORT_v0.23.1.md` and `RELEASE_GATE.md`. Environment-dependent behavior remains separately identified.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.24.0.md`

# Iteration Record — ZEKE v0.24.0

**Build:** 2026.07.21.1  
**Release:** Trust, Conversation & Workflow

## User-approved scope

- Implement a durable ZEKE workflow engine that coordinates Talk to ZEKE, review, AI, editors, audit, and unresolved interactions
- Give every meaningful conversation an explicit saved, not saved, duplicate, dismissed, waiting, completed, or failed outcome
- Replace Questions for You and Past Decisions with Conversation Memory: Waiting for You and Things I’ve Learned
- Rebuild each review item around original information, ZEKE’s understanding, proposed action, why it matters, what ZEKE will do, and explicit choices
- Add a context-specific medication schedule editor and improve natural weekly or daily schedule handling
- Route supported Talk to ZEKE attachments through the existing safeguarded import workflow
- Add the multi-tab Support & Improvement Report under Settings → Diagnostics & Exports with privacy controls
- Separate and connect technical, unresolved-interaction, AI, correction, UX-feedback, audit, and workflow diagnostics
- Correct Pattern Lab wording so direction does not imply that improving values increased
- Reduce wasted space in Fitness chart-period, Coach’s Eye, insight, and history composition
- Document the authoritative static runtime, no-build-step architecture, and legacy artifact boundary
- Add regression tests and synchronize the full continuity and handoff package

## Implementation summary

- Added `assets/workflow-engine.js` with durable transaction state, terminal outcomes, metrics, privacy-filtered export, and minimized local persistence.
- Mirrored full workflow state and unresolved-interaction diagnostics into the user-owned ZEKE repository.
- Added visible Talk to ZEKE workflow status, common pending-state restoration, a Resume action, and instrumentation for save, correction, duplicate, defer, ignore, question, AI, and failure paths.
- Added Conversation Memory tabs, editable/removable learned context, a narrative review workspace, and Later behavior that preserves questions while moving them behind newer work.
- Added a medication schedule editor with frequency, weekday, dose, unit, start date, and notes.
- Routed XLSX, XLS, JSON, CSV, and TSV attachments through the standard import workflow.
- Added the Support & Improvement Report workbook and retained-log controls under Settings.
- Added direction-neutral pattern language and denser Fitness layout rules.
- Corrected factor idempotency so an existing clarification question can be resolved or updated without being mistaken for a duplicate.
- Reconciled architecture, release, handoff, governance, backlog, and historical-artifact documentation.
- Added a rendered interaction-contract audit across major desktop routes, key open editors, and the mobile Dashboard; repaired inert metric controls, duplicate review control IDs, and unlabeled icon controls found by that audit.
- Made Support Report privacy, date-range, and clear-after selections durable across deferred background renders.

## Explicit exclusions

- New paid AI providers or changes to the free-first router policy.
- Destructive migration or deletion of user health history.
- Automatic diagnoses, clinical conclusions, or treatment decisions.
- Global activity rename/merge and legacy taxonomy migration.
- Removal of historical hashed bundles without a separate cleanup review.

## Acceptance criteria

- Active interactions have a durable workflow ID, a visible result state, and an actionable resume path for common restored pending states.
- A workflow can be mirrored to the user repository without leaving personal source text in browser-local persistence.
- Conversation Memory exposes unresolved and learned context with edit/remove paths.
- Review items show source, understanding, proposal, purpose, downstream action, and choices.
- Medication schedule wording such as weekly on Fridays is safely converted or opens a focused editor.
- Supported Talk attachments enter the same import safeguards as Settings.
- Settings exports all named Support & Improvement Report tabs and excludes credentials.
- Pattern wording accurately describes same-direction or opposite-direction movement.
- All syntax, structural, governance, regression, packaging, and reopened-ZIP checks pass or are precisely reported.

## Rollback

Restore ZEKE v0.23.1 · build 2026.07.20.1. The new workflow records are additive factors and do not require destructive migration.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.25.0.md`

Lifecycle: historical

# Iteration Record — v0.25.0
**Build:** 2026.07.21.2

## Authority
Baseline: v0.24.0 build 2026.07.21.1. The user explicitly approved one integrated build using the uploaded continuity package and both preceding design conversations.

## Approved scope
- Integrated dashboard/mobile continuity.
- Activity-specific workout display.
- Fast gym entry and repeat workflow.
- Provider/PT presentation.
- Cautious evidence-backed considerations.
- Progressive identity and clinical context.
- Revision of existing continuity documents.

## Implemented
- Activity-specific Fitness fields and history columns.
- Gym Logging and Repeat Last Workout prefill.
- Provider View for PT, primary care, and orthopedic contexts.
- Consideration terminology and uncertainty framing.
- Progressive profile separation of identity and clinical context.
- Documentation and continuity synchronization.

## Excluded
- Shared browser-exposed AI secrets.
- Full multi-account authentication and production beta infrastructure.
- Diagnosis, treatment recommendations, or causal claims.

## Verification boundary
Local syntax, governance, deterministic regressions, and packaging are required. Physical-device, live-provider, print/PDF, real-workbook, and multi-account behavior remain environment verification.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.25.1.md`

# Iteration Record — ZEKE v0.25.1

Build: 2026.07.21.3

## Purpose
Correct visible regressions introduced in v0.25.0 and restore trust, hierarchy, and clarity.

## Approved changes
- Remove Provider View until it has a distinct, validated use case.
- Keep Dashboard as the single health overview.
- Add medications and diagnoses/conditions in privacy-collapsed Dashboard sections.
- Default Fitness to Favorites, with a transparent most-used fallback.
- Replace generic evidence navigation and internal identifiers with contextual evidence review.
- Rename activity-definition actions to “Create activity type.”
- Correct active version and cache references.

## Data impact
No destructive migration. Existing records and activity favorites remain intact.

- Restore regressed v0.24 visual and trust behavior
- Remove Provider View until a distinct use case exists
- Make evidence links contextual and specific
- Clarify Create activity type wording
- Add privacy-collapsed medications and diagnoses to Dashboard
- Correct visible versioning


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.25.2.md`

# Iteration Record — v0.25.2

Focused corrective patch after the user reported that Save Workout was unresponsive on mobile in v0.25.0.

Changes are limited to making the structured gym-workout save path responsive, observable, and compatible across mobile browsers. No claim of physical-device validation is made.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.26.0.md`

# Iteration Record — v0.26.0

**Status:** Authoritative  
**Build:** 2026.07.22.1  
**Approved:** 2026-07-22T04:51:14Z

## Baseline

- Working code baseline: v0.25.2 Mobile Workout Save Hotfix.
- Regression references: v0.23.0 and v0.24.0.
- The v0.25.2 mobile save repair is protected and was not rolled back.

## Approved scope (machine-auditable wording)

- Preserve the resolved mobile workout-save issue
- Restore a compact, organized Dashboard with less white space
- Implement the approved daily-briefing Dashboard hierarchy
- Make Coach's Eye actionable and Trends & Analysis descriptive
- Consolidate health subdomains under Health and move Discover into navigation
- Keep Questions for You conversational
- Ensure sleep saved through Talk to ZEKE appears in Recent Health Record
- Use pull-down sleep times and mobile-safe form sizing
- Show only activity-relevant Fitness fields and separate stair steps, ambulatory steps, and distance
- Add reversible record removal and focused incomplete-workout review
- Default Fitness to Favorites and repair activity detail navigation
- Add explicit medication dose confirmation and reviewed historical-dose backfill
- Provide visible medication schedule save outcomes
- Add provider-backed goals with bounded optional AI review
- Move the user profile to portable provider-backed preferences
- Preserve focused evidence detail and remove duplicate Provider View behavior
- Update the existing Constitution and all continuity authorities rather than creating a parallel constitution

## Approved scope and outcome

| Concern | Outcome in v0.26.0 |
|---|---|
| Mobile workout Save failure | Preserved the verified v0.25.2 direct-click path, submit fallback, status, and error handling. |
| Sparse/disorganized Dashboard and excess white space | Replaced shared-height composition with Health at a Glance, a compact three-card briefing row, and full-width Trends. |
| Sleep understood in Talk but absent from Recent Health Record | Unified semantic sleep filtering and wake-date fields; rendered smoke confirms sleep is visible and searchable. |
| Sleep-time entry felt wonky | Added hour/minute/AM-PM selectors and sleep-specific edit controls. |
| Duplicate records could not be removed | Added audit-preserving reversible Remove for Health and Fitness history. |
| Dead/inactive activity detail affordance | Activity cards now open focused details through mouse/keyboard-compatible controls. |
| Fitness opened on Frequent instead of Favorites | Favorites is the initial view, with a clearly explained most-used fallback. |
| “+ Add activity” was ambiguous | Renamed to “+ Create activity type.” |
| Activity columns were irrelevant by type | Added profile-specific capture, charts, detail, and history; stair/walking/distance fields remain distinct. |
| Evidence review became generic | Restored concrete observation, limitation, dated-record, action, Pattern Lab, and PubMed-topic detail. |
| Provider View duplicated Dashboard | No active Provider View remains. |
| Medication schedule save lacked clear response | Added visible schedule save feedback and fixed the undefined-label path. |
| Need to confirm taken doses | Added Taken today, Missed today, and Not taken yet outcomes; only confirmed taken completes the action. |
| Need to enter many past medication doses | Added date-range daily/weekly preview, duplicate skipping, batch provenance, and undo path. |
| Need goal setting and optional guidance | Added provider-backed goals with deterministic review and optional non-committing AI advisory review. |
| Profile should travel with user storage | Moved active profile to provider preferences with legacy local-profile migration/removal. |
| Modal fields could be overwritten by delayed renders | Limited render snapshot restoration to controls inside the replaced app root. |
| Constitution/design continuity | Edited the existing Constitution and reconciled all current authority documents; no parallel constitution. |

## Explicit exclusions

- No destructive migration.
- No generic app launcher or copied dynamic membership QR.
- No session-based mobile Fitness redesign before user-approved mockups.
- No claim of physical-device, live provider, protected workbook, or deployed cache verification.
- No shared beta secrets or multi-account security claims.

## Acceptance criteria

- Dashboard uses the approved Health → three-card briefing row → full-width Trends flow.
- Coach’s Eye has no descriptive Patterns lane.
- Health owns symptoms, sleep, medications, labs, measurements, nutrition, and conditions.
- Sleep records share wake-date fields and appear in Recent Health Record.
- Strength and stair-cardio history do not show irrelevant universal columns.
- The mobile direct Save Workout handler and form-submit fallback remain present.
- Questions for You is the visible language.
- Medication completion requires an explicit taken event.
- Batch medication backfill previews and skips existing dates.
- Goals and profile use provider-backed storage.
- Active identity and governance documents agree.

## Package verification

- JavaScript syntax checks passed.
- Fifteen package-local JavaScript regression files passed.
- Two protected real-workbook tests were intentionally skipped because `ZEKE_TEST_DATA_ROOT` was not supplied.
- Rendered Chromium workflow smoke passed across Dashboard, Fitness, Health, Questions, Discover, and mobile Dashboard.
- Support-report browser smoke passed.
- Project audit and governance negative controls passed.
- Final ZIP reopen, checksum verification, and byte comparison are required before release completion and are recorded in the final test report.

## Rollback

Restore v0.25.2 build 2026.07.21.4. v0.26 adds no destructive data migration.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.26.1.md`

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


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.27.0.md`

# Iteration Record — v0.27.0

**Status:** Authoritative  
**Build:** 2026.07.22.3  
**Release:** Gym Entry Mockup Fidelity

## User-approved scope

- Rebuild directly from the untouched v0.26.1 ZIP and follow the established package and continuity process.
- Treat the approved Gym Entry mockup as the specification rather than an invitation to redesign.
- Use the full available window width for Gym Entry Mode.
- Allow vertical scrolling where needed and prevent horizontal page scrolling.
- Preserve the approved Today's Workout and Exercise Workspace hierarchy.
- Use adult-only, fully clothed guide imagery; when imagery is not matched to the user, represent diverse adult backgrounds.
- Preserve prior resolved workout-save behavior and unrelated v0.26.1 functionality.

## Implementation

- Replaced the constrained workout-entry modal with a dedicated full-window Gym Entry Mode.
- Added responsive Today's Workout and Exercise Workspace rendering.
- Added set-by-set strength entry, completion toggles, Add Set, and Copy Set 1 to all.
- Kept Coach's Eye, Progression, Last Workout, Today's Entry, notes, and Form Guide visually separate.
- Added an edge-to-edge Form Guide bottom sheet.
- Added explicit narrow-width rules down to 370 CSS pixels with `overflow-x:hidden` in the Gym workspace.
- Displays an honest “Guide image under review” state rather than unreviewed or incorrectly licensed imagery.

## Continuity correction

The immediately preceding failed release attempts are not authoritative baselines. This iteration returns to the established process documented in `DEVELOPMENT_WORKFLOW.md`: clean prior-release baseline, approved scope only, continuity updates in existing locations, ZIP reopen, and explicit verification levels.

## Explicit limits

- The approved mockup image itself was not embedded into this source package; fidelity was implemented from the approved interaction and layout requirements recorded in project continuity.
- The complete curated exercise-image library is not yet present.
- Physical-device visual comparison, live storage, Calendar, AI, deployed service-worker cache, and protected workbook checks remain environment verification.

## Rollback

Restore v0.26.1 build 2026.07.22.2. No data migration is introduced.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.27.2.md`

# Iteration Record — v0.27.2

**Runtime build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1

The approved mockup is the specification. The exercise screen must not retain or display the workout exercise list above the active exercise. The right-hand mockup represents the same exercise screen dimmed beneath a Form Guide bottom sheet. No alternative workflow or redesign is permitted until the faithful implementation is reviewed by the user.

## Governance-only approved scope — July 25, 2026

- Reconcile authoritative governance documentation without changing runtime behavior
- Preserve v0.27.2 as the recovery baseline and reject v0.28.x as a forward baseline
- Record provider-neutral storage, editable dates, multi-segment sleep, Gym Mode, AI-vault, and release-integrity decisions

No runtime source, style, route, or persistence behavior is changed by this governance reconciliation.

Release metadata rule: untouched ZIP entries preserve their original bytes and timestamps; genuinely changed and new entries receive the actual local package-generation timestamp.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.28.0.md`

# Iteration Record — v0.28.0

## User requirements implemented

- Reusable routines such as Chest Day, Push Day, and injury-aware programs.
- Core program facts stored by ZEKE; AI remains advisory for generation and adaptation.
- Blank is not zero.
- No assumed completion or automatic save from merely opening/exiting Gym Mode.
- Backend writes use the established connected repository and event ledger.
- Existing file and directory structure retained.
- Unchanged files retain their original modification times; changed and new files use their real creation/modification times.

## Data placement

- Custom programs: connected preferences repository under workout_programs (schema version 1).
- Confirmed exercise performance: workout event records.
- Finished session summary: workout_session event record.
- In-progress workout draft: session-only browser state; not a durable personal record and discarded by Cancel Workout.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.28.1.md`

# Iteration Record — v0.28.1

**Build:** 2026.07.23.0418

## Authorization

The user explicitly asked to add the previously omitted licensed photos and exercise-specific Form Guide content to the v0.28.0 package, and reiterated the standing requirement to preserve structure and honest modification dates.

## Approved scope

- Add licensed photographs to the existing exercise Form Guide bottom sheet
- Add useful exercise-specific Setup, Movement, Common Mistakes, and Tips content
- Preserve the v0.28.0 workout-program and backend data-storage behavior
- Maintain the existing file and directory structure
- Preserve original modification timestamps for unchanged files and use real modification timestamps for changed or new files
- Represent unavailable or unmatched guide content honestly rather than fabricating completeness

## Implemented

- Added 17 reviewed exercise-specific guide records in `assets/exercise-guides.js`.
- Added target muscles, equipment, level, Setup, Movement, Common Mistakes, Tips, and a clear safety boundary.
- Added licensed/public-domain photography with visible creator, source, and license links.
- Replaced the generic placeholder with a data-driven tabbed bottom sheet.
- Added an explicit photo-unavailable state and a truthful unmatched-exercise fallback.
- Kept the v0.28.0 workout-program and backend save routes unchanged.
- Preserved the existing package layout.

## Media boundary

Photos are loaded at runtime from Wikimedia Commons rather than embedded in the ZIP. This release does not claim offline photo availability. Written guide content remains local.

## Data placement unchanged from v0.28.0

- Custom programs: connected preferences repository under `workout_programs`.
- Confirmed exercise performance: workout event records.
- Finished session summary: `workout_session` event record.
- In-progress workout draft: session-only browser state.
- Blank fields: null/unknown, never silently coerced to zero.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.29.0.md`

# Iteration Record — v0.29.0

**Runtime build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2  
**Source baseline:** ZEKE v0.27.2 governance-reconciled recovery baseline  
**Continuity reconciliation:** Runtime unchanged; documentation reconciled after the application build.

## User-approved runtime scope

The v0.29.0 runtime was created after the user requested the discussed Gym Mode and trusted-entry changes be implemented from v0.27.2. The implementation includes mobile Gym Mode recovery, explicit entry states, editable workout date, routine/manual/custom exercise start, primary-field prefill, optional blank fields, qualitative readiness, in-Gym history, truthful save language, and local unfinished-entry recovery.

## Approved continuity-reconciliation scope

- Reconcile every current-authority and standing continuity document to the actual v0.29.0 runtime and its evidence boundaries
- Preserve every runtime, style, route, data, and test file byte-for-byte with its original v0.29.0 ZIP timestamp
- Add the missing v0.29.0 iteration record, test report, continuity matrix, and current package provenance
- Classify partial and unimplemented requirements honestly rather than treating governance decisions as completed features

## Explicit exclusions

- No application runtime, CSS, route, data-layer, parser, AI-router, service-worker, or test code changes
- No new Gym Mode behavior or visual fixes
- No live-provider, physical-device, protected-workbook, or credentialed AI verification
- No secure AI-vault or additional storage-provider implementation

## Runtime implementation summary

Implemented in source: mobile-focused Gym Mode, date selection, routine/manual/custom exercise start, exercise reordering, last-entry prefill, blank optional fields, per-set entry, strength/cardio field differentiation, qualitative gauge and written readiness, unsaved progression application, Gym-contained history, local draft recovery, storage-save status, and Form Guide fallback.

Known implementation gaps: research-reviewed readiness rules, actual image-sequence expansion, full media review coverage, provider-backed routine management, provider-neutral storage adapters, cross-domain editable dates, multi-segment sleep, separate desktop Workout Entry, secure AI credential vault, and physical/deployed acceptance.

## Verification boundary

This continuity package verifies documentation coherence, runtime byte preservation, package integrity, and named package-local tests. It does not convert unrun environment checks into verified behavior.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.30.0.md`

# Iteration Record — ZEKE v0.30.0

**Build:** 2026.07.26.1

## Objective

Implement the approved friendly mobile workout-entry interface and related logging/conditions functionality without breaking desktop ZEKE.

## Runtime changes

See `RELEASE_NOTES_v0.30.0.md`.

## Governance decisions carried forward

- Provider-agnostic durable storage; one primary provider at a time.
- Local browser storage may cache unfinished forms but is not authoritative.
- Routines are templates, not historical workout records.
- All entry screens expose an editable effective date.
- Mobile workout entry is a responsive Fitness workflow, not a disconnected subsystem.
- No false saved/synced states.
- Form Guide media must truthfully depict the exercise and preserve licensing data.

## Verification limits

Physical phone rendering and remote-image delivery were not available in the build environment.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.40.0.md`

# ZEKE v0.40.0 Iteration Record

**Build:** 2026.08.03.1

## Approved scope

- Repair authoritative JSON integrity issues
- Implement the approved lighter dashboard direction with truthful visualizations
- Apply mobile improvements across the whole app
- Expand activity/exercise knowledge, form guides, routines, and weekly planning
- Clean repository structure and strengthen deployment verification

The user explicitly requested one coordinated major release and said “now go for it.”

## Implementation summary

- Added deterministic integrity scanning and a guided real-world Repair Center.
- Added backup-first approved repairs, audit history, supersession/quarantine, duplicate-write prevention, and session undo.
- Added medication-schedule question reconciliation and duplicate-question consolidation.
- Rebuilt dashboard composition toward the approved lighter mockup; unsupported visual claims collapse to honest text states.
- Applied responsive navigation, quick entry, sticky actions, clear exits, and coaching/guide access across the mobile app.
- Added 101 equipment-aware knowledge objects, 12 routines, weekly workout expectation planning, activity-specific fields, technique notes, injury context, and mind-muscle cues.
- Added unified build/cache tokens, current runtime registry, manifests, provenance, and rendered tests.

## Evidence boundaries

Automated evidence covers package structure, deterministic logic, fixture-based repair detection, JS regressions, and rendered Chromium workflows. It does not prove live Google Drive behavior, physical-device acceptance, remote-media availability, or clinical validity. User approval remains required for every live-data repair.

## Generated at

2026-08-02T21:10:00-04:00


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.40.4.md`

# Iteration Record — ZEKE v0.40.4

**Build:** 2026.08.06.4  
**Status:** Package verification complete; environment verification outstanding.

## Approved scope

- Consolidate historical release notes into one canonical living document while preserving audit snapshots
- Create and reconcile the canonical current documentation set
- Make the package self-describing for an unfamiliar future development team
- Reconcile runtime package identity and cache metadata after Sprint 3
- Preserve honest verification boundaries and prepare Sprint 5 release-candidate hardening

## Implemented

- Consolidated release history and archived historical snapshots.
- Created current canonical project-state, roadmap, known-issues, changelog, decision-index, pre/post review, documentation map, and handoff records.
- Reconciled visible runtime identity, cache token, service-worker identity, project state, development gate, governance rules, registry, and release records.
- Updated metadata-only regressions to validate current identity semantically rather than pinning obsolete v0.40.0/v0.40.2 strings.

## Verification boundary

No broad new end-user functionality is claimed. Live Google Drive, physical devices, and remote media remain environment verification.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.40.5.md`

# Iteration Record — ZEKE v0.40.5 RC1

**Build:** 2026.08.06.5
**Status:** Package verified; user/environment acceptance outstanding.

## Approved scope

- Run all applicable JavaScript, Python, governance, package-structure, and rendered-browser checks.
- Classify each failure as regression, obsolete expectation, missing external fixture, or environment-dependent acceptance.
- Verify mobile and desktop information density, unified input priority, modal behavior, activity entry, custom schemas, PT/recovery logging, recommendation preferences, and save-result language.
- Reconcile service-worker/runtime manifest and package provenance.
- Produce a clearly labeled release candidate, not a final release, until user acceptance.

## Completed

- Reconciled three obsolete regression expectations with the current adaptive-activity and unified-input architecture.
- Fixed an accessibility defect by adding accessible names to activity-entry close controls.
- Added bounded timeouts and current workflow coverage to the rendered workflow test.
- Verified 18 package-local JavaScript suites; three real-data suites remain fixture-dependent.
- Verified governance negative controls, project audit, rendered desktop/mobile workflows, v0.40 rendered milestone, and support-report export.
- Preserved explicit boundaries for live Google Drive and physical-device acceptance.

## Rollback

Restore the complete v0.40.4 Sprint 4 package. No personal-record migration is introduced.


---

## Historical source: `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.41.0.md`

# Iteration Record — ZEKE v0.41.0 RC1

**Build:** 2026.08.07.1  
**Parent runtime:** v0.40.5 · build 2026.08.06.5  
**Approval:** user explicitly approved the plan and said “Time to get coding.”

## Approved scope

- Implement exact exercise family/variation/equipment/load-basis identity with non-destructive historical review.
- Expand PT/rehab exercise support, readable abbreviation expansion, separate ER/IR logging, and form-guide recognition help.
- Put explainable progressive-overload targets and evidence access directly in workout logging, using RPE/RIR and pain/PT safeguards.
- Redesign Discover around meaningful findings and suppress trivial/tiny-sample/shared-time-trend pattern noise.
- Reorient Trends & Analysis toward current state and comparable recent momentum rather than repeated lifetime milestones.
- Move Dashboard timeframe selectors into the sections they actually control and decouple Dashboard from Fitness range state.
- Make Today compact and genuinely action-oriented without duplicating pending questions.
- Replace technical duplicate-record review with a side-by-side plain-language decision workflow.
- Add medication-specific adherence modes including opt-in schedule-assumed doses with explicit assumption provenance and correction paths.

## Implementation notes

- Runtime code was changed only after continuity/governance docs were reviewed and the accepted scope was recorded in `PRE_IMPLEMENTATION_REVIEW.md`.
- The user-provided `events (3).json` is read-only reference material and is not part of the release package or migration target.
- Historical exercise repair adds reviewed identity metadata via the normal correction path; it does not replace the original exercise wording.
- New PT guides do not substitute unrelated imagery when verified movement media is absent.

## Verification boundary

Package-local checks can verify syntax, structure, deterministic UI wiring, governance continuity, and rendered smoke behavior where browser tooling is available. Live Google Drive, physical-device behavior, remote media, and clinical appropriateness still require environment/user acceptance.

## Current iteration — ZEKE v0.43.0 RC2.1 — Longitudinal Integrity & Sync / Continuity Reconciliation

**Build:** 2026.08.16.3  
**Approval:** User explicitly approved the expanded release work and said “proceed on production now.”

## Approved scope

- Match approved mobile design references before publish
- Implement + Log Exercise mobile page with variation selector, inline multi-set entry, optional effort/pain, Coach rationale, and high-quality form guide
- Canonicalize exercise families while plotting variations separately on shared axes and preserve original wording
- Provide guided historical exercise consolidation with intelligent reviewable suggestions
- Fix Body Measurement mobile selector and add Body Composition/DEXA-derived fields with source provenance
- Add Recent Health Record edit/remove
- Fix persistent horizontal side-menu regression with vertical responsive drawer
- Consolidate release/test/provenance documentation without losing historical information
- Maintain dated medication dose occurrence history with assumed/confirmed provenance, retroactive correction, and historical reconstruction
- Fix conversational workflow interruption, last-dose reasoning, save-state integrity, and meta-conversation exclusion from health data
- Add mobile past-year calendar candidate screening with Relevant / Not relevant / Unsure, dedupe, confirmation, and health-record backfill
- Replace misleading live-workbook positioning with Health Reports & Export while retaining legacy workbook migration/reconciliation
- Sync AI provider credentials through the connected user-owned workspace across devices and migrate legacy local-only keys
- Make the package self-describing with current architecture, release scope, design authority, known limitations, tests, and handoff continuity

## Implementation status

Runtime implementation is in progress and the package remains an RC. Current work adds dated medication occurrence reconstruction/correction, interruption-safe conversation reasoning, mobile calendar reconciliation, generated health reports, connected-workspace AI credential sync, and self-describing design authority. PT visual completeness, physical-phone acceptance, and live connected-data verification remain promotion gates.

### RC2.1 continuity reconciliation

- Added the missing living `RELEASE_NOTES.md`.
- Reconciled historic/standing documents with the implemented medication occurrence, mobile calendar review, Health Reports & Export, and connected-workspace AI-key behavior.
- Marked historical Gym Mode descriptions as superseded architecture rather than deleting historical evidence.
- Reaffirmed package-alone handoff as a promotion criterion.


## v0.45.1 · build 2026.08.23.4 — Integrated Fitness + Adaptive Training

**Approved:** 2026-08-23. User requested the pre-release audit findings be fixed and a polished real release be produced for hands-on use.

### Approved scope
- Deliver one complete, self-contained ZEKE release reconstructed from the last full v0.43.1 package plus verified subsequent work
- Use a coherent mobile-first presentation layer while preserving desktop behavior and shared canonical data/workflows
- Keep Log as a distinct top-level action while Fitness supports non-mutating exploration, planning, performance, coaching, and review
- Make workout recommendations editable before Start and transfer accepted proposals into the active workout
- Adapt remaining workout work from completed exercise order, pain/RPE, fatigue context, clinical constraints, and user choices
- Use location and remembered equipment profiles such as Planet Fitness and home gym when planning workouts
- Preserve canonical exercise families with independent variation series and unknown load as unknown
- Require truthful movement-specific two-frame visual guides for included PT/rehab exercises
- Provide source-first PDF and screenshot ingestion with embedded text before OCR, classification, provenance, review, and explicit confirmation before structured save
- Support DEXA within the general body-composition and document-ingestion architecture rather than as a required standalone system
- Represent illness, injury, and contextual events as dated or time-bounded records with ongoing and approximate-range support
- Provide medication reconciliation for active/stopped status, possible aliases/duplicates, schedule, and adherence semantics
- Keep Google access separate from permission to create/use a ZEKE calendar and preserve granular sensitive-category privacy choices
- Consolidate Dashboard observations into one changing Insights surface instead of fixed artificial insight-type cards
- Preserve clinical source facts, clinician/PT restrictions, AI inference, and observed exercise response as distinct evidence classes
- Support connected AI and a provider-agnostic manual AI consultation fallback
- Reconcile the complete package against the Constitution, living documentation, machine-readable governance, and regression tests before release

### Implementation summary
- Complete reconstructed v0.45.1 package with portable runtime architecture
- Top-level Log plus non-mutating Fitness exploration/planning/training workflow
- Editable adaptive workout proposals transferred into active workout entry
- Live adapt-remaining-workout planning using saved work, order, pain/RPE, fatigue, and clinical constraints
- Remembered equipment/location profiles for Planet Fitness and home environments
- Movement-specific verified two-frame schematic PT guides for all included rehab entries
- Generic PDF/image intake with embedded-text-first PDF extraction, OCR fallback, source hash/provenance, preview, AI/manual extraction, and review-before-save
- DEXA structured extraction path inside generic document intake
- Illness/injury/context interval entry with ongoing and approximate dates
- Medication reconciliation surface with alias grouping, status, schedule, and adherence mode
- Staged calendar connection/creation consent and per-category ask/always/never privacy preferences
- Single Dashboard Insights surface and Fitness-specific pattern filtering
- Canonical exercise variation histories and charts retained
- Manual and connected-AI clinical/workout consultation retained

### Verification boundary
- Package-local regression/governance/syntax/media checks must pass before packaging.
- Physical-device and live-provider validation remain environment verification and may not be claimed without execution.
