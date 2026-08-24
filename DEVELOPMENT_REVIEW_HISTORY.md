# ZEKE Consolidated Development Review History

## v0.46.0 · build 2026.08.24.3 · governance 2026.08.24.3 — continuity reconciliation review

A post-build review found that runtime and feature documentation had advanced to v0.46.0, while several standing current authorities still carried earlier release identities or lacked the new UX/anatomy decisions. This was a governance defect, not a new runtime feature implementation.

Corrective review covered the complete registered authoritative set plus current supporting continuity documents. The authority chain now records the v0.46.0 Dashboard/composition model, visible action feedback, Talk window state, browse-first exercise library, linked body-area/injury/PT navigation, versioned anatomy knowledge, variation chart semantics, short “Why this” explanation pattern, and rendered UX release gate. The release audit was hardened so this class of drift fails automatically.

Environment verification remains outstanding and is not promoted by this reconciliation.

---

Consolidated sprint, pre/post implementation, and independent-review history. Distinct architectural decisions remain in DECISION_LOG/ADRs.


---

## 2026-08-17 — v0.43.1 mobile workflow and visual-fidelity review

**Build:** 2026.08.17.1

Reviewed the live screenshot failures against the package-local approved mobile design authority and the July 26 mockup. Corrected task ordering, chart semantics, responsive geometry, and visual hierarchy rather than treating the pass as superficial CSS. Key findings were: variation-dependent coaching appeared before variation selection; missing load could become false zero points; canonical variation history was visually connected as one series; single-point progression wasted space; phone header/date layers could obscure content; and mobile navigation/branding had drifted from the mockup. The current implementation addresses those issues while retaining all existing functional surfaces.

Package-local rendered verification now covers 320–430 px phone widths and the key direct/batch workout paths. Physical-phone and live-provider verification are still not claimed.

---

## 2026-08-17 — RC2.1 continuity and authority review

**Build:** 2026.08.16.3

Reviewed current standing documents against the implemented RC2 runtime and the owner’s latest decisions. Findings and actions:

- Found the canonical set named a living `RELEASE_NOTES.md` that was absent; created it.
- Confirmed medication occurrence code supports schedule-derived assumed events, explicit confirmation, last-dose lookup, and retroactive correction. Historical reconstruction remains provenance-sensitive rather than treating inferred doses as observed facts.
- Clarified calendar scope: the retrospective candidate-review **UI is mobile-specific**; the candidate-event/deduplication/provenance model is shared infrastructure.
- Confirmed the legacy connected workbook must no longer be presented as a continuously authoritative health record; generated Reports & Export are the human-readable output path while migration reconciliation remains available.
- Confirmed connected-workspace API credential persistence is the current cross-device requirement; ordinary browser-local persistence is not authoritative.
- Reviewed historical Gym Mode language. Historical records remain intact for traceability, but current authorities explicitly mark Gym Mode as superseded by ordinary mobile `+ Log Exercise` / workout entry.
- Reaffirmed that a future development team must be able to determine current state, binding decisions, design targets, test status, limitations, and next work from the package alone.

No live-provider or physical-phone verification is claimed by this documentation reconciliation.

---


## Historical source: `INDEPENDENT_AI_REVIEW_REQUEST_v0.22.0.md`

# Independent AI Review Request — ZEKE v0.22.0

Review the entire packet as though no prior conversation exists. Begin with `00_AI_START_HERE.md`; do not edit code.

Evaluate:
1. Whether a new AI can accurately identify authority, current state, approved/rejected paths, unresolved work, and verification limits from the packet alone.
2. Whether navigation is coherent across persistent desktop rail, compact tablet rail, and mobile bottom navigation/More overflow while modules remain first-class peers.
3. Whether the fluid layout avoids breakpoint-only assumptions and unexplained dashboard whitespace.
4. Whether Coach’s Eye clearly separates Now, Next Session, and Patterns without duplicating the authoritative activity-tile recommendation.
5. Whether context is preserved when opening activity details, Pattern Lab, and Talk to ZEKE.
6. Whether personal identity is profile-backed and no user name is hard-coded in active application code or fixtures.
7. Whether release claims match implemented code and stated verification evidence.

