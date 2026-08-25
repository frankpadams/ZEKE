# Current development errors — v0.48.0

**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2

**ERR-055 — Screenshot identity misread.** A visible v0.47.0 label was incorrectly reported as v0.44.0 because expectation contaminated observation. Corrective rule: literal screenshot text is inspected first; uncertain text is marked uncertain.

**ERR-056 — Unsupported v0.48 implementation claims.** Prior assistant narration described v0.48 features as implemented even though the preserved source tree did not contain them. Corrective rule: assistant narration is not implementation evidence; current source/package/test artifacts govern status.

# Development Error Log

**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6

**Status:** Authoritative and cumulative

## ERR-001 — Partial version synchronization
- **Failure:** Release labels differed across index, version.js, VERSION.txt, and application fallback.
- **Impact:** A package could appear newer without being a coherent release.
- **Prevention:** Search the staged package for old version/build strings; fail the release gate if active files disagree.

## ERR-002 — Claims exceeded verification
- **Failure:** Release behavior was described as verified when only source structure had been inspected.
- **Impact:** User time was spent testing packages that had not been rendered.
- **Prevention:** Distinguish syntax, structural, rendered, and user-data tests. Never label unperformed tests as passed.

## ERR-003 — Fragile whitespace patches
- **Failure:** Repeated late CSS overrides attempted to repair a dashboard whose DOM still used coupled two-column placement.
- **Impact:** Tall cards created unrelated blank regions and fixes were difficult to trust.
- **Prevention:** Use explicit independent rows in the DOM. Empty visualizations must not be rendered or reserve height.

## ERR-004 — README and active guidance became stale
- **Failure:** README and deployment guidance lagged behind the running release.
- **Impact:** New chats and developers could follow obsolete instructions.
- **Prevention:** README update and document-index audit are release-gate requirements.

## ERR-005 — Deferred work disappeared from view
- **Failure:** Improvements discussed but not implemented were scattered across conversations and old notes.
- **Impact:** The same planning work had to be repeated.
- **Prevention:** Every deferred item receives a backlog ID, review date, reason, and resurfacing condition.

## ERR-006 — Development began before the required startup gate
- **Failure:** Development work was announced immediately after a general request to proceed, before completing the baseline audit, resurfacing eligible backlog items, presenting an iteration scope, and obtaining explicit approval.
- **Impact:** The project could have been changed without the user seeing or approving the actual scope, exclusions, data risks, or verification plan.
- **Prevention:** Every package has a root-level `00_AI_START_HERE.md`; a prescribed Pre-Development Checkpoint; an explicit stop point; a machine-readable `DEVELOPMENT_GATE.json`; and a recorded approval timestamp before the first edit. General enthusiasm or urgency never counts as scope approval.


## ERR-007 — Prior ZEKE decisions were not consulted before implementation continued
- **Failure:** After scope approval, implementation continued without first consulting accessible prior ZEKE conversations for binding synchronization, storage, confirmation, and deployment decisions.
- **Impact:** A technically plausible change could contradict requirements already decided by the user, such as cloud-canonical storage, reviewed transaction sequencing, no carried-forward observations, and confirmation before committing interpreted entries.
- **Prevention:** The startup gate and workflow now require a prior-conversation review before scope is proposed and again when the user requests clarification. User decisions are binding unless they conflict with the Constitution or verified evidence; earlier assistant claims must be corroborated by package files, data, or tests. Record the review in the iteration gate.

## v0.20.4 — Continuity framework certified despite internal contradictions
**Failure:** The release audit reported zero errors while the Constitution, release gate, development gate, document index, and file-count record disagreed.
**Cause:** The audit checked presence and a few strings rather than cross-document invariants.
**Prevention:** Maintain a machine-readable artifact registry and governance rules; compare current identity and approved scope across authorities; verify actual file count; run negative-control tests that seed contradictions and require audit failure.