Return: verified strengths, defects, contradictions, risks, missing tests, and the smallest recommended next scope. Distinguish verified facts from hypotheses.


---

## Historical source: `INDEPENDENT_AI_REVIEW_REQUEST_v0.22.1.md`

# Independent AI Review Request — ZEKE v0.22.1

Review the entire packet as though no prior conversation exists. Begin with `00_AI_START_HERE.md`; do not edit code. Treat this as the single linear successor to v0.22.0, not a separate documentation branch.

## Review both dimensions
### A. Preserved application work
1. Persistent desktop/tablet navigation and mobile bottom-navigation/More behavior while modules remain first-class peers.
2. Fluid arbitrary-width behavior and dashboard whitespace handling.
3. Coach’s Eye separation into Now, Next Session, and Patterns.
4. Abbreviated exercise coaching versus authoritative full activity-tile detail.
5. Compact default charts and semantic advice deduplication.
6. Context preservation among Coach’s Eye, activity details, Pattern Lab, and Talk to ZEKE.
7. Profile-backed optional preferred name and absence of hard-coded user identity.

### B. Continuity and governance
1. Whether a new AI can identify authority, current state, approved/rejected paths, unresolved work, and verification limits from this packet alone.
2. Whether all current authorities agree on v0.22.1 and build 2026.07.19.1.
3. Whether historical v0.22.0 feature evidence is retained without being mistaken for the current iteration.
4. Whether package-complete versus environment-unverified claims are precise and noncontradictory.
5. Whether the development plan will force findings, approval, implementation, verification, and updated handoff in the next iteration.

Return verified strengths, defects, contradictions, risks, missing tests, and the smallest recommended next scope. Distinguish verified facts from hypotheses. The findings should feed the next linear iteration.


---

## Historical source: `POST_RELEASE_REVIEW.md`

# Package Review — ZEKE v0.41.0 RC1

**Build:** 2026.08.07.1  
**Parent deployed runtime:** v0.40.5 · 2026.08.06.5  
**Status:** package verified; not yet user-deployed/accepted

## What changed

The approved iteration focused on making ZEKE more useful at the moment of action and less dependent on internal/technical concepts:

- Exercise records distinguish movement family from exact variation/equipment/load basis.
- Old workout names can be reviewed non-destructively rather than silently rewritten.
- PT exercises use readable names plus familiar abbreviations, support distinct ER/IR logging, and expose richer rehab fields/form-guide help.
- Workout logging includes explainable exact-variation progressive-overload guidance and evidence access.
- Discover surfaces screened findings directly; Pattern Lab is secondary.
- Trends emphasizes current/recent momentum; Dashboard ranges live with the sections they control.
- Today, duplicate review, and medication adherence workflows were simplified around the user's actual decision/action.

## Verification completed

- Syntax and v0.41 structural checks passed.
- Rendered desktop/mobile workflow smoke passed without page errors or tested control/overflow defects.
- Support-report browser smoke passed.
- Governance negative controls passed.
- Broader JavaScript suite results are fully classified in `TEST_REPORT_v0.41.0.md`; no protected-fixture or obsolete historical assertion is represented as a pass.

## Verification still required after deployment

- Live Google Drive authentication plus durable write/readback.
- Physical mobile interaction acceptance.
- Real-history review of exact exercise variations and progressive-overload recommendations.
- User acceptance of revised Discover/Trends, duplicate review, Today, and medication adherence behavior.
- Remote exercise-media availability/fidelity in the deployed environment.

## Continuity instruction

Future work begins at `00_AI_START_HERE.md`. v0.41.0 RC1 is the current package candidate; v0.40.5 remains the rollback/deployed reference until the user verifies v0.41.0 in the live environment.


---

## Historical source: `PRE_IMPLEMENTATION_REVIEW.md`

# Pre-Implementation Review — v0.41.0 Fitness Intelligence & Clarity

**Baseline:** v0.40.5 · build 2026.08.06.5, successfully opened by the user on the live GitHub Pages deployment and connected to Google.

## Governance and continuity reviewed

Before runtime edits, the current Constitution, Project State, Architecture, Feature Status, Decision Log, Known Issues, Roadmap, post-release review, documentation map, development error log, and backlog were reviewed. The v0.40.5 readable static runtime remains the code baseline.

## User-approved scope

1. **Exercise identity and equipment variations** — model broad exercise/movement families separately from exact equipment-specific variations. Progression and load comparisons must stay variation-specific. Store equipment and load basis where known.
2. **Historical record review** — scan existing workout records and propose identity metadata without replacing original exercise wording or provenance. High-confidence proposals may be batch-reviewed; ambiguous records remain unspecified until the user decides.
3. **PT/rehab expansion** — add common shoulder/PT entries reflected in the user’s PT sheet. Display understandable names first and therapist shorthand in parentheses. ER and IR remain separate exercises even when a paper program groups them. Support sets/reps, holds, side, resistance/band, pain/response, and appropriate rehab fields.
4. **Form guides** — make identification help prominent for PT exercises. Use start/end media only when verified/available; otherwise provide setup, movement, common mistakes, aliases, and safe context. Do not imply a generic form guide supersedes clinician instructions.
5. **Progressive-overload planner** — surface a next-session target directly in the workout logger: exact variation, load/reps/sets target, last relevant performance, concise reason, and evidence link where applicable. Use RPE/RIR when available; suppress aggressive progression with pain, injury/PT context, insufficient data, or a long gap.
6. **Discover** — show actual meaningful discoveries first. Remove duplicated Questions card, suppress empty buckets, integrate Pattern Lab as an advanced drill-down rather than a peer product, attach research to relevant findings, and filter mathematically strong but conceptually weak patterns.
7. **Trends & Analysis** — default to current state and recent change/momentum; compare recent windows, identify plateau/reversal/acceleration when supported, and keep lifetime milestones as secondary context.
8. **Dashboard range controls** — remove the detached top-level range selector and place controls in the section(s) they actually affect. Dashboard range state must not silently change Fitness chart range.
9. **Today** — keep the Dashboard area but make it compact and action-oriented; recurring schedules are one input rather than the feature definition. Do not duplicate pending questions there.
10. **Questions for You duplicate review** — show both potentially duplicate records in plain language with date/time, values, and source; use direct decisions such as Same event / Separate events / Edit / Not sure / Later. Hide technical metadata behind optional detail.
11. **Medication adherence assumption** — allow medication-specific opt-in tracking that assumes a confirmed scheduled dose was taken unless the user reports otherwise. Assumed records must remain explicitly distinguishable from user-confirmed doses and correctable.

## Safety / data rules

- Do not modify the uploaded `events (3).json`; it is read-only reference data.
- Preserve raw observations, original exercise names, provenance, and reversible correction history.
- Do not infer equipment for ambiguous historical records merely from convenience or gym context; leave unspecified when evidence is insufficient.
- Do not equate machine, dumbbell, barbell, Bowflex, band, cable, or bodyweight loads.
- Research may support a recommendation but must not be mislabeled as exercise-specific when only general resistance-training evidence exists.
- Clinician/PT instructions take precedence over generic progression guidance.
- No live-provider, physical-device, remote-media, or clinical-validity claim may be marked verified unless that check actually ran.

## Implementation acceptance boundary

Package-local syntax/regression/rendered smoke tests may establish local implementation quality. The user will still perform live deployment acceptance. Any feature that cannot be completed safely in this iteration must remain documented rather than simulated or overclaimed.


---

## Historical source: `SPRINT_1_UI_REVIEW.md`

# Sprint 1 UI Review — v0.40.1

## Implemented
- Reframed the center mobile action as **ZEKE**, not a gym-only mode.
- Added a Talk-to-ZEKE-first action at the top of the quick-entry sheet; structured logging remains available below it.
- Kept workout entry within ZEKE branding and reduced the separate-app visual treatment.
- Tightened dashboard, card, panel, conversation, and form spacing at desktop and mobile breakpoints.
- Reduced excess minimum heights and card gaps while preserving touch targets.
- Made the mobile conversation composer more prominent and persistent.
- Tightened workout-entry cards and headers to show more useful content in the first viewport.