## ERR-021 — Runtime version source drift
**Observed:** The browser tab identified v0.20.5 while the in-application header showed v0.20.3/build .12.  
**Cause:** `app.js` retained a stale fallback and `version.js` populated a different global name.  
**Prevention:** `version.js` now populates both `ZEKE_VERSION` and `ZEKE_BUILD`; current-release audits must inspect runtime source declarations, not only documentation.

## ERR-022 — Nonfunctional affordance in Activity Library
**Observed:** Activity cards displayed a help cursor but did not open.  
**Prevention:** Interactive cards must use pointer semantics, mouse and keyboard activation, visible expanded state, and regression/manual checks.

## ERR-023 — Governance audit covered documents but not application truth
- **Failure:** Continuity checks could report zero errors while active code, CSS, and release claims remained inconsistent.
- **Impact:** A future developer could trust a coherent-looking packet while editing the wrong files or relying on overstated behavior.
- **Prevention:** Register active runtime files, verify their existence and identity, and add claim-specific tests where feasible. Documentation audit success is not proof of rendered behavior.

## ERR-024 — Stale screenshots were treated as current-build evidence
- **Failure:** An independent-review packet included screenshots from different builds without labeling each screenshot's version.
- **Impact:** Already-fixed historical behavior could be misclassified as a current defect.
- **Prevention:** Every review screenshot must include or be accompanied by source version/build, capture date, route, viewport, and cache-refresh state.

## ERR-025 — Consultant hypotheses were stated as verified defects
- **Failure:** A second-opinion report asserted race conditions and other failures without a reproducible execution path or evidence.
- **Impact:** Speculative architecture could be implemented to solve a condition that did not exist.
- **Prevention:** Classify external-review findings as verified, plausible hypothesis, or unsupported. Require reproduction, code path, or test before treating a hypothesis as an implementation requirement.

## ERR-026 — Continuity documents were only partially reconciled
- **Failure:** A release updated primary state/gate records but carried forward Architecture, Feature Status, Backlog, Decision Log, Error Log, and related guidance without a document-by-document relevance review.
- **Impact:** The package contained a current release identity alongside obsolete architectural and feature descriptions.
- **Prevention:** DEC-021 applies. The release checklist must enumerate every authoritative/supporting standing document, record whether it changed or was reviewed unchanged, then rebuild the registry, checksums, and package audit.


## ERR-027 — Confirmation replies were reparsed as new health statements
- **Failure:** “Yes” to a sleep confirmation entered general interpretation, generated another confirmation, and did not save the intended sleep record.
- **Prevention:** Active transaction replies are routed before general parsing; save is idempotent; successful writes return created IDs and support view/undo regressions.

## ERR-028 — Metric delta was labeled as reference-range abnormality
- **Failure:** Cards described the numerical change from another observation as “over range,” producing impossible health interpretations.
- **Prevention:** Trend deltas and reference/target classification use separate fields and render paths. In the absence of valid contextual range data, state only the observed change.

## ERR-029 — Duplicate or conflicting recommendation surfaces
- **Failure:** Coach’s Eye advised repeating a load while the activity tile recommended an increase.
- **Prevention:** All Fitness surfaces consume one recommendation function and regression tests assert the shared source.

## ERR-030 — Internal processing language leaked into user insights
- **Failure:** Labels such as “Exercise parsing opportunity” described implementation mechanics rather than the user’s data or next step.
- **Prevention:** Dashboard and Insights content must state the concrete observation, why it matters, limitations, and a supported action. Internal classifier/parser terms are prohibited in normal user-facing cards.

## ERR-031 — Entry and edit schemas diverged
- **Failure:** RPE, pain, and technique fields appeared only after saving and editing a workout, even though coaching later depended on them.
- **Prevention:** Create and edit workflows share the same optional schema with progressive disclosure; missing fields remain unknown rather than favorable.

## ERR-032 — Top-level navigation exposed implementation subfeatures
- **Failure:** Labs, Insights, and Pattern Lab appeared as competing peer destinations.
- **Prevention:** Sidebar tests enforce major-domain hierarchy; Labs is a Health tab and Pattern Lab is an Insights subview.

## 2026-07-21 — Architecture handoff ambiguity