## Verification performed
- JavaScript syntax validation.
- Static assertions for new unified-input controls and version labels.
- ZIP integrity verification.

## Not claimed
- Physical-device visual testing.
- A full redesign of every historical screen.
- Activity-schema changes; those belong to Sprint 2.


---

## Historical source: `SPRINT_2_ACTIVITY_ARCHITECTURE_REVIEW.md`

# Sprint 2 Review — Adaptive Activity Architecture

Version: 0.40.2
Baseline: 0.40.1 Sprint 1 Unified Mobile UI

## Implemented

- Added a central activity-field registry and profile-specific schema defaults.
- Custom activities now allow the user to select the fields shown during logging.
- Each selected custom field can independently be optional or required.
- Weight is not required by default for any activity, including strength and PT; it is required only when a custom activity explicitly marks it required.
- Added a dedicated Rehabilitation/PT schema.
- Added explicit recognition and a purpose-built schema for Cheerleaders: sets, repetitions, band resistance/color, pain before/during/after, difficulty, range-of-motion change, and PT/injury context.
- Added Recovery fields appropriate to Massage Chair: duration, program/intensity, heat, target area, and pain after.
- Direct activity entry now renders and saves from the resolved schema rather than a fixed strength form.
- Saved records include the field list and schema-version provenance.
- Custom activity configuration is stored in portable ZEKE preferences, retaining the existing local legacy migration fallback.
- Added mobile-responsive styling for the custom field selector.

## Verification performed

- `node --check assets/app.js` passed.
- `node tests/sprint2-adaptive-activity.test.js` passed.
- `node tests/activity-foundation.test.js` passed.
- ZIP integrity test passed after packaging.

## Known limits / next work

- The older multi-exercise workout editor still contains legacy category-specific fields and should be migrated to the same schema engine in a later sprint.
- Full browser interaction testing requires a connected or test storage environment.
- Physical phone testing has not been performed in this environment.
- The version-specific `v040-major-milestone.test.js` expects the prior 0.40.0 version string and is not an applicable pass/fail test for 0.40.2 without updating its frozen expectation.


---

## Historical source: `SPRINT_3_WORKOUT_INTELLIGENCE_REVIEW.md`

# Sprint 3 — Workout Intelligence & User Control

## Baseline
ZEKE v0.40.2 Sprint 2 Adaptive Activity Schemas.

## Implemented
- Added four-state activity recommendation preferences: Recommend more, Balanced, Recommend less, and Exclude.
- Preferences are stored locally in `zeke.fitness.activityPreferences.v1` and do not rewrite workout history.
- Excluded activities remain available in the All view for management and historical review, but are removed from ordinary recommendation-oriented library views.
- Coach's Eye does not surface an excluded activity as its actionable activity recommendation.
- Expanded activity cards explain how each preference affects ZEKE's future recommendations.
- Activity cards visibly identify non-neutral preferences.
- Existing specific Review Relationships and Research & Evidence flows remain attached to the selected activity rather than redirecting to a generic page.

## Governance alignment
- User control is explicit and reversible.
- Historical observations are preserved when an activity is excluded.
- Preferences are separated from factual activity records.
- Recommendation suppression does not silently delete or transform data.

## Known limits
- Preference weighting influences the activity library and Coach's Eye selection guard in this sprint. Full routine-generation weighting is deferred until routine generation is refactored to consume the same preference service.
- Published research context remains limited to evidence already represented in the package.


---

## Historical source: `SPRINT_4_GOVERNANCE_CONTINUITY_REVIEW.md`

# Sprint 4 — Governance & Continuity Review

**Baseline:** v0.40.3  
**Output:** v0.40.4

## Actual changes

- Consolidated release notes and archived snapshots.
- Added/updated canonical current documents and handoff path.
- Reconciled version identity across runtime metadata and current governance records.
- Added current runtime build manifest.

## Runtime boundary

No broad user-facing feature implementation was added in this sprint. Runtime edits are limited to version/build identity and service-worker cache identity.

## Next sprint

Full verification and release-candidate hardening.


---

## Historical source: `PACKAGE_AUDIT_v0.27.3.md`

# ZEKE v0.27.3 Package Audit

Base package: `Zeke-026-1.zip`

- Base ZIP entries: 488
- Existing entries modified: 8
- Existing entries removed: 0
- New entries added: 5

## Modified existing files
- `index.html`
- `sw.js`
- `version.js`
- `VERSION.txt`
- `DEVELOPMENT_MEMORY/PROJECT_STATE.json`
- `tests/release-structure.test.js`
- `assets/styles.css`
- `assets/app.js`

## Added files
- `RELEASE_NOTES_v0.27.3.md`
- `TEST_REPORT_v0.27.3.md`
- `tests/v027-mobile-workout.test.js`
- `PACKAGE_AUDIT_v0.27.3.json`
- `PACKAGE_AUDIT_v0.27.3.md`

## Packaging rule
Untouched entries were copied from the original ZIP using their original ZIP metadata, timestamps, compression settings, and file bytes. Only modified or added files use the v0.27.3 build timestamp.


---

# Consolidated legacy status and handoff records


## Imported from PROJECT_STATE.md

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


## Imported from FEATURE_STATUS.md

# ZEKE v0.43.1 Feature Status

**Build:** 2026.08.17.1

## Implemented in package

- Professional mockup-aligned mobile visual system across Dashboard/Health/Fitness/workout surfaces.
- Variation-first batch workout entry; exact variation is resolved before variation-dependent coaching.
- Canonical strength charts with independent exact-variation line series and missing-load omission.
- Compact truthful progression state when fewer than two comparable observations exist.
- Mobile bottom navigation without oversized center blob or duplicate floating ZEKE control.

- Canonical user-owned JSON repository with provenance/corrections.
- Unified Talk to ZEKE conversation and workflow engine.
- Mobile `+ Log Exercise` page using inline editable set rows, variation selector/creation, optional per-set effort/pain, ZEKE Coach, and variation-aware Form Guide.
- Canonical exercise families with separate variation series on shared chart axes.
- Reviewable historical exercise-name consolidation with preserved original wording.
- Health Measurements/Body Composition schema including DEXA-derived fields and source/method provenance.
- Recent Health Record edit/remove with correction history.
- Medication schedules plus individual dated dose occurrences.
- Opt-in assumed-from-schedule occurrences and historical reconstruction from known schedule start.
- Retroactive medication occurrence editing (taken/missed/delayed/partial/unknown/not-yet-taken).
- Longitudinal last-dose question answering with evidence disclosure.
- Meta/product-feedback separation from health records.
- Read-only conversational interruption of unfinished workflows.
- Upcoming Google Calendar context.
- Mobile-first retrospective calendar scan (past year) with Relevant / Not relevant / Unsure first pass.
- Calendar candidate → Questions for You → confirmed health-record backfill with provenance/deduplication.
- On-demand Health Record Workbook and canonical health JSON export.
- Legacy workbook migration/reconciliation workflow retained but demoted from source-of-truth role.
- AI Router with connected-workspace credential sync across devices.
- Vertical responsive side navigation and mobile overflow gates.
- Consolidated living release/test/provenance histories.

## Implemented but requires environment/user acceptance

- Live Google Drive persistence/reconnect.
- Cross-device AI credential hydration on separate physical devices.
- Calendar retrospective scan against the user's real calendar.
- Physical-phone visual fidelity/touch ergonomics.
- Generated health workbook review against the user's real longitudinal data.

## Incomplete release gates

- Verified visual media for every included PT/rehab movement.
- Physical-phone visual comparison to approved mobile exercise/dashboard design authority.

## Planned / not claimed complete

- Encrypted cross-device credential vault beyond Drive-account protection.
- Additional storage providers (OneDrive/Dropbox/WebDAV/SFTP/local adapter).
- Apple/Outlook calendar connectors.
- Automated causal inference; ZEKE remains association/context oriented.
- Mature learned cross-variation progression prediction (data architecture supports it; learning model remains future work).


## Imported from HANDOFF_BRIEF.md

# ZEKE Handoff Brief — v0.43.1