**Finding:** The full package contained readable active static files and historical hashed bundles but did not clearly state which files were authoritative or whether a build step still existed.  
**Risk:** A future developer could edit an inactive bundle, assume source was missing, or unnecessarily reconstruct a build system.  
**Correction:** v0.24.0 identifies the authoritative runtime, load order, no-compilation architecture, and legacy-file boundary in `ARCHITECTURE.md`, `README.md`, and `HISTORICAL_ARTIFACTS_NOTE.md`.

## 2026-07-21 — Conversation states could end without durable closure

**Finding:** Several defer, ignore, duplicate, correction, and question paths cleared UI state without one durable transaction outcome.  
**Risk:** Users could not reliably tell what changed, and developers lacked enough evidence to reproduce failures.  
**Correction:** v0.24.0 adds the workflow engine, explicit closure language, unresolved-interaction logging, and repository mirroring.

## 2026-07-21 — Idempotency guard blocked legitimate question updates

**Finding:** `saveFactor()` treated an update to an existing clarification question as a duplicate because the factor's own `question_key` matched the idempotency guard. `resolveFactor()` could therefore return the old open factor instead of saving a resolved, dismissed, unknown, or deferred state.  
**Risk:** Review actions could appear successful while the question remained unchanged, and repeated renders could show duplicate or stale review work.  
**Correction:** The idempotency check now excludes the factor being updated by ID. Regression coverage verifies that concurrent creation still produces one factor and that the same factor can later be resolved without duplication.

## 2026-07-21 — “Later” removed questions instead of preserving them for later review

**Finding:** Questions marked `deferred` were excluded from `openQuestions()`, despite the UI saying they were kept in Waiting for You.  
**Risk:** The interface contradicted its own closure language and a user could lose sight of unfinished decisions.  
**Correction:** “Later” now keeps the factor open, records defer metadata, and moves it behind newer questions. Rendered testing confirms that the review remains available.

## 2026-07-21 — Workflow state restored without an actionable resume path

**Finding:** Repository workflow state could be restored after refresh while the exact pending interaction object and choices were absent from the current browser session.  
**Risk:** The status could say a workflow was open without giving the user a reliable way to continue it.  
**Correction:** v0.24 reconstructs common pending question, confirmation, correction, health-history, and remembered-context states from the workflow record and provides a visible Resume action. Focused schedule editors reopen from their workflow target.


## 2026-07-21 — Deferred rendering reset diagnostics export choices

**Finding:** Background repository refreshes could mark a render as deferred while a Settings field was focused. Moving between export fields could then rebuild the page and reset privacy and date-range controls before the download click was handled.
**Risk:** A user could request an anonymized or date-limited report but receive the default full-range report instead. The clear-after choice could also become inconsistent.
**Correction:** Export options are now controlled by durable in-memory state, updated on input/change, restored on render, and captured before workbook creation. Browser testing verifies anonymized mode, date range, clear-after behavior, and successful workbook reopening.

## 2026-07-21 — Visible controls existed without reliable actions or accessible names

**Finding:** Metric overflow buttons looked interactive but had no action, two review pills shared the same ID so only one reliably received a handler, and workout close/remove icon buttons relied on the × glyph alone.
**Risk:** Users could click controls that did nothing, while keyboard and assistive-technology users received ambiguous control names.
**Correction:** Metric overflow controls open the matching detail view, all review pills use a shared data-action binding, and icon-only workout controls have explicit accessible labels. A rendered visible-control contract audit now fails on unbound enabled controls or unnamed icon controls across major desktop routes and the mobile Dashboard.


## ERR-033 — Missing baseline artifacts were assumed instead of requested
- **Failure:** A design-only add-on package was created when the user intended an updated master release, even though the active source package was not available.
- **Prevention:** When a requested update depends on a missing base artifact, ask for the current working release and any regression-reference release before packaging. Never imply a merge occurred without the source.

## ERR-034 — Dashboard composition regressed into large empty space
- **Failure:** Masonry/shared-column composition let tall sections create visual imbalance and made the Dashboard less organized.
- **Prevention:** The daily briefing uses one explicit flow with a compact three-card action row and a full-width Trends row. Tests enforce the new structure and prohibit the old dashboard masonry wrapper.

## ERR-035 — Confirmed sleep did not surface consistently
- **Failure:** A sleep statement could be understood in Talk to ZEKE but fail to appear in the same Recent Health Record used by direct entries.
- **Prevention:** Deterministic and direct sleep saves share `event_date` and `wake_date`; semantic Health filtering explicitly includes sleep; regression tests verify the full contract.

## ERR-036 — Universal activity fields created irrelevant and misleading columns
- **Failure:** Strength rows showed steps/duration while stair-cardio rows showed load/repetitions.
- **Prevention:** Capture, detail, graph, and history logic select fields by activity profile and hide columns without relevant values. Stair steps, ambulatory steps, and distance are separate fields.

## ERR-037 — A solved mobile save defect was at risk during broader redesign
- **Failure:** A later architecture release could have overwritten the direct click handler that resolved the real mobile Save Workout failure.
- **Prevention:** Use v0.25.2 as the implementation baseline, retain direct click plus submit fallback and visible error state, and add explicit regression assertions.


## ERR-038 — Medication schedule save could fail without a useful outcome
- **Failure:** The recurring schedule save path referenced an undefined label in its completion message, risking a silent or confusing failure.
- **Prevention:** Use the validated action label already in scope, display visible success/failure feedback, and retain a regression assertion for the schedule editor.

## ERR-039 — Historical doses required repetitive single-entry work
- **Failure:** Users could not efficiently enter a known series of past medication doses without creating each date individually.
- **Prevention:** Use a reviewed date-range transaction with cadence, preview, duplicate skipping, provenance, and undo rather than blind bulk creation.

## ERR-040 — Personal profile remained device-bound
- **Failure:** The active profile was written to localStorage, conflicting with the portable user-owned repository boundary.
- **Prevention:** Store the profile in provider-backed preferences; accept the legacy local value only as one-time migration input and remove it after a successful save.

## ERR-041 — Delayed render cleared modal input
- **Failure:** A queued root render could capture an empty modal field and later restore that stale value into an overlay outside the replaced root, erasing newly typed text.
- **Prevention:** Capture and restore editable state only for controls inside `#root`. Overlays that remain mounted retain their own live DOM state.

## ERR-042 — Goal guidance risked becoming an AI commitment path
- **Failure risk:** A goal-review feature could allow an AI response to invent targets or silently save changes.
- **Prevention:** Keep goal review advisory, show limitations, require explicit user save, and give AI no commit authority.

## ERR-043 — Mockup fidelity was not protected during feature expansion
- **Failure:** Workout programs, guides, readiness, and backend changes were added without a rendered gate proving that the approved exercise screen remained intact.
- **Prevention:** Treat the approved mockup as a locked acceptance artifact. Compare rendered phone output before packaging and stop on deviation.

## ERR-044 — UI states claimed saving or synchronization before the corresponding operation
- **Failure:** Saved/Syncing/Synced language and completion indicators appeared before or without a distinct acknowledged backend stage.
- **Prevention:** Model explicit states and map each label to a real operation. With provider-first writes, use Saving to provider → Saved only.

## ERR-045 — Gym Mode navigation escaped to the legacy Fitness interface
- **Failure:** View History removed the Gym Mode context and opened a regular activity tile.
- **Prevention:** Use bounded Gym Mode navigation for exercise entry, history, progression, guide, and return paths. Preserve unsaved state.

## ERR-046 — Exercise media passed metadata checks without depicting the exercise
- **Failure:** Licensing/source fields were treated as sufficient verification even when an image showed resting, equipment only, or an ambiguous movement.
- **Prevention:** Require a human-reviewed media manifest confirming the exact exercise and movement phase.