**Build:** 2026.08.17.1  
**Release label:** Mobile Professional Polish

Start with `00_AI_START_HERE.md`. The package is designed to stand alone without prior conversation history.

## What changed in v0.43.1

The runtime was not simplified. This pass corrected the phone interface around the existing v0.43 feature set. The authoritative mobile visual language is again dark navy / teal / white with compact, information-rich cards and clear hierarchy. Workout entry now resolves exact variation before variation-dependent coaching; exact-variation histories stay mechanically distinct; canonical charts display separate variation lines on shared axes; missing load is unknown rather than zero; per-set effort/pain is preserved; insufficient-data progression does not waste a large empty chart; and phone header/drawer/bottom-navigation/sticky-action geometry was corrected.

## Design authority

Read `DESIGN_AUTHORITY.md`. Do not reintroduce Gym Mode. Do not separate set display from set entry. Do not hide a required variation decision under optional details. Do not join unlike equipment histories into one line. Do not reintroduce the oversized mobile ZEKE center blob or duplicate floating action.

## Data authority

Canonical longitudinal JSON is source of truth. Generated XLSX/JSON outputs are reports. Calendar items are candidate evidence. Medication schedule assumptions are evidence-labeled occurrences, not confirmed administrations. DEXA is measurement provenance/method.

## Release status

Package-local mobile rendered verification passes across phone widths and the main workout/analytics regression paths. The broader release remains gated by the six missing PT visual guides plus physical-device/live-provider verification. Run `TEST_GUIDE.md`, `tests/mobile-professional-polish.test.js`, `tests/mobile-professional-polish.test.py`, the full JS suite, and `python tools/project_audit.py` before any further promotion.


## Imported from KNOWN_ISSUES.md

# ZEKE Known Issues — v0.43.1

**Build:** 2026.08.17.1

## Release blockers

1. **PT visual coverage is incomplete.** The last RC1 audit identified verified two-frame/appropriate visual coverage for 8 of 14 rehab/PT entries. Remaining known visual gaps: Band Internal Rotation, Doorway Chest Stretch, D1, D2, No Monies, and Cheerleaders. Do not substitute mechanically different images merely to make the count pass.
2. **Physical-phone visual acceptance is outstanding.** Package-local rendered checks now pass at 320, 375, 390, and 430 px and the current screenshots have been visually reviewed, but browser viewport tests are not equivalent to final real-device comparison against `DESIGN_AUTHORITY.md`.

## Environment verification outstanding

- Live Drive read/write/reconnect across multiple devices.
- Cross-device AI credential sync and provider test on a second device.
- Real-calendar 365-day retrospective scan volume/performance and user acceptance.
- External form-guide media availability in deployed environment.

## Security limitation

AI API keys are synced through the user-owned connected ZEKE workspace to satisfy cross-device persistence. In RC2 they rely on Drive account/OAuth confidentiality rather than a separate end-to-end encrypted credential vault. Keys are excluded from reports, diagnostics, and public package files. A hardened encrypted vault is a future security enhancement.

## Historical issues resolved or structurally addressed through v0.43.1

- Side menu collapsing into horizontal button rows at mobile/intermediate widths.
- Mobile body-measurement flow assuming waist only.
- Recent Health Record lacking edit/remove.
- Exercise entry separating set display from set input.
- Canonical exercise tile incorrectly splitting variation histories.
- DEXA treated as a separate navigation concept rather than measurement provenance.
- Device-only AI API key persistence.
- Old connected workbook presented as an ongoing authoritative health store.
- Medication history represented only as standing schedule rather than dated occurrences.
- Last-dose question requiring redundant user input despite stored schedule/history.
- Product feedback being eligible for health-event interpretation.
- Pending write workflow monopolizing later read-only conversation.
- Canonical exercise chart connecting unlike variation points into one line.
- Missing workout load rendered as a false 0 lb chart point.
- Variation selector buried below Coach guidance as an optional detail.
- Oversized mobile center-navigation blue blob and duplicate floating ZEKE action.
- Workout header/date controls overlapping phone content.


## Imported from DEPLOYMENT_HISTORY.md

# ZEKE Deployment / Replacement History

Historical file-replacement and upload instructions retained for traceability. Current deployment instructions live in README_DEPLOY.md.


---

## Current candidate status — v0.43.1

**Build:** 2026.08.17.1  
**Deployment status:** Not deployed by this package-generation step.

v0.43.1 is the mobile professional-polish successor to v0.43.0 RC2.1. Use the full package as the replacement unit when/if deployment is approved; do not selectively copy files by timestamp. Existing broader release gates remain in `DEVELOPMENT_MEMORY/RELEASE_GATE.md`.

---


## Historical source: `FILES_TO_REPLACE_v0.17.7.txt`

Replace these files in the ZEKE repository:

index.html
version.js
assets/app.js
assets/data-layer.js
assets/styles.css

Optional documentation:
RELEASE_NOTES_v0.17.7.md
TEST_GUIDE_v0.17.7.md


---

## Historical source: `DEPLOYMENT_MANIFEST_v0.40.0.md`

# ZEKE v0.40.0 Deployment Manifest

**Build:** 2026.08.03.1

## Recommended deployment

Replace the complete contents of the GitHub Pages repository with the contents of this package. Do not select files solely by modification date.

## Required runtime files

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `version.js`
- `zeke-config.js`
- `xlsx-bundle.js`
- `assets/styles.css`
- `assets/data-layer.js`
- `assets/parser.js`
- `assets/ai-router.js`
- `assets/workflow-engine.js`
- `assets/exercise-guides.js`
- `assets/knowledge-base.js`
- `assets/integrity-engine.js`
- `assets/app.js`
- `assets/branding/zeke-mark-provisional.png`

## Post-deployment checks

1. Startup displays **v0.40.0 · build 2026.08.03.1** on mobile and desktop.
2. Hard refresh once after GitHub Pages finishes deploying.
3. Verify the dashboard shows the lighter v0.40 composition.
4. Connect Google Drive and verify the repository loads.
5. Open the dashboard review card / Data Integrity route.
6. Review every proposed repair; do not batch-approve unfamiliar items.
7. Confirm an integrity backup is created before the first approved repair.
8. Verify repaired records no longer affect current charts/insights and remain visible in audit history.

## Cache behavior

The service worker uses `project-zeke-v0.40.0-20260803.1` and deletes earlier `project-zeke-*` caches on activation. A mixed runtime set is unsupported.


---

## Historical source: `FILES_TO_REPLACE_v0.40.0.txt`

ZEKE v0.40.0 / build 2026.08.03.1

Recommended: replace the complete repository contents.

Minimum verified runtime set:
index.html
manifest.webmanifest
sw.js
version.js
zeke-config.js
xlsx-bundle.js
assets/styles.css
assets/data-layer.js
assets/parser.js
assets/ai-router.js
assets/workflow-engine.js
assets/exercise-guides.js
assets/knowledge-base.js
assets/integrity-engine.js
assets/app.js
assets/branding/zeke-mark-provisional.png


---

## Historical source: `FILES_TO_REPLACE.txt`

ZEKE v0.40.0 / build 2026.08.03.1

Recommended: replace the complete repository contents.

Minimum verified runtime set:
index.html
manifest.webmanifest
sw.js
version.js
zeke-config.js
xlsx-bundle.js
assets/styles.css
assets/data-layer.js
assets/parser.js
assets/ai-router.js
assets/workflow-engine.js
assets/exercise-guides.js
assets/knowledge-base.js
assets/integrity-engine.js
assets/app.js
assets/branding/zeke-mark-provisional.png


---

## Historical source: `UPLOAD_THESE_FILES.txt`

ZEKE v0.40.0 · build 2026.08.03.1

Upload the complete package contents to the repository root. Do not upload only files that appear newer by timestamp. Verify version/build at startup after GitHub Pages deploys.

See DEPLOYMENT_MANIFEST_v0.40.0.md and BUILD_MANIFEST_v0.40.0.json.


Current continuity review: v0.46.0 · build 2026.08.24.3 · governance 2026.08.24.4.


Current continuity identity: v0.46.0 · build 2026.08.24.4 · governance 2026.08.24.5