## ERR-047 — Release timestamps and folder presentation damaged record trust
- **Failure:** Packages used misleading or future-seeming timestamps and unclear extraction structure.
- **Prevention:** Copy unchanged ZIP entries directly with original metadata, stamp changed/new files at actual local modification time, include one labeled root folder, reopen the archive, and publish file-level provenance.

## ERR-048 — Mobile-focused changes risked redefining desktop ZEKE
- **Failure risk:** Gym Mode responsive work was discussed as a universal layout rather than a phone-focused context within the larger product.
- **Prevention:** Scope Gym Mode selectors and routes under a dedicated root. Test phone and desktop independently and prohibit desktop regressions.


## ERR-049 — v0.29.0 runtime shipped with stale continuity authority
- **Failure:** The v0.29.0 application package updated runtime code and only part of `PROJECT_STATE.json`, while README, handoff, architecture, feature status, gate, backlog, registry, project identity/health, status language, and current iteration/test records still described v0.27.2 or older releases.
- **Impact:** The newest code package could not be trusted as the authoritative development handoff, and a future developer could follow obsolete recovery instructions or misclassify unimplemented features.
- **Prevention:** Apply DEC-055. Every release must include a document-by-document reconciliation matrix, a current iteration and test report, zero-error project audit, lifecycle-correct artifact registry, and runtime-byte comparison before it can be called authoritative.


## ERR-050 — Current-authority reconciliation falsely passed on a partial identity audit (2026-08-24)

**Observed:** The first v0.46.0 package passed `tools/project_audit.py` and claimed Constitution/governance reconciliation even though `00_AI_START_HERE.md`, `PROJECT_IDENTITY.md`, portions of `PROJECT_STATE.json`, Design/Architecture continuity, and other standing documents still described prior releases.

**Root cause:** The audit checked version/build presence in a limited identity list and registry membership, but did not require every registered authoritative artifact to carry evidence that it was reviewed for the current release/governance revision. Supporting documents that declared “current” state were also outside the identity check.

**Prevention:** Every registered authoritative artifact now receives a release/build/governance review stamp in `ARTIFACT_REGISTRY.json`; the audit compares the full authoritative set. A standing supporting-continuity list is also checked. Current release claims must fail when those reviews are absent or stale.

**Lesson:** Passing an automated governance check is not itself evidence that the check covers the actual continuity contract. The audit must validate the whole authority graph, not only a convenient subset.


## ERR-051 — Visual release claims were made without rendered acceptance
- **Failure:** Major desktop UI rebuilds were described as release-ready after syntax/DOM/overflow/governance checks without an actual representative browser render against the approved mockup.
- **Impact:** The user received packages whose spacing, density, hierarchy, and composition were visibly unacceptable.
- **Prevention:** A visual release must include representative Chromium renders, direct inspection against Design Authority, and explicit failure when the screen is materially off-reference even if structural tests pass.

## ERR-052 — Unbounded UI graphics destroyed Dashboard rendering
- **Failure:** Presentation rules allowed small SVG/icon graphics to expand to page-scale black shapes.
- **Impact:** The Dashboard became effectively unusable despite the underlying application/data shell still loading.
- **Prevention:** v0.47 uses controlled `v47Icon()` SVG boxes and scoped `.v47-icon-svg` rules. Generic SVG sizing rules are prohibited; rendered gates fail when a visible icon exceeds its contract.

## ERR-053 — Presentation experiments were allowed to become forward baselines
- **Failure:** Successive visual patches inherited styling from already-failed visual attempts, compounding layout drift.
- **Impact:** Functional progress became psychologically entangled with broken presentation work and raised the risk of unnecessary full-app rollback.
- **Prevention:** Separate functional donor from presentation donor. v0.45.1/v0.46.2 preserve functional continuity; failed later v0.46 visual experiments are quarantined as evidence only.

## ERR-054 — Build-number churn obscured material release changes
- **Failure:** Materially different packages reused v0.46.0 and changed only build suffixes/descriptive filenames.
- **Impact:** Package identity became confusing and rollback/recovery history was harder to reason about.
- **Prevention:** Materially different packages increment the semantic version. v0.47.0 begins the recovered visual-system line.
