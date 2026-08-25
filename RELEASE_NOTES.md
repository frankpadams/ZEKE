# ZEKE v0.48.0 Development Notes

**Build:** 2026.08.25.1 · **Governance:** 2026.08.25.2 · **Not a promoted release.**

Current delta from v0.47.0: development-integrity governance plus transactional repair of Questions-for-You persistence/error feedback. Live Google persistence verification remains outstanding. Planned Timeline, medication, workout-planner, natural-language transaction, and mobile work remains in development.

# ZEKE Release Notes

## v0.47.0 · build 2026.08.24.1 — Visual System Recovery + Preserved Functionality

**Governance revision:** 2026.08.24.6

This release recovers ZEKE’s desktop presentation without discarding verified functional progress. It uses v0.45.1 as the stable rollback source, reconciled v0.46.0 build 2026.08.24.2 as the functional donor, and rejects the later failed v0.46 visual experiments as presentation baselines.

### Visual system recovery
- Approved 2026-08-24 desktop mockup stored as in-package visual reference and incorporated into Design Authority.
- New scoped desktop visual layer with dark navy shell, disciplined mockup-like grid, uniform gutters, compact information density, controlled icons, 2×2 Health snapshot, bounded Recent/Insights/Next Up, Timeline/Goals, and no Dashboard nested-scroll dependency.
- Purpose-built mobile Dashboard continuity retained separately.
- Weekly workout planning preserved in Fitness rather than deleted.
- Documents route corrected.

### Preserved functionality
Talk/Questions state behavior, adaptive workout proposal/remaining-workout adaptation, browse-first exercise/body navigation, anatomy/injury/PT relationships, variation recency/sets/shared-axis charts, short-Why workout reasoning, document/DEXA intake, medication reconciliation, Calendar privacy, PT media validation, and provider-backed persistence rules remain carried forward.

### Verification
Actual Chromium visual gates now supplement functional/governance tests and explicitly cover oversized SVGs, multiple desktop/mobile widths, major routes, and sparse/dense/long-text Dashboard states. Final package status is recorded in `DEVELOPMENT_MEMORY/RELEASE_GATE.md`; live provider verification remains a separate environment boundary.

---

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.2 · governance 2026.08.24.3

## v0.46.0 · build 2026.08.24.2 — UX Architecture + Connected Anatomy

### Governance reconciliation — 2026.08.24.3

- Reconciled the current governance identity tuple across the Constitution, Design Authority, decision/continuity authorities, project state/gate, artifact registry, release scope, test/reporting documents, README/deployment guidance, and standing continuity documents.
- Runtime remains **v0.46.0 · build 2026.08.24.2**; governance revision **2026.08.24.3** is documentation/audit-only.
- Strengthened `tools/project_audit.py` so an authoritative document whose visible current-review header disagrees with the governance source of truth fails the release audit.
- Added a matching negative control; the governance negative-control suite is now **12/12**.


### Build 2026.08.24.2 — Desktop composition structural correction
- Replaced the height-coupled desktop Dashboard arrangement with page-owned horizontal bands and independent nested layout contexts.
- Removed the tall side-rail composition that allowed Today/Upcoming/Data Integrity height to delay unrelated Dashboard content.
- Dashboard Recent Activity is now a bounded summary by item count rather than a nested vertical scroll region.
- Clean Data Integrity status no longer consumes Dashboard real estate; issues surface only when action is needed.
- Upcoming is capped to the next three items on Dashboard and long titles/locations truncate instead of starving the column.
- Removed the second redundant Insights surface from Dashboard.
- Added structural acceptance coverage for the banded composition and updated rendered checks.
- Corrected startup subtitle/fallback identity remnants so runtime identity has one current value.

This release is a UX stabilization and architecture pass. It rebuilds the desktop Dashboard around user priorities, makes consequential interactions visibly responsive, improves exercise browsing and variation history, and adds a versioned anatomy knowledge layer connecting Fitness, PT, body areas, and injury context.

### Governance reconciliation — 2026.08.24.2
- Re-read the complete registered authoritative continuity set after discovering that the first v0.46.0 package still contained stale current-state declarations in several standing documents.
- Updated the Constitution, Design Authority, Architecture, scope, decision/iteration/continuity records, Project State/Identity/Health, roadmap, test guidance, README/deploy guidance, status/diagnostic metadata, and package history to the v0.46.0 UX/anatomy decisions.
- Added full-authority current-review stamps to the Artifact Registry and strengthened `tools/project_audit.py` so a stale standing authority can no longer pass merely because a smaller identity subset agrees.
- Runtime code remains **v0.46.0 · build 2026.08.24.2**; this is governance/documentation revision **2026.08.24.2**, not a hidden runtime feature change.

### User experience and desktop composition
- Rebuilt the Dashboard around **what matters now, what changed, what is next, and what needs attention** rather than equal-sized feature cards.
- Recent Activity is now a structured visual feed with stable category cues and an intentional desktop scroll window; mobile continues to flow naturally.
- Reduced duplicate summaries, oversized empty states, and narrow narrative columns.
- Added stronger first-load/page-scroll safeguards so content remains reachable.

### Talk to ZEKE and Questions for You
- Rebuilt Talk to ZEKE around explicit **closed / compact / expanded** states with a reliable close control and preserved page access.
- Duplicate-review decisions now show immediate selected/working feedback before persistence; editing is separated from the decision choices.

### Fitness, exercise browsing, and charts
- Exercise discovery is **browse-first** with body-area navigation; search remains optional.
- Exercise detail uses linked primary/secondary body areas instead of internal “canonical exercise” terminology.
- Variation rows are ordered by recency and show the latest load × reps × sets and date without redundant “Last” or variation-count labels.
- Variation charts preserve independent series on shared axes; selecting a variation emphasizes it without discarding the comparison. Missing load remains unknown rather than zero.
- Workout planning now presents a concise decision-relevant **Why this** explanation first, with deeper context available on demand.

### Connected anatomy knowledge
- Added a versioned anatomy reference pack mapping common exercise/body-area concepts to muscles, joints, bones, and useful soft-tissue context.
- Body-area views can connect exercises with recorded injury/symptom and PT context without automatically converting anatomical overlap into a prohibition.
- Reference knowledge carries version/review metadata and remains separate from personal records.

### Identity and release safety
- Runtime build identity is centralized at **v0.46.0 · build 2026.08.24.2** and stale v0.44 startup strings were removed from inherited mobile-polish layers.
- Package-local governance, syntax, regression, PT visual, rendered workflow, mobile rendered, and support-report checks pass. External-real-data fixture tests remain explicitly skipped when their fixture is unavailable.

### Environment checks still required
Physical-device/representative-desktop acceptance and live Google/AI-provider behavior require the deployed environment and are not represented as package-local passes.

---

## v0.45.1 · build 2026.08.23.4 — Integrated Fitness + Adaptive Training

This release integrates the recent Fitness/workout, rehab, ingestion, medication, calendar-privacy, and mobile workflow decisions into one complete package.

### Fitness and adaptive training
- Global **Log** is a top-level explicit recording action; Fitness is naturally browsable and non-mutating until Start/Log/Save/Complete.
- Workout recommendations accept location, remembered equipment, available time, emphasis, same-day notes, recent training, and clinical maps.
- Accepted proposals populate the editable active workout. Completed work stays preserved while ZEKE can adapt only the remaining work using order/fatigue, pain/RPE, and clinical constraints.
- Canonical exercise families retain independent variation histories and shared-axis multi-series charts; missing load remains unknown.

### PT/rehab
- The six previously missing PT guide pairs were replaced with movement-specific two-frame schematics, with movement-verification metadata and accessible SVG title/description.
- Generic image-count success no longer satisfies the PT visual gate.

### Documents and longitudinal health
- Added generic PDF/image intake. PDF embedded text is attempted first; OCR is used only when needed. Source filename/type/hash, extraction method, preview, classification, confidence, and proposed structured data are reviewable before confirmation.
- DEXA extraction is supported inside the generic body-composition/document architecture.
- Illness/injury/context events support start/end, ongoing status, and approximate dates.
- Medication reconciliation now supports possible alias/duplicate grouping, active/stopped status, schedule, and adherence semantics.
- Calendar settings separate Google access from permission to create/use a ZEKE calendar and preserve per-category ask/always/never privacy choices.

### Interface and governance
- Dashboard observations are consolidated into one changing **Insights** surface; Fitness no longer blindly reuses generic health pattern candidates.
- Constitution/governance now explicitly protect informational navigation, explicit mutation, accepted-proposal workout transition, adaptive remaining-workout boundaries, and truthful movement-level PT media.
- Current authorities, regression tests, cache identity, and package registry are reconciled to v0.45.1 build 2026.08.23.4.

### Environment checks still required
Physical-phone/representative-desktop acceptance and live Google/AI-provider checks require the deployed environment and are not represented as package-local passes.

# ZEKE Release Notes

## v0.45.0 — Adaptive Training + Mobile-First Recovery — 2026-08-23

**Current build:** 2026.08.23.2 (governance-reconciled; runtime feature scope unchanged from 2026.08.23.1)

### Governance reconciliation — build 2026.08.23.2
- Re-read the full `ZEKE_CONSTITUTION.md`, authority/lifecycle rules, governance JSON, project state, release gate, artifact registry, package history, release documentation, and adaptive-training implementation.
- Corrected stale v0.43.1 governance identities and references left in the first v0.45.0 package.
- Removed registry dependencies on intentionally consolidated-away `CHANGELOG.md`, `FEATURE_STATUS.md`, `KNOWN_ISSUES.md`, `PROJECT_STATE.md`, `HANDOFF_BRIEF.md`, and `DEPLOYMENT_HISTORY.md`; their living successors are `RELEASE_NOTES.md`, `CURRENT_RELEASE_SCOPE.md`, `TEST_REPORT.md`, `DEVELOPMENT_REVIEW_HISTORY.md`, and `DEVELOPMENT_MEMORY/PROJECT_STATE.json`.
- Added explicit constitutional rules preserving clinical facts, clinician restrictions, AI inference, and observed training response as distinct evidence classes and bounding automatic progression.
- No adaptive-training runtime feature was promoted to clinically authoritative status; the implementation remains decision support only.

### Recovery / packaging
- Reconstructed a complete release from v0.43.1 plus the verified v0.44.1 patch because the v0.44.0 intermediate full package was unavailable.
- Recreated the missing `mobile-native.css` and `mobile-native.js` layer rather than shipping broken references.
- Retained the v0.44.1 history-row, recommendation-density, More-drawer, save-area, and startup-version polish.

### Mobile-first interface
- Added a purpose-built mobile presentation layer for <=760px rather than relying on desktop card geometry.
- Preserved five-item Home / Health / ZEKE / Fitness / More navigation and safe-area handling.
- Reduced giant-card behavior, tightened information density, converted key forms to bottom-sheet-style mobile dialogs, and keeps workout Save controls accessible above bottom navigation.
- Reflows fitness history as compact touchable records and gives exercise/variation content a single-column mobile hierarchy.

### Adaptive PT + strength + cardio intelligence
- Added `training-intelligence.js` with a structured clinical-context schema covering affected anatomy, explicit restrictions, movement/load implications, rehab emphasis, confidence, provenance, and uncertainty.
- Added Fitness → Adaptive Training panel.
- Added connected-AI clinical interpretation and connected-AI adaptive session planning.
- Added manual AI consultation packets for ChatGPT/Claude/Gemini/etc. when no API is connected.
- Added import of manual JSON clinical-map responses back into ZEKE.
- Added a capability/tolerance map based on actual workout exposures and explicit recorded pain observations. Blank pain is never treated as pain-free.
- Workout-planning prompts explicitly require progression and regression/stop criteria and keep clinician/PT restrictions authoritative.

### Preserved / verified behavior
- Canonical exercise tiles retain independent equipment/variation lines on shared axes.
- Missing load is omitted/gapped instead of plotted as zero.
- Exact variation selection continues to unlock variation-aware coaching/history.
- Rehab exercise profiles and pain fields are retained.
- Question resolution remains persisted through the data layer.


---

# Consolidated historical changelog

# ZEKE Changelog

## Prior release — v0.43.1

**Build:** 2026.08.17.1  
**Label:** Mobile Professional Polish

- Restored approved mockup-level mobile visual hierarchy across Dashboard/Health/Fitness/workout surfaces while preserving the v0.43 longitudinal feature set.
- Replaced oversized mobile center-navigation blob with a compact balanced ZEKE entry and removed the duplicate floating ZEKE orb on phone widths.
- Moved exact variation/equipment selection before variation-dependent Coach content in workout entry.
- Added/retained per-set effort/RPE and pain in direct and batch strength entry.
- Corrected canonical exercise charts so each exact variation is its own line on shared axes; missing load is omitted and never rendered as 0 lb.
- Collapsed one-session/insufficient-data progression into a compact truthful state.
- Corrected mobile workout header/date/sticky controls, drawer width, period ownership, and phone overflow behavior.
- Added dedicated mobile professional-polish source and rendered regression tests.

---

# ZEKE Release & Patch History

Authoritative living release, patch, and migration history. Information from superseded per-version files is retained below.

## Current release — v0.43.0 RC2.1

### Continuity reconciliation
**Build:** 2026.08.16.3
- Added missing living `RELEASE_NOTES.md` required by the canonical documentation set.
- Reconciled medication dose-history requirements: one dated occurrence per expected/actual dose, schedule-derived assumptions, retroactive corrections, and historical backfill with provenance.
- Clarified that past-year calendar relevance review is a mobile-first interaction; shared calendar candidates remain evidence until explicit confirmation.
- Reconciled Health Reports & Export versus the legacy connected workbook: reports are generated from canonical records; the workbook is migration/reconciliation only.
- Reconciled AI credential persistence: connected user-owned workspace is authoritative across devices; browser-local keys are legacy/noncanonical.
- Added explicit supersession language for historical Gym Mode references.
- Reaffirmed package-alone developer handoff as a release requirement.

---

## Current release — v0.43.0 RC2

### Longitudinal Integrity & Sync
**Build:** 2026.08.16.2
- Added dated medication occurrence reconstruction, explicit/assumed provenance, retroactive correction, and deterministic last-dose lookup.
- Fixed open-workflow conversation hijacking and excluded product/meta feedback from the health record.
- Added mobile past-year calendar candidate screening, dedupe, confirmation, and retrospective health-event backfill.
- Added Health Reports & Export and demoted the legacy connected workbook to migration/reconciliation status.
- Moved AI provider credentials from device-local storage into connected workspace configuration for multi-device continuity, with legacy-key migration.
- Added current release-scope and design-authority documents so the package can stand alone for a new development team.
- Retained RC blockers: six missing verified PT visuals, physical-phone acceptance, and live connected-provider verification.

---

## Current release — v0.43.0 RC1

### v0.43.0 RC1 — Mobile Exercise & Measurement
**Build:** 2026.08.15.1
- Rebuilt mobile **+ Log Exercise** around the approved phone design: variation selector, inline set rows, Coach recommendation/rationale, and integrated Form Guide.
- Each set can carry different load/reps; effort and pain are optional per set.
- Fitness tiles are canonical exercise families; strength variations plot as separate labeled series on shared X/Y axes.
- Added reviewable consolidation intelligence for historical exercise naming while preserving original wording/provenance.
- Added expanded Body Measurement and Body Composition fields; DEXA is a source/method, not a top-level navigation item.
- Added Recent Health Record edit/remove workflow with correction history.
- Hardened responsive navigation so the side drawer remains vertically stacked instead of reverting to horizontal button rows.
- Began package/document consolidation. PT visual completeness and physical-device fidelity remain publish blockers.


---

## Historical source: `PATCH_NOTES_v0.5.1.md`

# ZEKE v0.5.1 Confirmation Patch

This deployable patch was built from the uploaded compiled v0.5.0 alpha static assets. It does not require the original React/Vite source tree.

## What changed

- Dashboard **Tell Zeke** is relabeled **Talk to ZEKE**.
- The button now says **Interpret** instead of immediately saving.
- Local parser output is shown in a review panel before any structured event is saved.
- The user must click **Confirm & save** before interpreted entries become structured records.
- If the parser is wrong, the user can click **Try AI reinterpretation**.
- AI reinterpretation uses an optional browser hook: `window.ZEKE_AI_REINTERPRET({ raw_text, local_events })`. If no hook is configured, ZEKE does not save anything and tells the user to revise or confirm as raw note.
- Confirmed saved records are tagged with `interpretation_status: "confirmed_by_user"`, `interpretation_source`, and `original_raw_text`.

## Important

This is an early usability/stability patch. It is intentionally conservative: wrong interpretations are not silently saved.

## Deployment

Upload the contents of this folder over the deployed ZEKE directory. If you already have a working `zeke-config.js`, preserve your deployed copy unless you want to use the public Google Client ID included here.


---

## Historical source: `PATCH_NOTES_v0.5.2.md`

# Project ZEKE v0.5.2 Alpha — AI Router Test Patch

This is a quick static-site test release focused on trying free AI integration without rebuilding the full source project.

## Added

- Floating **AI Router** panel available from the lower-right AI button.
- Direct browser test setup for:
  - Gemini
  - OpenRouter
  - Groq
- Secure relay placeholder for OpenAI, Claude, and other providers that should not expose API keys in browser code.
- AI chat test pane so Ask ZEKE can feel more conversational.
- Interpretation prompt that can send an entry through the AI router.
- Provider fallback order managed by the router.
- Minimal privacy mode that strips obvious emails, phone numbers, and SSN-like patterns before sending text to direct providers.

## Important limitations

This is a browser/static-site test patch. Some providers may block direct browser requests through CORS or change model names/rate limits. For a production-quality implementation, OpenAI, Claude, and possibly other providers should be called through a secure relay. The user-facing behavior should remain the same: ZEKE asks the AI router, and the router chooses the provider.

## Security note

API keys entered in this test panel are stored in this browser's localStorage for convenience. Do not use shared computers. A production release should store provider configuration in the user's chosen ZEKE repository and/or use a secure relay so browser code does not hold provider secrets.

## Deployment

Upload this static-site folder over the existing ZEKE deployment. Preserve a working `zeke-config.js` if it already contains the correct Google client ID.


---

## Historical source: `PATCH_NOTES_v0.6.0.md`

# ZEKE v0.6.0 Experience Alpha — Release Notes

## Purpose

This release is a substantial experience-layer upgrade built on the recovered ZEKE v0.5 compiled static application. It is intentionally an alpha test release, not a source-code rewrite.

The handoff package remains the authoritative product specification. This release does not supersede it.

## What changed

### Data-dense Health briefing

The Health dashboard now adds:

- visible current values and range deltas;
- line charts for weight and resting heart rate;
- workout consistency by week;
- recent lab value tiles;
- selectable ranges: 1 week, 1 month, 3 months, 6 months, 1 year, and all-time;
- mouseover/focus detail for chart points and bars;
- fewer decorative visuals and more explicit values.

### Unified Talk to ZEKE conversation

Talk to ZEKE and ZEKE responses are presented as one conversational surface.

- Questions are answered locally first when possible.
- Natural phrases such as "look deeper," "try harder," "use AI," and "that's not right" can escalate through the AI Router.
- Statements are interpreted locally and shown for confirmation before structured save.
- "Not quite—look deeper" requests AI reinterpretation while preserving the original user entry.

### AI Router v0.6

The router includes setup adapters or relay paths for:

- Gemini
- Groq
- OpenRouter
- Mistral
- Cerebras
- NVIDIA NIM
- GitHub Models
- Cloudflare Workers AI
- Hugging Face Inference Providers
- OpenAI API
- Claude through secure relay
- custom provider-neutral secure relay

The router is free-first by default and can fall back across configured providers.

### Family health history

A Family History interface allows optional user-confirmed context including:

- relationship;
- condition or event;
- age at diagnosis/event;
- status/outcome;
- notes.

Family history is context for discovery and discussion. It is not converted into a diagnosis or a claim about the user.

### Coach's Eye

Workout history is examined for practical progression prompts such as:

- hold or repeat a load after a large jump;
- consider a small increase after strong performance with low recorded pain and manageable RPE;
- consider whether higher load/fewer reps better match a strength goal;
- pause progression when pain signals warrant caution;
- improve future coaching by recording load, reps, sets, RPE, and pain together.

Expanded evidence views show the research context used for the prompt and explicitly preserve uncertainty.

### I've been thinking...

The dashboard adds quiet conversational prompts rather than a task-like suggestion queue. These can surface:

- optional trackables repeatedly mentioned in raw entries;
- family-history context worth considering;
- questions ZEKE may want to explore with the user.

## Important alpha limitations

1. This is still a static browser application built over the recovered compiled v0.5 base.
2. Direct browser API-key testing is included for rapid alpha validation. Keys entered in this test build are stored in browser localStorage. Do not use this pattern as the final production security architecture.
3. Browser CORS policies or provider policies may block some direct provider calls even when a key is valid. Secure relay support is included for providers that require or benefit from it.
4. Free tiers, model availability, and rate limits are controlled by providers and can change.
5. Google reconnect behavior is inherited from the existing v0.5 connector in this release; a more robust source-code implementation remains a priority.
6. ZEKE coaching is decision support, not diagnosis, medical advice, or medical clearance.

## Quick test sequence

1. Deploy the contents of this ZIP to the ZEKE static-site root.
2. Preserve your working `zeke-config.js` if the deployed version contains a newer Google Client ID or environment-specific values.
3. Hard-refresh the browser.
4. Connect Google through the existing ZEKE alpha flow.
5. Open the AI Router floating control and configure one provider. Gemini, Groq, or OpenRouter are good first alpha tests.
6. Open the dashboard and test the range selector.
7. Ask a question in Talk to ZEKE, then follow with `look deeper` to test router escalation.
8. Enter a natural-language observation and verify that interpretation is shown before save.
9. Use Family history to add optional context.
10. Open Workouts and inspect Coach's Eye prompts and evidence views.


---

## Historical source: `PATCH_NOTES_v0.6.1.md`

# Project ZEKE v0.6.1 — Groq Visibility Fix

This patch makes Groq unmistakably visible in AI Router setup.

Changes:
- Groq is labeled **Groq Free** in the provider list and preferred-provider menu.
- A **Fast free setup** section places Groq Free, Gemini Free, and OpenRouter Free at the top of provider setup.
- Clicking a quick-start provider enables and scrolls to its full configuration row.
- AI Router JS/CSS asset names are versioned to v0.6.1 and referenced with cache-busting query strings so browsers are less likely to reuse the previous panel.
- All v0.6.0 experience features remain included.


---

## Historical source: `PATCH_NOTES_v0.6.2.md`

# Project ZEKE v0.6.2 UI Compliance Alpha

This patch follows a direct UI audit against the product handoff and July 9 design feedback.

## Changes

- Makes the enhanced dashboard full width instead of squeezing it into the legacy left column.
- Hides the legacy right rail after the enhanced dashboard successfully loads.
- Uses human-readable time ranges: Week, Month, Quarter, 6 months, Year, All.
- Hides empty metric/chart cards by default.
- Adds a visible dashboard Customize control for metric and card visibility.
- Adds a conversational first-use tracking prompt for prescribed medications, supplements, injections/treatments, protein shakes, creatine, and custom recurring items.
- Stores confirmed tracking choices in the connected ZEKE factor repository rather than treating them as permanent browser-only health records.
- Adds Personal & family health history wording and supports historical personal context as well as relatives.
- Adds an upcoming-events card with both date and time.
- Renames the dashboard AI control to AI Assist while retaining the AI Router behind it.
- Fixes chart hover tooltip positioning by anchoring tooltips to the chart container.
- Preserves confirmation-before-save for interpreted entries.
- Keeps Groq Free as a prominent quick-start AI option.

## Known gaps not represented as complete

- Google silent reconnect/no-repeat-wizard behavior is not fully solved in the recovered v0.5 compiled core.
- Universal Capture is not complete: text is integrated, but voice/image/file capture is not yet unified in the Talk to ZEKE field.
- A durable Knowledge Inbox and full Interpretation Log are not yet complete in this static enhancement layer.
- Offline pending sync queue is not yet implemented.
- Discovery logic includes evidence-linked coaching and selected research-aware context, but a general statistical/clinical significance engine is not yet complete.
- Storage choice remains Google-centric in the recovered alpha core; provider-neutral future adapters remain required.


---

## Historical source: `PATCH_NOTES_v0.6.4.md`

# ZEKE v0.6.4 — Feedback Integration Alpha

This release is an acceptance-oriented static alpha built over the recovered compiled ZEKE v0.5 core.

## Interaction corrections
- One main conversational surface on the dashboard.
- Legacy Talk/Tell/Ask/Discoveries/response cards are suppressed when the enhanced dashboard is active.
- Interpretation confirmation uses natural language rather than parser JSON.
- Ambiguous `BP 120 12 2`-style input prompts a natural clarification between blood pressure and bench press.
- Clarification questions can be deferred or ignored.
- A persistent question indicator keeps unresolved questions from disappearing into conversation history.
- Likely duplicates are checked before save; the user can keep both, keep only the existing entry, or cancel the new one.

## Today’s Actions
- Tiles are horizontally scrollable on narrow windows and touch devices.
- Completion is based on confirmed events for the current local calendar day.
- Historical completion is not carried forward.
- Clicking an action routes entry back into the main conversation.

## Dashboard and data integrity
- Dashboard cards use stored ZEKE repository events, not hard-coded personal values.
- Empty metric cards remain hidden by default.
- Health-at-a-glance metrics show current numbers first and trend charts only when there are at least two observations.
- Metric tiles include contextual + Log entry points that return to the main conversation.
- Personal and family health history is not displayed on the main dashboard.
- Coach’s Eye and “I’ve been thinking…” remain prominent.

## AI Connections
- Settings no longer ask the user to pick an active/default AI provider.
- ZEKE’s router chooses among connected providers based on task fit, privacy, availability, limits, fallback status, and free-first rules.
- Groq Free, Gemini Free, and OpenRouter Free are prominent connection options.
- Manual packet workflow remains available.

## Provider-agnostic settings direction
- Storage settings show Google Drive as available in this alpha and OneDrive, Dropbox, private SFTP/server, Nextcloud/WebDAV, and local-device adapters as planned.
- Calendar settings show Google Calendar as available in this alpha and Apple Calendar/iCloud, Outlook/Exchange, and CalDAV/ICS connectors as planned.
- Planned connectors are clearly disabled rather than falsely presented as operational.

## Known limitations
- This remains a static enhancement over the recovered compiled application, not the maintainable source-code reconstruction.
- Google silent reconnect is not fully solved in this static alpha.
- Only Google Drive and Google Calendar are operational connectors in the recovered core; other providers are architecture/UI placeholders and are labeled as planned.
- Live AI requests require the user to provide a valid API key/token for a supported provider. Provider-side free allowances and limits can change.
- API keys in this test build are stored in browser localStorage. This is not the intended production security architecture.
- The clarification queue is partially repository-backed; some context-derived questions are regenerated from missing schedule information rather than stored as full durable conversation objects.


---

## Historical source: `PATCH_NOTES_v0.6.5.md`

# ZEKE v0.6.5 — Mockup-Aligned UI Alpha

This release changes the visible shell instead of adding another DOM overlay.

## Primary changes
- Mockup-aligned, clean but data-dense dashboard shell.
- One unified Talk to ZEKE conversation surface.
- No separate Ask ZEKE / Your Discoveries / ZEKE Response input areas.
- Health at a Glance uses prominent numeric values and verified event data only.
- Trend charts require actual observations; insufficient data is shown honestly.
- Contextual + Log actions from health tiles.
- Natural language ambiguity clarification for inputs such as `BP 120 12 2`.
- Confirmation before saving interpreted structured entries.
- Duplicate review before saving highly similar recent entries.
- Persistent clarification-question indicator in the main conversation.
- Today’s Actions completion is scoped to confirmed current-local-day events.
- Today’s Actions scroll horizontally instead of clipping.
- Coach’s Eye remains prominent and uses recorded workout history.
- “I’ve been thinking…” remains prominent and conversational.
- Personal/family health context removed from the main dashboard.
- Sleep is represented under Health rather than a separate top-level domain.
- Dashboard remains a primary left-navigation destination.
- AI Connections connect/test services; no ordinary “use this AI” provider choice.
- Groq Free, Gemini, and OpenRouter Free remain visible in AI setup.
- Storage and calendar settings show current vs planned provider adapters honestly.

## Data integrity
No mock personal health values are hard-coded into the dashboard. Cards and charts read from the ZEKE event repository API exposed by the recovered core bundle. Empty/insufficient data states are displayed instead of invented values.

## Important alpha limitations
- This is still backed by the recovered compiled ZEKE core bundle, not yet the clean source reconstruction.
- Google Drive remains the only currently implemented storage connector in the recovered core.
- Google Calendar remains the only currently implemented calendar connector in the recovered core.
- Other provider choices are architecture/UI direction, clearly labeled as planned.
- Live AI provider success requires the user’s own credentials and provider availability.
- Automated Chromium screenshot acceptance could not complete in the build environment; syntax, asset references, static serving, and ZIP integrity were checked.


---

## Historical source: `PATCH_NOTES_v0.6.6.md`

# ZEKE v0.6.6 — Standalone Dashboard Shell Fix

## Purpose
This release fixes the v0.6.5 failure where importing the compiled legacy bundle remounted the old React UI into `#root` and prevented the mockup-aligned dashboard from becoming the actual visible application.

## Fix
- Added `assets/zeke-core-data-v066.js`, a side-effect-free copy of the recovered core bundle.
- Removed only the final legacy React mount from that core copy.
- Preserved the recovered storage/event/calendar/factor API exports for the new dashboard.
- `assets/zeke-app-v066.js` imports the side-effect-free core instead of the legacy UI bundle.
- `index.html` loads only the AI router and the new v0.6.6 dashboard app as visible application layers.
- The old compiled UI bundle remains in the package only as a historical dependency/reference and is not loaded by `index.html`.

## Acceptance checks performed
- JavaScript syntax check passed for the new app, side-effect-free core, and AI router.
- Verified the side-effect-free core contains no `createRoot(...#root...)` mount call.
- Verified all local assets referenced by `index.html` exist.
- Verified module-relative dependencies referenced by the new app/core exist.
- Verified the static server serves `index.html` and the referenced assets.

## Known limitation
Automated Chromium screenshot capture is blocked/hanging in the current build environment, so final browser visual acceptance must be performed on the deployed GitHub Pages build.


---

## Historical source: `MIGRATION_NOTES_v0.8.0.md`

# Migration Notes — v0.7.x to v0.8.0

ZEKE application updates should not replace user history.

## Repository continuity

v0.8.0 keeps the existing Google Drive `Project Zeke` repository structure and reads prior event, factor, discovery, action, preference, and AI metadata paths. The repository manifest moves to schema version 3 and preserves an existing `workspace_id`; if none exists, one is created once and retained.

New durable repository files include conversation history and import batch reports.

## Import behavior

Spreadsheet and JSON imports merge accepted records into the existing event repository. They do not replace the workspace. Likely duplicates are held for review when ambiguity remains. Missing cells are not converted into zeros.

## Deployment rule

Replace application files, not the user workspace. Keep a backup before alpha upgrades.


---

## Historical source: `RELEASE_NOTES_v0.40.4.md`

# ZEKE v0.40.4 Release Note Snapshot

**Build:** 2026.08.06.4  
**Lifecycle:** Generated compatibility snapshot

The cumulative release history is authoritative in `RELEASE_NOTES.md`. This snapshot exists so release tooling can bind exact package identity without reintroducing historical root-level release-note sprawl.

Sprint 4 consolidated documentation, archived historical snapshots, reconciled current authority and runtime identity, and prepared the package for Sprint 5 verification.


---

## Historical source: `RELEASE_NOTES_v0.40.5.md`

# ZEKE v0.40.5 RC1 — Verification Hardening

**Build:** 2026.08.06.5
**Status:** Release candidate; not final until user acceptance.

## Changes

- Reconciled outdated tests with adaptive activity schemas and the unified ZEKE mobile action.
- Added rendered verification for custom Rehabilitation/PT activity fields, including no mandatory weight.
- Fixed accessible naming for activity-entry and custom-activity close buttons.
- Hardened rendered workflow tests with bounded timeouts and current UI paths.
- Reconciled runtime, service-worker, governance, test, and package identity for RC1.

## Verification

- 18 applicable JavaScript regression suites passed.
- 3 real-data/workbook suites require `ZEKE_TEST_DATA_ROOT` and were not run as package-local passes.
- Governance negative controls passed.
- Project audit passed with 0 errors and 0 warnings.
- Rendered workflow, v0.40 milestone, and support-report browser tests passed.
- JavaScript syntax validation passed.

## Outstanding acceptance

- Live Google Drive reconnect and durable write/readback.
- Physical iPhone and representative Android testing.
- User acceptance of the deployed release candidate.


---

## Historical source: `RELEASE_NOTES_v0.41.0.md`

# ZEKE v0.41.0 RC1 — Fitness Intelligence & Clarity

**Build:** 2026.08.07.1  
**Parent runtime:** v0.40.5 · build 2026.08.06.5

## Fitness identity and progression

- Added exercise-family plus exact-variation metadata, equipment type, and load basis.
- Kept progression histories variation-specific so machine/dumbbell/barbell/Bowflex/band/cable loads are not merged.
- Added a user-reviewed historical identity workflow that preserves original exercise text and provenance.
- Added next-session targets directly to both direct activity entry and the multi-exercise workout logger.
- Targets use comparable history, reps/load, RPE/RIR when present, training gaps, pain, and PT/injury context.
- Added research/evidence access from progression guidance.

## PT / rehab

- Expanded shoulder/PT entries reflected in the user’s paper program.
- Expanded common abbreviations in display names while preserving shorthand in parentheses.
- Kept external rotation and internal rotation as separate loggable movements even if a paper plan groups ER/IR.
- Added flexible rehab fields and written form guides; verified movement images are shown only where available.

## Discover and Trends

- Removed the duplicated Questions card and empty system-bucket layout from Discover.
- Folded Pattern Lab into a secondary “Explore all patterns” drill-down.
- Added deterministic filtering of tiny-sample, cross-exercise, same-activity metric, and shared-time-trend pattern noise.
- Reoriented Trends & Analysis toward current state and comparable recent windows; lifetime change is secondary context.

## Dashboard / Today

- Removed the detached global-looking Dashboard time selector.
- Health-at-a-Glance and Trends now own independent local range selectors; Fitness retains its own range.
- Today hides when empty and distinguishes schedule-assumed medication doses from explicit confirmations.

## Trust / medication workflow

- Replaced technical duplicate-review language with a side-by-side comparison and direct user choices.
- Added medication-specific adherence modes: confirm each dose, assume as scheduled unless reported otherwise, or schedule-only/no individual dose tracking.
- Schedule-assumed doses are stored with explicit assumption provenance and can be corrected by the user.

## Data safety

The uploaded `events (3).json` was used only as read-only compatibility reference and is not modified by this package. Ambiguous historical equipment remains unspecified unless the user reviews it.


---

## Historical source: `RELEASE_NOTES_v0.42.0.md`

# ZEKE v0.42.0 RC1 — Longitudinal Intelligence & Ingestion

**Build:** 2026.08.11.1  
**Parent:** v0.41.0 RC1 · build 2026.08.07.1

## What changed in this package

### Longitudinal core
- Added a reusable longitudinal schema helper that normalizes point/interval records, preserves evidence class/provenance, creates a unified timeline projection, and can propose temporal-proximity relationships without claiming causation.
- Added generic retrospective-range parsing. Statements such as “adequate protein for each of the past 12 days” produce dated, user-confirmed nutrition assertions rather than one note on the entry date.
- Added explicit recognition of retrospective medication-adherence ranges. These are flagged for schedule reconciliation rather than fabricated into doses without checking the active schedule.
- Added structured user-reported vaccination, allergy immunotherapy, and blood-donation/context events.

### Dashboard
- Added a compact 14-day Timeline Snapshot generated only from real ZEKE/calendar records.
- Medication details are excluded from the dashboard timeline by default.
- Empty timeline states explicitly remain empty rather than displaying decorative/fake events.

### Ingestion architecture
- Added a deterministic-first document recognition engine with bounded classification for DEXA/DXA, labs, medication lists, imaging, vaccination records, and immunotherapy records.
- Added review-packet and source-reference-range structures. Classification is a proposal; commit remains a reviewed workflow.
- This foundation is designed for PDFs, screenshots (including patient portals), images, pasted text, and future structured imports. Browser-native screenshot vision/OCR is not falsely claimed as implemented in this static package; the recognition contract is now explicit for the AI/provider layer.

### Calendar privacy architecture
- Added explicit staged consent policy: connection consent and separate ZEKE-calendar creation/sync consent.
- Added per-category defaults and exact-event preview support. Medication and highly sensitive context default to never sync.
- This release defines/enforces the privacy contract in the client architecture; full Google Calendar write integration remains gated behind deployment/OAuth acceptance.

### Governance
- Extended the Constitution with longitudinal context, unified-schema, auditable-recognition, source-range, calendar-consent, truthful-visualization, and generalized-example principles.
- Consolidated the active next-step plan into `DEVELOPMENT_MEMORY/CONTINUITY_RECONCILIATION_v0.42.0.md` so older iteration records remain historical evidence rather than competing active instructions.

## Important boundary

This RC implements the schema/parser/UI foundations that can be truthfully tested inside the package. It does **not** claim that a static browser build can independently perform clinical OCR/vision or write a new Google Calendar without the required provider/OAuth deployment. Those workflows are represented by explicit contracts and privacy gates rather than simulated success.


---

## Historical source: `RELEASE_NOTES.md`

# ZEKE v0.41.0 RC1 — Fitness Intelligence & Clarity

**Build:** 2026.08.07.1  
**Parent runtime:** v0.40.5 · build 2026.08.06.5

## Fitness identity and progression

- Added exercise-family plus exact-variation metadata, equipment type, and load basis.
- Kept progression histories variation-specific so machine/dumbbell/barbell/Bowflex/band/cable loads are not merged.
- Added a user-reviewed historical identity workflow that preserves original exercise text and provenance.
- Added next-session targets directly to both direct activity entry and the multi-exercise workout logger.
- Targets use comparable history, reps/load, RPE/RIR when present, training gaps, pain, and PT/injury context.
- Added research/evidence access from progression guidance.

## PT / rehab

- Expanded shoulder/PT entries reflected in the user’s paper program.
- Expanded common abbreviations in display names while preserving shorthand in parentheses.
- Kept external rotation and internal rotation as separate loggable movements even if a paper plan groups ER/IR.
- Added flexible rehab fields and written form guides; verified movement images are shown only where available.

## Discover and Trends

- Removed the duplicated Questions card and empty system-bucket layout from Discover.
- Folded Pattern Lab into a secondary “Explore all patterns” drill-down.
- Added deterministic filtering of tiny-sample, cross-exercise, same-activity metric, and shared-time-trend pattern noise.
- Reoriented Trends & Analysis toward current state and comparable recent windows; lifetime change is secondary context.

## Dashboard / Today

- Removed the detached global-looking Dashboard time selector.
- Health-at-a-Glance and Trends now own independent local range selectors; Fitness retains its own range.
- Today hides when empty and distinguishes schedule-assumed medication doses from explicit confirmations.

## Trust / medication workflow

- Replaced technical duplicate-review language with a side-by-side comparison and direct user choices.
- Added medication-specific adherence modes: confirm each dose, assume as scheduled unless reported otherwise, or schedule-only/no individual dose tracking.
- Schedule-assumed doses are stored with explicit assumption provenance and can be corrected by the user.

## Data safety

The uploaded `events (3).json` was used only as read-only compatibility reference and is not modified by this package. Ambiguous historical equipment remains unspecified unless the user reviews it.

---

# ZEKE v0.40.5 RC1 — Verification Hardening

**Build:** 2026.08.06.5
**Status:** Release candidate; not final until user acceptance.

## Changes

- Reconciled outdated tests with adaptive activity schemas and the unified ZEKE mobile action.
- Added rendered verification for custom Rehabilitation/PT activity fields, including no mandatory weight.
- Fixed accessible naming for activity-entry and custom-activity close buttons.
- Hardened rendered workflow tests with bounded timeouts and current UI paths.
- Reconciled runtime, service-worker, governance, test, and package identity for RC1.

## Verification

- 18 applicable JavaScript regression suites passed.
- 3 real-data/workbook suites require `ZEKE_TEST_DATA_ROOT` and were not run as package-local passes.
- Governance negative controls passed.
- Project audit passed with 0 errors and 0 warnings.
- Rendered workflow, v0.40 milestone, and support-report browser tests passed.
- JavaScript syntax validation passed.

## Outstanding acceptance

- Live Google Drive reconnect and durable write/readback.
- Physical iPhone and representative Android testing.
- User acceptance of the deployed release candidate.

---

# ZEKE Release Notes
**Status:** Canonical, cumulative, human-readable release history  
**Current package:** v0.40.4 · build 2026.08.06.4

Version-specific release-note files are preserved under `docs/history/release-notes/` for audit compatibility. This document is the normal entry point for release history.

## v0.40.4 — Governance & Continuity

- Consolidated historical release notes into this living canonical document.
- Moved version-specific release-note snapshots into a clearly marked historical archive.
- Added canonical current-state, roadmap, known-issues, changelog, decision, pre-implementation, post-release, and documentation-map records.
- Updated the startup/handoff path so an unfamiliar developer can understand authority, runtime boundaries, verified status, and next work without this chat.
- Reconciled package identity after Sprint 3 so runtime version, startup screen, service-worker cache, and current governance records agree.
- No personal-record schema migration was introduced in this documentation-focused sprint.


---

# ZEKE v0.40.3 — Sprint 3 Workout Intelligence & User Control

Built on v0.40.2.

## Added
- Per-activity recommendation preferences: More, Balanced, Less, and Exclude.
- Clear explanations of how each preference affects recommendations.
- Persistent, reversible preference storage separate from workout records.

## Changed
- Excluded activities are hidden from recommendation-oriented activity views but remain available in All for management and history.
- Coach's Eye will not recommend an activity marked Exclude.
- Activity cards display non-neutral preference status.

## Preserved
- Specific activity relationship reviews.
- Evidence and limitations views.
- Form guides, favorites, activity-specific schemas, and provenance.

## Known limitation
Routine generation does not yet fully weight More/Less preferences. That integration is deferred to a later refactor.

---

# ZEKE v0.40.2 — Sprint 2: Adaptive Activity Schemas

This sprint builds on v0.40.1 and replaces fixed activity-entry assumptions with schema-driven fields.

## Highlights

- Custom activities can choose their own fields and whether each is required.
- Rehabilitation/PT activities no longer default to strength or require weight.
- Cheerleaders has a dedicated PT-friendly field set.
- Massage Chair has recovery-specific fields.
- Direct activity entry uses one shared schema for rendering, validation, saving, and provenance.

See `SPRINT_2_ACTIVITY_ARCHITECTURE_REVIEW.md` for verification and known limits.

---

# ZEKE v0.40.1 — Sprint 1: Unified Mobile Input & UI Density

This verified incremental package builds directly on v0.40.0. It prioritizes Talk to ZEKE on mobile, removes gym-only framing from the central mobile action, tightens whitespace, and improves information density without changing the underlying activity architecture.

---

# ZEKE v0.40.0 Release Notes

**Build:** 2026.08.03.1  
**Release label:** Trust, Mobile, Dashboard & Fitness Milestone

## Data integrity and repair

- New dashboard review status and Repair Center.
- Detects supported exact duplicates, known spreadsheet legend artifacts, implausible sleep, zero-as-missing heart rate, malformed paddling fields, answered medication questions, duplicate discoveries, and stale sparse-data discoveries.
- Shows the real-world issue, evidence, recommendation, and confidence before action.
- Creates a provider-backed integrity backup before approved mutations.
- Preserves provenance and correction history; does not invent missing values.
- Adds in-session undo and duplicate-write prevention.

## Dashboard and mobile

- New lighter dashboard composition based on the approved mockup.
- Story cards, Health at a Glance, weekly expectations, Coach’s Eye, truthful recent activity, and review status.
- Visuals use recorded points only; routes and trends are omitted when unsupported.
- Mobile-wide responsive navigation and quick logging; no separate gym-only application.
- Touch-friendly modals, sticky actions, clear completion/exit paths, and direct form-guide access.

## Fitness knowledge and planning

- 102 equipment-aware exercise/activity knowledge objects.
- 12 built-in routine templates.
- Weekly planner asks expected remaining gym and home sessions without inferring commitment from an open calendar.
- Activity-specific fields distinguish strength, cardio, sport, rehab, mobility, recovery, and functional activities.
- Machine, Bowflex, dumbbell, barbell, Smith, cable, and bodyweight variations remain distinct.
- “Glute Lift” is retained as a separate machine identity rather than being merged into Leg Press; exact machine style can be confirmed later.
- Rich guides include setup, movement, mistakes, breathing, mind-muscle cues, modifications, evidence metadata, and source/license media where available.

## Deployment

Replace the complete verified runtime set rather than selecting files by modification date. The service-worker cache is `project-zeke-v0.40.0-20260803.1`. See `DEPLOYMENT_MANIFEST_v0.40.0.md`.

## Known limitations

- Live Google Drive repair and physical-device acceptance require deployment testing.
- Remote exercise images require network access and may become unavailable; written fallbacks remain.
- Deep manual curation is strongest for the high-use core set; lower-priority objects need ongoing evidence review.
- Advanced periodization, watch interfaces, and additional storage providers remain future work.

---

# ZEKE v0.31.0 — Mobile Workout Visual Fidelity and Form Guides

## Implemented
- Reworked mobile workout entry styling to follow the approved mockup hierarchy, cards, icons, spacing, and prominent Gym navigation.
- Preserved desktop ZEKE and scoped the new styling to phone-width workout entry.
- Integrated the reviewed 17-guide Wikimedia Commons library with per-image attribution and exercise-specific Setup, Movement, Common Mistakes, and Tips.
- Form Guide opens as a 75–80% bottom sheet and supports an expanded image view.
- Added transactional Save Sleep feedback and a provider-agnostic reconnect dialog on storage failure.
- Updated splash, runtime, and continuity version references.

## Honest limitation
The requested additional 20 common-exercise photo set is not fully curated in this package. Seventeen reviewed photo guides are included; unsupported exercises keep written fallback guidance and explicitly avoid unrelated images. This release does not claim those remaining photos are complete.

---

# ZEKE v0.30.0 — Mobile Workout Entry and Health Conditions

**Build:** 2026.07.26.1  
**Baseline:** ZEKE v0.29.0 Continuity-Reconciled

## Implemented

- Reframed “Gym Mode” as ZEKE’s mobile workout-entry experience rather than a disconnected subsystem.
- Added a prominent **Gym** action to the phone bottom navigation while preserving the desktop Fitness experience.
- Added a clear **Log exercise or activity** menu with three paths: enter one activity, start from a routine, or repeat the last workout.
- Added a common-exercise chooser with full-library search and custom-activity creation; activities are added one at a time.
- Preserved a visible, editable effective date in mobile workout entry and direct activity entry.
- Kept elapsed workout time out of the interface.
- Added provider-backed custom activity and routine preferences through the existing preference repository.
- Added a routine manager. Routines remain reusable templates and do not become historical workout units.
- Added a dedicated **Health → Conditions → Add condition** workflow with visible/editable date, status, source, optional resolution date, clinician/facility, and notes.
- Retained **All** alongside Week, Month, Quarter, 6 Months, and Year in applicable chart controls.
- Preserved truthful workout states: prefilled or routine-loaded values are not saved until the user confirms a storage write.
- Preserved blank optional fields such as pain, RPE, rest, and notes.

## Media limitation

Form Guide entries continue to show only images already present in the reviewed guide library. ZEKE does not substitute generic gym photographs for exercises without a verified image. Expansion provides a larger instructional view and movement guidance; a fully curated multi-image sequence for every exercise remains future content work.

## Verification boundary

Static JavaScript syntax, release-contract checks, file integrity, and ZIP integrity were verified. Physical iPhone/Android behavior and remote Creative Commons image delivery were not available for direct testing in this environment.

---

# ZEKE v0.29.0 — Gym Mode Recovery and Trusted Entry

**Build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2

This runtime rebuilds Gym Mode from the v0.27.2 recovery baseline while preserving the broader desktop ZEKE experience. The 2026.07.25.2 continuity reconciliation changes documentation only and does not alter runtime files.

## Implemented

- Mobile-focused Gym Mode with visible editable workout date.
- Start from Routine or Enter Exercises, with common exercises, library search, custom exercise entry, and one-at-a-time addition.
- Reorderable exercise list and explicit Suggested / Not started / In progress / Saved states.
- Primary fields prefilled from the most recent confirmed entry; optional RPE, pain, rest, and notes remain blank.
- Per-set editable weight and reps.
- Qualitative readiness categories with a numberless gauge and written explanation.
- Apply Recommended Progression changes only the unsaved form.
- Progression history remains inside Gym Mode.
- Strength/cardio-specific entry fields; cardio intensity may be blank or a range.
- Saving to storage → Saved language; no Gym Mode pre-save Saved or Synced status.
- End Workout exits the current Gym Mode visit without preventing later same-day entries.
- Local temporary recovery for unfinished Gym Mode entries in normal browsing.
- Form Guide bottom sheet with a reviewed-image subset and truthful no-verified-image fallback.

## Partial or outstanding

- The readiness rule is a simple heuristic, not yet the reviewed research-supported methodology.
- Tapping the guide image changes the expanded guide state but does not yet display a real multi-image movement sequence.
- Complete Form Guide media review coverage is not established.
- The secure cross-device AI credential vault is not implemented.
- Additional storage-provider adapters and a proven provider-neutral data layer are not implemented.
- Provider-backed routine management, multi-segment sleep, cross-domain editable dates, and separate desktop Workout Entry remain future work.
- Physical-device and deployed-provider acceptance were not performed in the build environment.

---

# ZEKE v0.28.1 — Exercise-Specific Form Guides

Build: 2026.07.23.0418

## Added

- Added a reviewed, exercise-specific Form Guide library for 17 common strength and cardio activities.
- Each reviewed guide now includes targets, equipment, level, setup, movement, common mistakes, practical cues, and a safety boundary.
- Replaced the generic placeholder panel with a real tabbed bottom sheet that keeps the user inside the exercise screen.
- Added licensed or public-domain photographs with visible creator, source, and license attribution.
- Added a clear offline/image-load fallback rather than silently leaving a broken image.
- Added a truthful fallback for unmatched custom exercises; it does not present generic content as reviewed for the exact exercise.

## Media delivery

The photographs are referenced from Wikimedia Commons rather than copied into this ZIP. This keeps the release small and preserves the source/license link beside each image, but the photos require an internet connection. Written guides remain available when offline.

## Safety boundary

Form Guides are educational. They are not diagnosis, medical clearance, physical therapy, or individualized rehabilitation. Injury-aware programs remain conservative planning examples and must respect clinician restrictions.

## Data and structure

No workout-storage schema or directory was changed in this patch. Confirmed entries continue to use the v0.28.0 event-ledger and connected-preferences paths. Blank values remain null/unknown rather than zero.

---

# ZEKE v0.28.0 — Workout Programs & Trusted Gym Logging

Build: 2026.07.23.0005

## What changed

- Added reusable Workout Programs, including built-in general routines, injury-aware examples, and user-created programs.
- Added Choose Program and Build Program controls to Today's Workout.
- Program selection creates an editable workout draft; it does not mark exercises complete.
- Exercise state now distinguishes not started, draft, and saved.
- Added explicit Cancel Workout and Finish Workout actions.
- Confirmed exercise entries are written to the existing workout event ledger with program identifiers, transaction provenance, and nulls for unentered values.
- User-created programs are written to the connected ZEKE preferences repository through the existing data layer.
- Finishing creates a workout-session summary event; merely opening or exiting Gym Mode does not.
- Added a deterministic readiness score based on confirmed recent sessions, pain, RPE, and load progression.
- Made Progression open the existing activity history view.
- Entering 0 repetitions removes that set; a blank field remains unknown.

## Safety and limits

Injury-aware built-in programs are conservative planning examples, not medical clearance, diagnosis, physical therapy, or individualized rehabilitation. Form Guide licensed photography and fully reviewed exercise-specific content remain pending rather than being represented as complete.

---

# ZEKE v0.27.3 — Audited Recovery Build

This release was rebuilt directly from the untouched v0.26.1 ZIP.

## Changes
- Mobile Today’s Workout workspace and Exercise Workspace
- Set-by-set reps with “Copy Set 1 to all”
- Coach’s Eye, progression, last-workout context, save/sync states
- Form Guide bottom sheet
- Guide Model settings and curated Creative Commons image metadata/attribution support
- Mobile viewport and safe-area improvements

## Packaging integrity
- All untouched v0.26.1 ZIP entries retain their original ZIP metadata and timestamps.
- Only genuinely modified or newly added files receive the v0.27.3 build timestamp.
- See `PACKAGE_AUDIT_v0.27.3.json` and `PACKAGE_AUDIT_v0.27.3.md`.

---

# ZEKE v0.27.2 — Exercise Screen Mockup Fidelity

**Build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1

The v0.27.2 runtime implements the exercise-screen mockup work described in the original release. The July 25 governance reconciliation preserves this runtime unchanged, establishes v0.27.2 as the recovery baseline, and records later binding decisions without claiming implementation.

The selected exercise replaces the workout list on screen. The hierarchy is: minimal header, Coach’s Eye, progression, last time, today’s entry, explicit Save Exercise feedback, and an in-place Form Guide bottom sheet over the dimmed exercise screen. Vertical scrolling is allowed; horizontal page scrolling is prohibited.

---

# ZEKE v0.27.0 — Gym Entry Mockup Fidelity

**Build:** 2026.07.22.3

## Included

- Full-window Gym Entry Mode based on the approved mockup hierarchy.
- Vertical scrolling without horizontal page scrolling.
- Today's Workout list and focused Exercise Workspace.
- Set-by-set strength logging, completion checkboxes, Add Set, and Copy Set 1 to all.
- Coach's Eye, progression, last-workout summary, Today's Entry, notes, and Form Guide.
- Edge-to-edge Form Guide bottom sheet.
- Adult-only, fully clothed, diverse guide-media policy; unreviewed images are withheld.
- Continuity documents updated in their established locations.

## Preserved

- v0.25.2 direct Save Workout safeguards.
- v0.26.1 Fitness navigation, Dashboard state, relationship evidence, and Coach evidence behavior outside the approved scope.

## Known limits

The complete reviewed guide-image library and physical-device mockup comparison remain unfinished environment work.

---

# ZEKE v0.26.1 — Fitness Navigation & Evidence Hotfix

**Build:** 2026.07.22.2

This hotfix repairs the specific navigation, disclosure, relationship-evidence, and coaching-evidence regressions reported after v0.26.0.

## Fixed

- Activity Library now opens on Favorites rather than a previously persisted category.
- The overflowing activity-type button strip has been replaced by a responsive view selector and search field.
- Dashboard Trends & Analysis and Private health summary disclosures remain open through normal rerenders.
- Review relationships is specific to the selected activity and no longer substitutes an unrelated generic pattern.
- Coach considerations now provide a “Why this? Research & evidence” view with the user-data trigger, ZEKE interpretation, direct research links, and limitations.

## Relationship data

Relationship screening can now pair sleep duration with activity-specific load, repetitions, duration, RPE, pain, and session count. It still requires at least five paired dates and never presents correlation as causation.

## Preserved

The v0.25.2 mobile Save Workout hotfix and the full v0.26.0 daily-briefing/Health architecture remain in place.

---

# ZEKE v0.26.0 — Daily Briefing & Health Architecture

**Build:** 2026.07.22.1  
**Implementation baseline:** v0.25.2 Mobile Workout Save Hotfix  
**Regression reference:** v0.23.0 Conversation Intelligence / Trusted AI Foundation

## Release intent

This release addresses the concerns raised during the July 21–22 review as one integrated update. It preserves the mobile workout-save repair from v0.25.2 while correcting Dashboard, sleep, Fitness, medication, profile, goal, evidence, and navigation regressions.

## Dashboard and navigation

- Replaced the sparse/shared-height Dashboard composition with an explicit daily-briefing flow.
- Added Health at a Glance, followed by one compact row for Today’s Actions, Coach’s Eye, and Upcoming.
- Gave expandable Trends & Analysis a full-width row so expansion does not create empty neighboring columns.
- Increased card rounding and reduced coupled white space.
- Health at a Glance metrics are selected from Health and can be reordered with explicit controls.
- Preserved **Questions for You** as the visible conversational language.
- Moved Discover into primary navigation.
- Kept Labs, Measurements, Medications, Nutrition, Sleep, Symptoms, and Conditions inside Health rather than as global-sidebar peers.
- Removed the duplicated Provider View concept from the active application.

## Health and sleep

- Sleep confirmed through Talk to ZEKE now uses the same semantic Health path as direct entry and appears in Recent Health Record.
- Deterministic and direct sleep saves share wake-date fields.
- Replaced fragile free-text sleep-time entry with hour, minute, and AM/PM pull-downs.
- Added sleep-specific editing for date, start, end, quality, interruptions, and notes.
- Added reversible Remove controls for Recent Health Record. Removal creates an audit-preserving undo event instead of silently deleting history.
- Recent Health Record and Dashboard search recognize sleep as a first-class Health record.

## Fitness

- Preserved the v0.25.2 direct mobile Save Workout click path, submit fallback, visible status, and error handling.
- Fitness opens on Favorites; when none are selected, it clearly shows the most-used fallback and explains how to favorite an activity.
- Activity cards are genuinely clickable and open focused activity details, replacing dead or ambiguous “view activity” behavior.
- Renamed the ambiguous “+ Add activity” affordance to **+ Create activity type**.
- Strength, cardio/stair, walking, rehabilitation, mobility, recovery, sport, and functional views show only relevant fields.
- Stair steps, ambulatory/walking steps, distance, duration, average heart rate, level/intensity, load, repetitions, and sets remain distinct fields.
- Workout history supports reversible Remove and a focused incomplete-record view.
- Added a provider-backed Goals panel. Goals may be reviewed structurally without AI or optionally reviewed by a connected AI. AI review is advisory, cannot save or alter the goal, and is not medical clearance.

## Medications and supplements

- Today’s medication actions now ask for an explicit outcome: **Taken today**, **Missed today**, or **Not taken yet**.
- Only a confirmed taken event marks a medication action complete.
- Added reviewed batch backfill for past medication doses using a date range and daily/weekly schedule. The preview lists dates, skips existing matching doses, and saves with batch provenance.
- Added visible recurring-schedule success and failure feedback; corrected the schedule-save path that could reference an undefined label.
- Kept the monthly medication/supplement review separate from individual dose completion.

## Profile portability

- The user profile now lives in provider-backed workspace preferences rather than an app-local personal profile record.
- A legacy local profile is migrated into the connected workspace when possible and then removed from the old local key.
- Device-local operational preferences may remain local; durable personal profile content follows the user-owned storage boundary.

## Evidence and recommendations

- Coach’s Eye contains actionable considerations only and may legitimately say that nothing needs attention.
- Trends & Analysis remains descriptive and may identify changes that require no intervention.
- Evidence review shows observations, limitations, dated records, related actions, Pattern Lab access, and a focused PubMed topic search.
- Recommendations remain cautious considerations grounded in available user data and research context rather than clinical directives.

## Interaction reliability

- Added lightweight global search across records, conversation, and discoveries.
- Limited render-state restoration to the app root so a delayed render cannot overwrite data being typed into an open modal.
- Preserved direct, visible success/failure outcomes for meaningful saves.

## Documentation and governance

The existing ZEKE Constitution was edited directly. Architecture, feature status, handoff, project state, gate, decision log, error log, registry, iteration record, test report, and release evidence were reconciled for this release. No parallel constitution was created.

## Deliberately deferred

- Broad session-based mobile Fitness redesign remains deferred until user-reviewed mockups exist.
- Live Google Drive, Calendar, AI-provider routing, deployed service-worker replacement, protected real-workbook, and physical-device/accessibility verification remain environment checks rather than package-local claims.

---

# ZEKE v0.25.2 — Mobile Workout Save Hotfix

## Fixed
- Reworked Gym Logging save handling for mobile browsers.
- Save now responds immediately with “Checking…” and then “Saving…”.
- Added a direct click handler in addition to form submission handling.
- Moved duplicate-check failures into a non-blocking warning path.
- Added a safe transaction-ID fallback for browsers without `crypto.randomUUID()`.
- Any save failure now appears visibly inside the workout form instead of failing silently.

## Scope
This is a focused hotfix based on a real mobile failure reported against v0.25.0. It does not attempt additional dashboard redesign work.

---

# ZEKE v0.25.1 — Trust & Usability Restoration

This corrective release responds to direct usability review of v0.25.0.

## Restored and corrected
- Removed the duplicated, premature Provider View.
- Preserved Dashboard as the primary health overview.
- Added collapsed-by-default medication and diagnoses/conditions summaries for privacy.
- Fitness now starts on Favorites; when none are selected, ZEKE clearly shows most-used activities as a temporary fallback.
- “Review evidence” now opens a focused evidence review rather than a generic Pattern Lab page headed by an internal identifier.
- “+ Add activity” for defining a reusable activity is now “+ Create activity type.”
- Splash screen, runtime fallback, service worker cache, and continuity metadata now agree on v0.25.1 build 2026.07.21.3.

## Still requiring environment review
- Physical-phone layout and tap flow
- Live storage and AI connections
- Real data rendering of collapsed private summaries
- Browser/service-worker update behavior after deployment

---

# ZEKE v0.25.0 — Adaptive Fitness & Provider Preview
**Build:** 2026.07.21.2

## Integrated changes
- Added activity-specific Fitness detail tables so strength, cardio, rehabilitation/PT, mobility, recovery, sport, and functional records show only meaningful columns.
- Added a mobile-friendly Gym Logging entry point with larger fields and a one-click **Repeat last workout** workflow that preloads the previous session for quick editing.
- Reframed progression output as cautious **considerations** rather than recommendations.
- Added Provider View with PT, primary-care, and orthopedic focuses, a 30-day activity and pain snapshot, current activity details, visit questions, and browser print/PDF support.
- Expanded Profile settings to distinguish preferred name, pronouns, gender identity, optional sex assigned at birth, and optional clinically relevant anatomy/physiology context.
- Kept Dashboard as home and retained the existing bottom mobile navigation, review workflow, provenance, duplicate detection, and user-owned storage model.
- Revised the existing Constitution and Architecture rather than replacing them.

## Beta boundary
Profiles and provider presentation are preview-ready for local testing. Secure centrally administered AI for multiple independent beta users is not complete in this static package and requires a protected proxy/backend before outside accounts use a shared key.

---

# ZEKE v0.24.0 — Trust, Conversation & Workflow

**Build:** 2026.07.21.1

## Added

- Durable workflow transactions with explicit goals, missing decisions, proposed changes, save/duplicate/AI state, actions, history, and outcome.
- User-visible workflow status in Talk to ZEKE.
- Conversation Memory: Waiting for You and Things I’ve Learned.
- Context-specific medication schedule editor.
- Settings-based Support & Improvement Report workbook with privacy controls.
- Unresolved-interaction, workflow, AI, correction, feedback, technical, and audit diagnostics.
- Safe Talk attachment routing for supported structured files.

## Changed

- Review items now show original information, ZEKE’s understanding, proposed record/action, why it matters, and what ZEKE will do.
- Buttons describe the action they complete rather than generic confirmation where practical.
- Deferral, dismissal, duplicate, undo, and failure responses state whether data changed. “Later” preserves questions in Waiting for You and moves them behind newer questions.
- Pattern language says values moved in the same or opposite direction instead of implying an increase.
- Fitness time-period controls and insight layout use less space.
- Current static architecture and legacy bundles are explicitly documented.
- Existing clarification questions can now be updated or resolved without the idempotency guard mistaking the update for a duplicate.
- Open workflows restore common pending state after refresh and provide a visible Resume action.
- Diagnostic export controls now retain privacy, date-range, and clear-after choices across background renders.
- Previously inert metric overflow buttons now open the relevant metric detail; duplicate review-pill IDs were replaced with consistently bound review actions; icon-only workout controls now have accessible names.

## Safety and privacy

- Full workflow content is stored in the user-owned ZEKE repository.
- Local workflow persistence is minimized to operational metadata.
- Support exports remove credentials and offer Full developer, Technical only, and Anonymized modes.
- Calendar events remain context, not proof of attendance; scheduled medication remains expectation, not proof of a dose.

## Known environment boundaries

Live Drive, Calendar, external AI, service-worker deployment, protected workbook, download behavior on every browser, and physical-device accessibility are not established by local package tests.

---

# ZEKE v0.23.1 — Health & Fitness Workflow Stabilization

**Build:** 2026.07.20.1

## What changed

### Sleep and confirmation
- Added deterministic parsing for explicit sleep periods and duration-only sleep reports.
- A typed affirmative response to a pending save now completes that transaction before general interpretation.
- Added direct structured sleep logging from the Health Library Sleep tile.
- Added saved-record navigation and undo support.

### Health records and review
- Sleep is displayed as its own health-event type.
- Recent Health Record and dashboard evidence include sleep and Potential Health Events.
- Review Questions now show the original information, concrete proposal, and exact decision.
- Metric deltas are described as change over the selected period, not as reference-range status.
- Exact display duplicates are collapsed while source records remain preserved.

### Fitness
- Activity tiles consistently select and label a comparable numeric metric or explain why no chart is available.
- Flat trends render rather than disappearing.
- Coach’s Eye and Activity Library use one shared recommendation.
- Initial workout logging and workout editing expose the same optional RPE, pain, technique, notes, and injury/PT context fields.

### Insights, calendar, and navigation
- Replaced internal parsing terminology with concrete observations and useful next actions.
- Added defined-use health follow-up prompts for recent health-related calendar events; calendar presence is never proof of attendance or completion.
- Added a durable Potential Health Events context stream for future relationship analysis.
- Moved Labs into Health and Pattern Lab under Insights.

### Layout
- Rebuilt the dashboard as independent vertical stacks and improved narrow-column coaching readability.

## Compatibility and safety
- Canonical storage and user ownership are unchanged.
- New fields and records are additive.
- AI remains advisory; deterministic code controls record writes.
- No migration is required to roll back to the uploaded v0.23.0 package.

---

# ZEKE v0.23.0 — Conversation Intelligence & Trusted AI Foundation

**Build:** 2026.07.19.5

## Implemented

- Recent Health Record Review/Edit opens a record-specific editor instead of routing back to the Dashboard.
- Health-record corrections preserve prior values through the existing correction-history path.
- Pending correction flows are closed when an unrelated new health entry is detected, preventing stale edit state from capturing later messages.
- Direct affirmative replies such as “sure” are treated as answers to the active ZEKE question rather than as new records.
- Conversation transcript now renders date separators and message times.
- Added a provider-neutral background-consultation envelope with a fixed outcome allowlist. External AI output is treated as untrusted and cannot request execution, tools, commands, or unauthorized outcomes.
- Dashboard Health at a Glance rail is bounded-fluid rather than fixed-width.
- Added system-wide content-driven responsive composition rules so unrelated sections do not share forced row heights.

## Safety boundary

External AI can only return validated advice within an allowed outcome list. ZEKE retains exclusive authority over record writes and external actions. Prompt content is separated into trusted task instructions and untrusted user data.

## Known limitations

- This is the first vertical slice of the orchestration architecture, not the complete long-term Conversation Engine.
- The active-question detector currently uses explicit question/metadata cues and should be expanded with durable topic objects in later releases.
- Record-specific editing currently covers health measurements/labs and existing workout editing; medication-specific structured editing remains separate.

---

# ZEKE v0.22.2 — Responsive Stabilization, Activity Foundation & Continuity Reconciliation

**Build:** 2026.07.19.4

## Application work inherited from build 2026.07.19.2
- Stabilized Dashboard and Fitness layout structure using independent content-sized rows.
- Added a canonical activity registry shared by library and structured entry, including Chores & Functional Activity.
- Added modality-aware activity summaries and non-strength metrics.
- Added Health Favorites with a separate versioned preference key.
- Repaired Pattern Lab focus propagation and generic-navigation stale-focus clearing.
- Added editing for one workout record at a time, preserving prior state in correction history and refreshing derived views.
- Extended integrity coverage to active runtime files.

## Build 2026.07.19.3 continuity correction
- Reconciled README, Architecture, Feature Status, Handoff Brief, Backlog, Decision Log, Development Error Log, Comprehension Checkpoint, Runtime Diagnostics, Project Health, Project State, gates, registry, release notes, test report, and checksums.
- Recorded explicit boundaries for activity identity, migration, correction history, and asset cleanup.
- No additional user-facing application feature was added.

## Explicitly deferred
Global rename, duplicate identity merge, bulk/ambiguous historical migration, full correction-history browser/global undo, and event-sourced replay.

## Verification boundary
Package integrity and structural regressions are verified locally. Live providers, service-worker deployment behavior, arbitrary-width deployed rendering, and physical-device accessibility remain environment-dependent.

## Build 2026.07.19.4 — dashboard-only acceptance repair

A deployed screenshot showed that the prior responsive repair still allowed the Health at a Glance rail to determine shared grid-row height, leaving a large blank area in the main Dashboard. The Dashboard markup now has two independent flows: a main content stream and a separate health rail. This build intentionally adds no other feature or behavior change.

---

# ZEKE v0.22.1 Release Notes

**Build:** 2026.07.19.1

## Preserved application features
- Persistent desktop navigation rail; compact tablet rail; mobile bottom navigation with More overflow.
- Fluid layout rules that adapt continuously rather than only at named breakpoints.
- Coach’s Eye separated into Now, Next Session, and Patterns, using abbreviated coaching.
- Full exercise evidence remains in activity tiles; repeated preview advice disappears while a tile is expanded.
- Coaching chart reduced to a compact evidence view.
- Activity links preserve context when opening the exercise, Pattern Lab, or Talk to ZEKE.
- Preferred name is optional and user-profile-backed with a neutral fallback.

## Continuity repairs
- Corrected README release naming and release-gate status.
- Replaced stale Project Health identity and summary.
- Normalized artifact-registry release/build fields and lifecycle labels.
- Added a current v0.22.1 iteration record while retaining v0.22.0 as historical feature evidence.
- Strengthened audits and negative controls for stale continuity metadata and contradictory status.
- Updated handoff, state, gate, tests, checksums, and independent-review instructions.

## Verification limits
Credentialed providers, deployed-origin rendering, continuous browser-width dragging, and real-device mobile behavior remain user/environment verification items.

---

# ZEKE v0.22.0 Release Notes

**Build:** 2026.07.18.3

## Implemented
- Persistent desktop navigation rail; compact tablet rail; mobile bottom navigation with More overflow.
- Fluid layout rules that adapt continuously rather than only at named breakpoints.
- Coach’s Eye separated into Now, Next Session, and Patterns, using abbreviated coaching.
- Full exercise evidence remains in activity tiles; repeated preview advice disappears while a tile is expanded.
- Coaching chart reduced to a compact evidence view.
- Activity links preserve context when opening the exercise or Pattern Lab.
- Preferred name moved to an optional user profile with a neutral fallback.

## Verification limits
Credentialed providers, deployed-origin rendering, continuous browser-width dragging, and real-device mobile behavior remain user/environment verification items.

---

# Release Notes — ZEKE v0.21.0

**Build:** 2026.07.18.2

## User-facing improvements
- Fitness Activity Library tabs: Frequent, Favorites, Strength, Cardio, Mobility, Recovery.
- Frequent activities are ranked using recent use and session count.
- Activity cards are compact by default and expand for recent details and coaching.
- Stair climber is now treated as a cardio activity rather than a standalone top-level section.
- Coach’s Eye is compact by default and expands for evidence, recent sessions, and actions.
- Replaced unclear deeper-analysis language with View full analysis, Ask ZEKE, and Open in Pattern Lab.
- Health adopts a Frequent, Measurements, and Labs library with expandable items.
- Proactive Health insights remain visible while Pattern Lab handles deeper analysis.
- Added local runtime diagnostics export and clearing controls in Settings.

## Continuity and release discipline
- Single runtime version source is exposed through both `ZEKE_VERSION` and `ZEKE_BUILD`.
- Current-state, gate, iteration, release, and audit records identify this release consistently.
- Development errors, release evidence, runtime diagnostics design, rejected paths, and backlog remain separated by purpose.

## Not yet verified live
Google Drive, Calendar, AI providers, and deployed-origin rendering require environment testing.

---

# ZEKE v0.20.5 — Continuity Baseline Cleanup & Enforcement Release

Build 2026.07.18.1

This release cleans and reconciles the entire active handoff baseline. It fixes the Constitution's obsolete Ask/Tell rule, replaces stale v0.20.3 authority records, introduces an artifact registry and machine-readable governance rules, strengthens the audit, adds negative-control tests, clarifies backlog prerequisites, and converts competing startup files into redirects.

No unrelated product feature or user-data change was included.

---

# ZEKE v0.20.4 — Continuity Framework & Medication Clarity

Build 2026.07.17.13

This corrective release preserves v0.20.3 data-compatibility work while preventing the medication class term “GLP-1” from being treated as a unique synonym for tirzepatide. Class-only natural-language entries now request medication identity clarification rather than creating a tirzepatide event.

The release also introduces a portable development operating framework: one root entry point, rapid orientation, comprehension proof, historian/reviewer/investigation/findings/approval phases, anti-wandering rules, artifact lifecycle and authority controls, rejected-path memory, precise verification language, and an executable internal consistency/dead-link audit.

Live Google services and AI providers still require verification in the deployed environment.

---

# ZEKE v0.20.3 Release Notes

**Build:** 2026.07.17.12  
**Release:** Development Gate & Data Compatibility Release

## Development continuity
- Adds `00_AI_START_HERE.md`, a mandatory stop-and-approval gate for every new development conversation.
- Adds a machine-readable development authorization record.
- Records the startup-gate failure and new prevention rules in the cumulative error log.
- Requires future handoffs to consult accessible prior ZEKE conversations for binding user decisions while independently verifying earlier assistant claims.

## Workbook safety and compatibility
- Preserves the exact-cell provenance created by the v0.16.3 recovery.
- Recognizes all 188 verified workbook observations in the supplied repository without rewriting their IDs, source keys, dates, or provenance.
- Adds a read-only **Run preflight** action in Settings.
- Stops synchronization before writing when conflicts or unsupported changes are detected.
- Removes automatic workbook synchronization from ordinary Talk to ZEKE saves and corrections.
- Requires read → normalize → compare → preview → explicit commit → persisted verification, with an append-only transaction journal.
- Archives the previously connected source workbook before an approved replacement, while continuing to regenerate only a separate event mirror after verification.

## Medication reliability
- Separates **taken**, **missed**, **not taken yet**, and uncertain medication mentions.
- Requires a known daily or weekly schedule before expanding a date range.
- Shows every proposed backfill date before confirmation and identifies matching existing records that will be skipped.
- Uses canonical medication identities for matching while retaining original wording.
- Stores confirmation preferences in the user-owned ZEKE repository rather than browser-only storage.
- Prevents null schedule records from appearing as January 1, 1970.
- Prevents missed, not-yet-taken, pending, or uncertain medication records from completing Today’s Actions.
- Repairs damaged word-boundary characters in concept matching and activity-name formatting.

## Review workflow
- Prevents concurrent startup routines from creating duplicate open clarification questions with the same question key.
- Preserves existing duplicate records as audit history; this release does not silently delete user data.

## Verification
- Passed syntax, JSON, structural, medication, question-idempotency, workbook transaction, source-backup, and real-data idempotency regressions.
- Rendered the dashboard at 1440, 1024, 768, and 390 pixel widths with no document-level horizontal overflow.
- Live Google Drive, Calendar, AI-provider, and deployed-origin behavior remains a deployment test.

## Deployment
Deploy as a full replacement. Do not merge individual files into an older release. Read `README.md` and verify v0.20.3 / build 2026.07.17.12 after deployment.

---

# ZEKE v0.20.2 Release Notes

Build 2026.07.17.11

This release contains a structural dashboard whitespace repair and the first complete built-in development handoff system. See `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.2.md` for exact scope and verification.

---

# ZEKE v0.20.0 — Responsive Polish Release

## Included
- Rebuilt Dashboard composition so major sections form independent responsive rows rather than two unequal vertical columns.
- Health at a Glance now spans the available width and reflows its metric tiles.
- Insights and Today’s Actions share a priority row and stack cleanly at narrower widths.
- Coach’s Eye and I’ve been thinking share a balanced guidance row.
- Evidence panels render only when they have usable content.
- Empty chart canvases no longer reserve fixed space. Cards expand when enough verified data exist.
- Coach’s Eye now displays “Not logged” when pain was not recorded.
- Fitness workspace and Activity Library reflow across desktop, narrow desktop, and mobile widths.
- Retains v0.19.1/v0.19.2 medication routing, concept search, normalization, and reliability fixes.

## Deferred
Dashboard drag-and-drop, saved layout profiles, pin/auto behavior, and import/export layouts remain planned for v0.21.0 so the responsive foundation can be tested first.

---

# ZEKE v0.19.2 — Dashboard Correction

This corrective release addresses the mismatch visible in the v0.19.1 screenshot.

- Removed the oversized ZEKE Briefing hero from the Dashboard.
- Replaced it with a compact, action-oriented Insights tile.
- Corrected the desktop Dashboard grid so the first column is no longer left blank while Health at a Glance occupies only the right side.
- Replaced the unexplained `?` and diamond header controls with labeled Help and Status buttons while preserving their existing behavior.
- Preserved the v0.19.1 medication, concept-search, and Fitness reliability changes.

---

# ZEKE v0.19.1 — Interaction & Fitness Reliability Patch

## Fixed
- Medication/supplement logging now opens a direct structured form instead of routing to Dashboard.
- Per-item dose confirmation preferences are saved.
- Medication backfill transitions into Talk to ZEKE with explicit preview/duplicate/confirmation instructions.
- Fitness activity tiles now expose period-specific detail on hover, keyboard focus, and tap.
- Fitness activity groups and Coach's Eye now use the selected chart period.
- Common exercise-name variants are normalized invisibly and aggregated into the same chart/analysis group.
- Fitness history and summaries now respect the selected period.
- Responsive chart and panel sizing is hardened for narrower windows.
- Life & Symptoms includes a substantially larger symptom vocabulary and improved plural/alias ranking.
- Low-confidence concept searches can consult connected AI for structured, non-diagnostic interpretation.
- Ambiguous question/diamond navigation icons were replaced with clearer symbols.
- Expanded modal actions remain reachable without scrolling back to the top.

## Data integrity
- Original workout records remain unchanged; normalization occurs in the presentation and analytics layer.
- AI suggestions do not write canonical concepts automatically.
- Backfill remains a confirmed bulk operation through Talk to ZEKE.

---

# ZEKE v0.19.0 — Concept Search & Private Vault Preview

Build: 2026.07.17.6

## Added
- Universal type-and-select entry for Life & Symptoms.
- Canonical concept IDs, aliases, parent relationships, and transparent analysis weights.
- Original wording and provenance preservation.
- Subject ownership for self, partner, family member, or other.
- Concept-family rollups in Pattern Lab while retaining exact-concept variables.
- Explicit exclusion of records where `include_in_analysis` is false.
- PIN-derived AES-GCM encryption for private notes and original wording.
- Private Vault setup, unlock, lock, and reset controls.
- Neutral previews for encrypted private events.
- ZEKE logo returns to Dashboard.

## Security notes
- PIN derivation uses PBKDF2-SHA-256 with 250,000 iterations and AES-GCM authenticated encryption through Web Crypto.
- The PIN itself is not stored. It remains only in session memory while unlocked.
- Losing the PIN can make encrypted payloads unrecoverable.
- This remains an alpha browser application and has not received an independent security audit.

## Pattern Lab notes
Semantic weights control family membership and exploratory indices; they do not predetermine regression coefficients or causal effects.

---

# ZEKE v0.18.0 — Personal Intelligence & Pattern Lab

Build: 2026.07.17.5

## Added

- Removed the persistent dashboard conversation panel. **Talk to ZEKE** is now an on-demand floating control on every page.
- Added a dashboard briefing that routes to insights and Pattern Lab.
- Added **Life & Symptoms** with direct structured entry for:
  - headaches, tinnitus, fatigue, pain, illnesses, and custom symptoms;
  - gluten exposure;
  - menstrual-cycle events;
  - relationship and other life events, including intimacy and arguments.
- Added per-entry controls for private display, Pattern Lab inclusion, and connected-AI access.
- Added **Insight Center**, separating attention items, personal trends, research context, and suggestions.
- Added **Pattern Lab** with deterministic exploratory correlation screening, minimum paired-data checks, sample counts, and explicit non-causal language.
- Added quick-log entries for gluten, symptoms, life events, and menstrual-cycle events.
- Added groundwork for later AI-configured event templates and guarded multiple-regression models.

## Integrity and privacy behavior

- AI access is off by default for newly logged sensitive life events.
- Private entries use neutral previews.
- Pattern results are calculated in application code rather than generated by the language model.
- Findings are labeled exploratory and are not presented as diagnoses or causal conclusions.

## Important limitations in this preview

- The private-event checkbox does **not yet provide a separately encrypted password vault**. It controls labeling and data-use permissions only. Separate encryption, passcode/biometric unlock, auto-lock, and protected exports remain future security work.
- Pattern Lab currently performs guarded pairwise correlation screening. The interface describes the planned regression gate, but full linear/logistic/count/lagged/regularized regression is not yet implemented.
- AI can interpret existing supported workflows, but AI-generated event schemas are not yet automatically created. This release establishes the structured template framework they will use.

---

# ZEKE v0.17.8 — UX Stabilization & Data Integrity

Build: 2026.07.17.4

## Fixed
- Review opens a dedicated, persistent workspace instead of an inline card that can collapse.
- Review actions use plain-language proposed interpretations.
- Review position persists during rerenders within the browser session.
- Fitness has a visible global chart-period selector on desktop and mobile.
- The selected Fitness period persists between visits and displays an exact date range.
- Fitness uses a denser workspace layout rather than a long stack of full-width cards.
- Review, Fitness, and responsive layouts have new stabilization styles.

## Safety
- Ambiguous issues are not repaired automatically.
- Original evidence is preserved.
- Automatic repair remains limited to highly certain, reversible cases.

---

# ZEKE v0.17.7 — Data Integrity Center

## New
- Data Integrity is now an active cleanup workspace inside ZEKE rather than a read-only audit.
- Detects activity-name duplicates caused by case, punctuation, spacing, and selected aliases.
- Safely merges duplicate activity identities into one canonical display name while preserving every workout record and the original names as aliases.
- Detects exact duplicate workout records and can keep the earliest copy while removing redundant copies.
- Creates a Google Drive backup before every cleanup operation.
- Provides session undo for the most recent cleanup action.

## Prevention
- Activity dropdowns now deduplicate canonical names before display.
- Workout activity names are normalized before saving.
- Save Workout disables immediately and shows Saving… while writing.
- Each workout submission receives one transaction ID.
- Likely identical entries trigger a confirmation before another copy is saved.

## Testing focus
1. Open Settings → Data Integrity.
2. Merge `stair climber` and `Stair Climber`.
3. Confirm only `Stair Climber` remains in the Fitness library and old workout history is preserved.
4. Review any exact duplicate workout group and keep one.
5. Use Undo last cleanup and verify the records return.

---

# ZEKE v0.17.6 — Quick Log & Activity Profiles

Build: 2026.07.17.2  
Status: Preview

## Included
- Global **+ Log** in the top bar; mobile opens a bottom sheet.
- Quick routes for workout, activity, intake, weight, BP, sleep, body measurement, labs, and symptoms.
- Health tile **+ Log** opens structured entry; the separate Add Weight block is removed.
- Fitness activity cards use consistent **+ Log** wording.
- Adaptive activity fields for strength, cardio, mobility/stretching, rehabilitation/PT, recovery, and sport/recreation.
- Massage Chair and HydroMassage use recovery fields rather than weight/reps.
- Shoulder PT can be recorded as a simple completed session while the backend supports later detail.
- Add Activity workflow for activities not previously logged.
- Multi-activity workout form adapts fields per activity type.
- Denser responsive Fitness card grid.
- Review task details stay expanded until explicitly collapsed.
- Toast/status messages display above Talk to ZEKE.
- Intake form supports named products and protein shakes at 20 g, 30 g, or 40 g with quantity.

## Not yet complete
- Full regimen scheduling and assumption-vs-confirmation settings.
- Nutrient profiles for branded multivitamins.
- Complete transaction-oriented Review Queue resolution previews.

---

# ZEKE v0.17.4 — Sprint 1 Patch

Build: 2026.07.17.1  
Status: Preview

## Included
- Persistent ZEKE logo and visible version/build in the rendered header.
- Global Active Date context for today or historical entry.
- Numerical exercise-entry form with editable date, weight, repetitions, sets, and notes.
- Prior exercise values appear only as suggestions and are never copied automatically.
- Entries on the same date share the same daily workout identifier.
- Empty exercise entries are rejected.
- Review Queue groups related open questions into task-level cards.
- Expand/Collapse text follows the actual expanded state.
- Updated cache keys and service-worker cleanup to prevent stale nested assets.

## Not claimed as complete
- Full transaction-oriented Review Queue resolution.
- Direct entry for all health categories.
- Coach's Eye recovery engine and peer-reviewed evidence retrieval.

---

# ZEKE v0.17.3-alpha — Direct Entry & Review Tasks

## Delivered and wired
- Exercise progression tiles now open a numerical structured-entry form instead of routing to chat.
- Exercise entries attach to one workout container per calendar date using `workout-YYYY-MM-DD`.
- Empty exercise records are rejected. Prior values are displayed only as suggestions and are never copied automatically.
- The ZEKE logo and exact version/build remain visible in the top bar.
- Review questions are grouped into task-level cards with granular questions available inside each card.
- Dashboard and conversation counts now report review tasks rather than raw parser-question totals.

## Not included yet
- Full transaction-level resolution of every grouped review question.
- Direct BP/lab/medication forms.
- AI contract v1 and research-backed coaching.

---

# ZEKE v0.17.2-alpha — Usable Stabilization

- Built from the actual ZEKE-main repository.
- Persistent logo and unmistakable release fingerprint.
- Direct entry for weight, sleep duration, body measurements, and repeat exercises.
- Named Restore Center checkpoints with date/time, preview, and safety backup before restore.
- Diagnostics copy action.
- Updated README, feature status, and focused test guide.

This remains an alpha. Natural-language interpretation and advanced coaching are still partial.

---

# ZEKE v0.17.1-alpha

Build 2026.07.16.5

## Purpose

Correct the unverifiable v0.17.0-alpha package and make release identity visible before and after application initialization.

## Fixes

- Corrected the `version.js` contract: `window.ZEKE_BUILD` is now the object expected by `app.js`.
- Added an immediate static splash version before JavaScript loads.
- Added visible version/build identification in splash, top bar, sidebar, connection screens, error screen, and About panel.
- Added and updated `README.md` as a release-gate artifact.
- Advanced every local asset cache key to build `2026.07.16.5`.

## Verification gate

Do not test this release unless the page visibly shows `v0.17.1-alpha` and build `2026.07.16.5`.

---

# ZEKE v0.17.0-alpha — Conversation & Integrity Test Iteration

Focused alpha stabilization build.

## Included
- Persistent active-date context bar for historical entry.
- Review Queue terminology and first scoped review workspace; review answers no longer have to jump into the main chat.
- Review count describes items rather than homework-like “questions for you.”
- Expand/Collapse label is derived from actual expanded state.
- Inline weight entry on Health; prior values are never carried forward.
- Body Measurements section under Health.
- Exercise cards include direct “Add to [date] workout” entry.
- Workout records are grouped by calendar day conceptually; empty workout shells are excluded from fitness history and analysis.
- AI receives the active date as structured context.
- Dashboard spacing and column balance cleanup.

## Still alpha
The Review Queue aggregation and AI structured-action contract are first-pass implementations and require live testing. Do not treat this build as beta-ready.

---

# ZEKE v0.16.3 — Evidence-First Sync Repair

## Critical data-integrity repairs
- Workbook synchronization no longer substitutes the sync time when a workbook date is missing or cannot be parsed.
- Spreadsheet rows are read without collapsing blank rows, preserving real Excel row numbers.
- Every workbook observation must identify the exact nonblank source cell, not merely a row.
- Source identity is now based on source cell + observation type and remains stable when blank rows are present.
- Sync aborts before writing if any candidate lacks a valid date, source cell, or unique source identity.
- Backups include app version and event count.

## Recovery
Use the separately supplied `events-repaired.json` only after retaining the current `events.json` and quarantine file. It rebuilds connected-workbook observations from literal populated cells and preserves non-workbook records.

---

# ZEKE v0.16.2

## Dashboard visibility repair

- Removed a legacy `display:none!important` rule that hid the entire Dashboard grid.
- Preserved the current Dashboard layout and responsive rules.
- Advanced asset cache keys so GitHub Pages loads the corrected stylesheet.

## Root cause

A v0.8.3 compatibility rule remained in the cumulative stylesheet. Later releases restored `.dashboard-grid` with `display:grid`, but could not override the earlier `!important` declaration. Other pages rendered normally because only the Dashboard uses this grid.

---

# ZEKE v0.16.1 — Question Resolution & Dashboard Recovery

## Questions & Clarifications
- Fixed the Questions page Answer button so it opens the selected question in the conversation with its actual resolution choices.
- Free-text answers now follow an apply-first, resolve-second transaction. A question remains open when ZEKE cannot safely translate the answer into the required data change.
- Failed answer attempts are retained on the open question instead of being mislabeled as resolved.
- “Separate events” now adds the held import candidate as a confirmed event.
- Blood-pressure “keep” and “reverse” choices now create the corresponding confirmed measurements before closing the question.
- Duplicate “keep one” explicitly leaves the candidate uncommitted while preserving the resolution evidence.

## Dashboard
- Added a render error boundary. A display exception can no longer leave a silently blank dashboard.
- The recovery screen states that stored data was not erased, shows the actual display error, and provides Retry and Data Integrity actions.
- Updated all static asset cache keys so GitHub Pages does not combine an old app script with the new release.

## Integrity rule
A clarification is only resolved after its promised data operation succeeds. Conversation acknowledgement alone is not considered resolution.

---

# ZEKE v0.16.0 — Usability & Integrity Repair

## Release blockers addressed
- Automatic connected-workbook sync is paused on startup to stop new fabricated carry-forward events.
- Workbook identities now use stable source ID + sheet + row + metric/exercise/medication identity rather than the sync date.
- Known false `Normal 80-100` blood-pressure artifacts and the confirmed July carry-forward weight/A1c/average-glucose artifacts are excluded from ordinary health views while preserved for audit and repair.
- The Questions & Clarifications route is now registered, so the question counter opens the intended workspace.

## Conversation
- Simple BMI requests are completed directly from the latest verified weight and recorded height instead of entering repetitive confirmation loops.
- Irrelevant medication context is not pulled into BMI calculations.

## Coach's Eye
- Exercise selector grouped by body area.
- On-demand analysis rather than permanently pinning one exercise.
- Timely pre-workout alerts are compact and dismissible.
- Coach's Eye is explicitly limited to training guidance.

## I've Been Thinking
- Broader cross-domain hypotheses only; duplicate workout coaching is removed.
- Duplicate candidate insights are deduplicated.
- Insights can be dismissed.
- Manual refresh records when the area was last refreshed; meaningful data changes remain the primary refresh trigger.

## Layout
- Dashboard modules use a dense two-column grid rather than independent tall columns, reducing large vertical gaps.
- Responsive single-column behavior is retained for narrower screens.

## Important
This build preserves suspect records for audit. It does not silently delete or rewrite the user's historical event file.

---

# ZEKE v0.15.1 — Refined Brand & Layout Evaluation

This iteration responds to direct visual review of v0.15.0.

## Visual system
- Rebalanced the application around a light, calm, high-contrast canvas.
- Preserved ZEKE's navy, blue, cyan, and restrained gold brand language without turning the entire interface into a dark theme.
- Improved text/background contrast across cards, navigation, conversation bubbles, controls, and metric tiles.
- Added softer depth, translucent surfaces, tighter typography, and restrained gradients inspired by modern Apple interfaces.
- Retained information density and visual scanning patterns appropriate for a Weather Channel-style dashboard.

## Space use
- Rebuilt the dashboard into two true masonry-like content columns.
- Talk to ZEKE now shares its column with Coach's Eye, Today's Actions, and “I've been thinking…”, eliminating the unused blank area below conversation.
- Health at a Glance and evidence panels occupy the complementary column.

## Theme behavior
- The evaluation build defaults to the refined light theme once, while Dark and System options remain available in Settings.
- Dark mode was also adjusted for clearer contrast and less near-black visual weight.

## Branding
- Applied the logo board's blue/cyan ribbon language to accents, icons, gradients, highlights, and surface treatment.
- Gold remains reserved for selective attention states rather than routine controls.
- Existing provisional brand assets remain evaluation references pending a transparent vector master.

---

# ZEKE v0.15.0 — Brand & Navigation Evaluation Release

## Purpose
This release is intentionally designed as an evaluation build. It applies the new Project ZEKE visual identity and tests the proposed navigation and conversation architecture without discarding the existing v0.14.0 functionality.

## Included
- New folded-ribbon Z reference assets and provisional in-product mark.
- Deep navy, blue, cyan, and restrained gold visual system.
- Slide-out navigation to reclaim horizontal space; Settings remains last.
- Data Integrity moved out of primary navigation and linked from Settings.
- Persistent Talk to ZEKE launcher on non-dashboard pages.
- Compact dashboard top: Talk to ZEKE and Health at a Glance share the upper screen on wide displays.
- Smaller, icon-forward Health at a Glance cards that still expand into detail.
- Expand button now changes to Collapse while the conversation is expanded.
- Questions & Clarifications page with Answer, Later, Dismiss, and Why-is-ZEKE-asking context.
- Focused evidence panel for the sleep-undertracking insight rather than a generic jump into Recent Health.
- Provisional PWA app icon and updated dark theme metadata.

## Evaluation notes
- Branding assets are raster crops from the supplied brand board. They are suitable for UI evaluation but should be replaced by original transparent/vector artwork before 1.0.
- This release does not claim that all outstanding data-integrity and AI-context issues are fully resolved. Those remain separate engineering workstreams.

---

# ZEKE v0.14.0 — Contextual Conversation Preview

## Purpose
A test release focused on how a more reliable, AI-assisted conversation flow feels to use.

## Included
- Structured choices appear first for clarification decisions, preserving Groq bandwidth.
- Every clarification includes **None of these fit** and **Why are you asking?** where appropriate.
- Free-form clarification replies are resolved against the active question and allowed action IDs.
- Deterministic actions remain available when AI is down.
- The false 80/100 blood-pressure issue can be marked invalid directly from the question buttons.
- Clarification text is no longer concatenated into new raw user input, preventing context contamination.
- `37.6% fat` after a recent weight entry is recognized as body-fat percentage and linked to the same measurement session.
- Choice buttons show immediate working feedback.
- Conversation can expand to a full-screen reading mode.
- Conversation scroll behavior is less aggressive when the user is reading older messages.

## Safety
AI proposes only an allowed action ID. ZEKE validates and executes it. No AI response writes directly to the repository.

---

# ZEKE v0.13.0 — Beautiful Dashboard & Integrity Preview

## Visible changes
- Moves the enhanced Talk to ZEKE conversation to the top of the dashboard and gives it more reading space.
- Redesigns Health at a Glance with restrained metric-specific color, stronger typography, clearer hierarchy, and richer interactive cards.
- Reworks the phone layout so metric cards remain readable instead of collapsing into slivers.
- Makes Settings and Data Integrity directly available in the five-item mobile navigation.
- Makes narrow-screen range controls horizontally scrollable without overlapping the page.

## Data correctness
- Keeps stairclimber duration and steps paired by dated session before choosing the latest record or calculating change.
- Shows the comparison dates used for stairclimber step change.
- Detects the known `Normal 80-100` reference-range import artifact and excludes it from metric charts.
- Detects clarification text leaked into workout raw evidence and surfaces those records on Data Integrity for review.
- Does not silently delete or rewrite flagged records.

## Scope
This is an evening evaluation build focused on dashboard presentation, mobile usability, and visible integrity safeguards. It does not yet implement the future encrypted Drive credential vault, Apple Health bridge, or the complete product-feedback handoff registry.

---

# ZEKE v0.12.1 — Persistent Connections Fix

## Fixed

- Google Drive authorization is restored from the existing browser session after an ordinary page refresh instead of being discarded during application startup.
- Groq and other browser-based AI provider credentials can now be retained across refreshes with **Remember on this device**.
- AI provider model, endpoint, test status, and active availability are restored from a stable version-independent local settings namespace.
- Temporary startup or network failures no longer erase saved AI provider credentials.

## Security and scope

- AI keys remain in this browser/device only and are not written to `events.json`, the connected workbook, Google Drive repository, issue exports, or release files.
- Google passwords are never stored. ZEKE retains only the short-lived OAuth access token already issued to the current browser session.
- Clearing Firefox site data, using private browsing, changing the site origin, explicitly disconnecting, or token expiration can still require reconnection.

## Data safety

This release does not migrate, rewrite, import, delete, or modify health records or workbook data.

---

# ZEKE v0.12.0 — Contextual AI Workout Structuring

This release replaces generic AI interpretation for workout logs with a workout-specific, schema-constrained interpretation path.

## Improvements
- Routes workout-shaped chat messages to a dedicated AI workout interpreter.
- Uses the deterministic parser as a grounded draft and fallback rather than allowing generic AI output to override reliable parsing.
- Separates multiple dates into distinct workout sessions.
- Normalizes M/D, M/D/YY, and M/D/YYYY dates.
- Preserves stairclimber duration and step count together.
- Supports weight × reps × sets and mixed-set variants.
- Stores stable session/workout IDs, activity order, modality, original exercise wording, and normalized exercise names.
- Validates AI output before it becomes a confirmation candidate; malformed or empty AI output is not saved.
- Uses deterministic storage actions after user confirmation; the AI does not write directly to the repository.
- Adds duplicate protection when confirmed workout events match existing records closely.
- Clarification questions explain why the answer is needed.

## Data safety
- No migration or rewrite of existing workout history.
- Raw user input remains preserved.
- Existing events are not deleted.
- AI output is proposed for confirmation before storage.

---

# ZEKE v0.11.0

## Bundled improvements
- Multi-date workout parsing: one Talk to ZEKE message can create separate sessions for each explicit date.
- Date normalization: month/day, two-digit-year, and four-digit-year forms normalize to the same date when context supports it.
- Stairclimber records preserve both duration and step count.
- Natural-language medication backfill supports statements such as “I took my atorvastatin for the past 3 days,” with medication aliases and duplicate-safe repository reconciliation.
- Fitness now includes exercise progression cards, cardio summaries, history, evidence-based next-session suggestions, and confidence labels.
- Metric tile sparklines use the full selected range rather than an arbitrary final 12 points, preserving first/last values and chronological time spacing.
- AI provider cards clearly identify connected providers, successful test time, and connection state; the page summary names connected providers.
- Dashboard diagnostic record counts were replaced by a compact data-current status. Detailed counts remain in Data Integrity.
- Header Help and ZEKE Status controls now respond and explain their purpose.
- The date-range control adapts at narrower browser widths.

## Data safety
- No migration or deletion of existing health/workout records.
- Existing idempotent workbook/JSON synchronization remains in place.
- Ambiguous or questionable data remains reviewable rather than being silently deleted.

---

# ZEKE v0.10.3

- Metric sparklines now use actual observation dates on the x-axis rather than equal spacing.
- Invalid dates and nonnumeric points are excluded.
- Tile clicks open a focused metric detail view with narrative, full trend, provenance, and underlying observations.
- Tile interactions do not trigger a global app render.
- Data points expose values on hover, click, and keyboard focus.

---

# ZEKE v0.10.2 — Sitewide Form Focus Reliability Fix

- Extends focus and caret preservation from Talk to ZEKE to all text fields, password fields, URL fields, model fields, selects, textareas, and contenteditable controls.
- Prevents background data/storage refreshes from replacing an actively edited control.
- Preserves in-progress API key, endpoint, and model values across necessary renders without persisting secrets to Drive.
- Defers nonessential redraws until the user leaves the active form control.
- No health records, workbook data, or canonical events are migrated or rewritten by this release.

---

# ZEKE v0.10.1 — Conversation Input Focus Reliability Fix

## Fixed
- Talk to ZEKE no longer loses keyboard focus while background repository or workbook synchronization events arrive.
- Draft text and caret/selection position are preserved across unavoidable UI renders.
- Background data-change renders are deferred while the Talk to ZEKE field is actively being edited, then applied after the field loses focus.
- Draft text is tracked continuously rather than only immediately before a full render.

## Data safety
This release changes presentation/event-handling behavior only. It does not migrate, rewrite, delete, or re-import health data.

---

# ZEKE v0.10.0 — Idempotent Workbook Synchronization Alpha

Build: **v0.10.0 · 2026.07.11.6**

## Purpose

This release links the historical health workbook once, stores a ZEKE-managed XLSX copy inside the user-owned `Project Zeke/imports/originals` Drive folder, and synchronizes that workbook with `health/events.json` across releases.

## SJN1 compatibility

- Detects the actual multi-row workbook header rather than assuming row 1.
- Recognizes `Exercise Desc.` and `Exercise Duration` as workout history.
- Recognizes weight, body fat, dose, energy, appetite, resting heartbeat, symptoms, notes, A1c, average glucose, cholesterol, LDL, HDL, triglycerides, CBC values, ALT, B12, ApoB, and Lp(a).
- Converts a populated daily row into separate typed events without altering the original longitudinal sheet.

## Duplicate and data-loss protection

- Stable source identity for the connected workbook.
- Deterministic source keys based on source, sheet, date, category, and metric/activity.
- Content fingerprints distinguish unchanged rows from edits.
- Repeated synchronization is idempotent.
- Existing semantically identical JSON records are linked rather than duplicated.
- Blank spreadsheet cells never delete JSON events.
- Conflicts are counted and preserved rather than overwritten.
- A timestamped JSON backup is written before every synchronization commit.
- Events are written in one reconciliation commit rather than one full-file rewrite per imported cell.

## Spreadsheet peer

ZEKE keeps the connected source workbook byte-for-byte intact and maintains a separate `Project Zeke/imports/ZEKE-Event-Mirror.xlsx` spreadsheet containing canonical event IDs and normalized event details. This avoids risking charts, formulas, styles, or workbook structure during browser-based synchronization.

## Important limitation

Browser security does not allow a static site to reopen an arbitrary local file automatically. ZEKE therefore stores and synchronizes a managed copy in the user's Project Zeke Drive folder. The originally uploaded local file is never modified silently.

---

# ZEKE v0.9.0 — Data Integrity Read-Only Alpha

Build: **v0.9.0 · 2026.07.11.5**

This release adds a read-only Data Integrity workspace so missing display data can be diagnosed without changing existing records.

## Added
- Repository census with loaded event counts, category counts, source counts, and date coverage.
- Explicit distinction between recognized workouts and possible workout-shaped records.
- Metric registry showing how health/lab names map to dashboard metrics.
- Import diagnostics using preserved import-batch reports.
- Canonical repository map for the files ZEKE expects under `Project Zeke`.
- Searchable repository browser showing classification, summary, provenance, and status.
- Exportable JSON data audit for troubleshooting and handoff.

## Data safety
- No migration is run.
- No source spreadsheet is edited.
- No canonical JSON file is rewritten by opening or filtering the Data Integrity page.
- No uncertain record is automatically reclassified or merged.
- Export creates a local audit download only.

---

# ZEKE v0.8.3 — Data Visibility and Compact Dashboard Safety Release

## Purpose
This release fixes data invisibility and awkward dashboard gaps without migrating, rewriting, deleting, or consolidating existing records.

## Data safety
- No automatic repository migration.
- No changes to `health/events.json` format.
- No deletion or replacement of imported source records.
- Compatibility normalization is performed in memory for display only.
- Repository and workout diagnostics are read-only.

## Improvements
- Flexible recognition of health and lab records across legacy/imported field names.
- Expanded Health at a Glance metric catalog.
- Recent Health Evidence panel displays useful records even when there are too few points for a graph.
- Read-only repository inventory reports loaded record categories and recognized metrics.
- Workout Data Status distinguishes recognized workouts, possible unrecognized candidates, and source files/sheets.
- Independent dashboard columns remove large blank grid areas when panels have uneven heights.
- Visible build identification updated to v0.8.3 / 2026.07.11.4.

---

# ZEKE v0.8.2 — Workout History Compatibility Release

## Fixed
- Workout history detection now recognizes legacy and imported categories including workout, exercise, exercise sets, fitness, strength training, resistance training, cardio, and training sessions.
- Records with workout-shaped structured fields are recognized even when their original category label differs.
- Common historical workout text can be recognized as a fallback without rewriting the source record.
- Fitness now contains a chronological **Workout history** table showing date, activity, load, reps/sets, duration/steps, and provenance.
- Exercise summaries and Coach's Eye use the same normalized compatibility layer.

## Version
Visible build label: `v0.8.2 · 2026.07.11.3`

---

# ZEKE v0.8.1 Evaluation Alpha

Build: **v0.8.1 · 2026.07.11.2**

This is a direct patch of the v0.8.0 milestone codebase. It preserves the existing Google Drive repository, event model, interpretation pipeline, confirmation workflow, conversation persistence, and AI Router.

## Visible changes
- Version labels and cache-busting identifiers updated throughout the deployable site.
- New real-data coverage strip showing verified records, health/lab entries, workouts, medications, unresolved questions, and latest evidence date.
- “I’ve been thinking…” redesigned as a compact evidence-linked feed that can use saved discoveries, workout progression, available health metrics, and repeated supplement/nutrition mentions.
- Additional density and responsive styling without inserting fabricated personal records.

## Validation
- JavaScript syntax checked with Node.
- Static-site file references checked.

---

# ZEKE v0.8.0 Milestone Alpha

Build: **2026.07.11.1**

## Release theme

**Personal Data Intelligence + AI-First Conversation**

This milestone focuses on a polished desktop dashboard and on making existing user history useful. It is not a demo-data release: production UI cards are driven by connected/imported records and unavailable metrics stay hidden.

## Major changes

- Dark-first polished desktop dashboard aligned with the approved ZEKE mockup.
- Light, Dark, and System appearance choices.
- Clean unfilled line charts by default; no filled area-chart default.
- Trend panels are omitted when there are not enough observations to support a trend.
- Health at a Glance uses latest verified values overall while range controls affect trend analysis.
- One persistent Talk to ZEKE transcript with both user and ZEKE messages.
- AI-first conversational interpretation when a connected AI service is available; deterministic validation and confirmation still protect the record.
- Context-aware clarification answers such as `1x/week, usually on Fridays` update the relevant schedule.
- Persistent clarification queue with Answer now, Later, I don't know, and Ignore.
- Date-scoped Today's Actions and horizontally scrollable action tiles.
- Duplicate review that distinguishes accidental duplicates from legitimate repeated events.
- Spreadsheet/JSON ingestion that writes accepted records into the same event repository used by the dashboard and Coach's Eye.
- PHAS/Health Cortex-oriented spreadsheet normalization for Measurements, Medication, Strength Training, Workout Log/Cardio, Supplements, Labs, Daily Log, and Injuries/Pain patterns.
- Excel serial date handling.
- Long-form lab and measurement normalization.
- Import reports with rows read, records imported, duplicate reviews, and clarification counts.
- Coach's Eye session aggregation for one-row-per-set strength logs.
- Deeper optional AI Coach analysis using actual exercise history and relevant context; AI cannot alter records.
- Stable provider-independent `workspace_id` in repository manifest.
- Persistent conversation and import batch history in the user-owned repository.
- Session-scoped Google access-token restoration for normal browser refreshes while the token is still valid; long-lived secrets are not stored in localStorage.
- Broad AI connection registry; the AI Router chooses among connected services. The user does not select an active/default model for ordinary use.
- Manual AI packet export/import remains available.
- Mobile Preview control included for design evaluation; desktop remains the primary milestone target.

## Important alpha limits

- Google Drive is the operational storage adapter in this build. OneDrive, Dropbox, WebDAV/Nextcloud, SFTP, and local-folder adapters are presented as planned, not functional.
- Google Calendar is the operational calendar connector in this build. Apple/iCloud, Outlook/Exchange, and CalDAV/ICS connectors are planned.
- Arbitrary spreadsheet changes are not yet continuously synchronized after import; import is currently an explicit ingestion action.
- Direct browser API-key use is an alpha convenience and has security tradeoffs. Provider metadata persists, but API keys remain in memory for the browser session. Secure relays are preferable for broader distribution.
- Live OAuth behavior and live AI credentials must be tested on the deployed GitHub Pages origin.

---

# ZEKE v0.7.0 — Repair Release
Build: 2026.07.09.1

This release replaces the brittle overlay/legacy-mount approach used in several earlier alpha patches with a standalone, source-maintained static application shell that reuses the existing ZEKE repository schema.

## User experience

- One unified **Talk to ZEKE** conversation surface.
- No separate Ask ZEKE, Your Discoveries input, or detached response area.
- Clarification, interpretation confirmation, correction, duplicate resolution, unanswered questions, and AI escalation occur in the same conversation.
- Ambiguous input such as `BP 120 12 2` produces a natural-language clarification instead of guessing or exposing parser output.
- Persistent “questions for you” indicator with Answer now, Later, I don't know, and Ignore behavior.
- Deferred questions do not immediately reappear in the open-question indicator.

## Dashboard

- Mockup-aligned clean, data-dense layout.
- Health at a Glance shows prominent verified values and only plots real event-repository data.
- Week, Month, Quarter, 6 months, Year, and All ranges.
- Hover details on graph points.
- Contextual + Log actions from metric cards.
- Coach's Eye analyzes repeated exercise records and shows evidence/reasoning in expanded view.
- “I've been thinking…” remains conversational.
- Personal & family health history is intentionally kept off the dashboard and appears under Health.
- Sleep is treated inside Health rather than as a separate top-level domain.
- Today's Actions is horizontally scrollable/swipeable and uses current-local-day confirmed events only.

## Data integrity

- No demo personal health values are embedded in production files.
- Confirmation is required before interpreted structured events are saved.
- Likely duplicate entries are checked before creating another structured data point.
- Corrections preserve an audit event rather than silently erasing the prior version.
- Spreadsheet import supports XLSX, JSON, CSV, and TSV.

## AI Router

- Groq Free / Developer is explicitly visible.
- Gemini and OpenRouter connections are also available.
- The current provider/model catalog exposes 11 model choices across the free-first connections.
- Connect & test validates a provider through the visible UI.
- The router chooses among connected services by task/capability and can fall back when a provider request fails.
- Manual AI packet export/import remains available.

## Settings architecture

- AI Connections configures access; it does not ask the user to choose an active AI.
- Storage UI shows Google Drive as available in this alpha and clearly labels OneDrive, Dropbox, Nextcloud/WebDAV, private SFTP, and Local Folder as planned adapters.
- Calendar UI shows Google Calendar as current and clearly labels Apple Calendar/iCloud, Outlook/Exchange, and broader standards-based paths as planned/currently limited.

## Important limits

- Real Google OAuth behavior must still be accepted on the deployed GitHub Pages origin.
- Real external AI calls require the user's provider credentials and provider availability.
- Direct AI keys are intentionally not persisted across a full page session restart in this browser-only alpha.
- Continuous spreadsheet synchronization is not yet implemented; the import path converts historical spreadsheet rows into ZEKE events.
- Non-Google storage adapters and non-Google calendar connectors are shown as planned, not falsely presented as operational.
- File/image interpretation directly from the conversation composer is not complete in this release.
- A durable encrypted offline pending-sync queue is not complete yet.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.10.0.md`

# ZEKE v0.10.0 — Idempotent Workbook Synchronization Alpha

Build: **v0.10.0 · 2026.07.11.6**

## Purpose

This release links the historical health workbook once, stores a ZEKE-managed XLSX copy inside the user-owned `Project Zeke/imports/originals` Drive folder, and synchronizes that workbook with `health/events.json` across releases.

## SJN1 compatibility

- Detects the actual multi-row workbook header rather than assuming row 1.
- Recognizes `Exercise Desc.` and `Exercise Duration` as workout history.
- Recognizes weight, body fat, dose, energy, appetite, resting heartbeat, symptoms, notes, A1c, average glucose, cholesterol, LDL, HDL, triglycerides, CBC values, ALT, B12, ApoB, and Lp(a).
- Converts a populated daily row into separate typed events without altering the original longitudinal sheet.

## Duplicate and data-loss protection

- Stable source identity for the connected workbook.
- Deterministic source keys based on source, sheet, date, category, and metric/activity.
- Content fingerprints distinguish unchanged rows from edits.
- Repeated synchronization is idempotent.
- Existing semantically identical JSON records are linked rather than duplicated.
- Blank spreadsheet cells never delete JSON events.
- Conflicts are counted and preserved rather than overwritten.
- A timestamped JSON backup is written before every synchronization commit.
- Events are written in one reconciliation commit rather than one full-file rewrite per imported cell.

## Spreadsheet peer

ZEKE keeps the connected source workbook byte-for-byte intact and maintains a separate `Project Zeke/imports/ZEKE-Event-Mirror.xlsx` spreadsheet containing canonical event IDs and normalized event details. This avoids risking charts, formulas, styles, or workbook structure during browser-based synchronization.

## Important limitation

Browser security does not allow a static site to reopen an arbitrary local file automatically. ZEKE therefore stores and synchronizes a managed copy in the user's Project Zeke Drive folder. The originally uploaded local file is never modified silently.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.10.1.md`

# ZEKE v0.10.1 — Conversation Input Focus Reliability Fix

## Fixed
- Talk to ZEKE no longer loses keyboard focus while background repository or workbook synchronization events arrive.
- Draft text and caret/selection position are preserved across unavoidable UI renders.
- Background data-change renders are deferred while the Talk to ZEKE field is actively being edited, then applied after the field loses focus.
- Draft text is tracked continuously rather than only immediately before a full render.

## Data safety
This release changes presentation/event-handling behavior only. It does not migrate, rewrite, delete, or re-import health data.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.10.2.md`

# ZEKE v0.10.2 — Sitewide Form Focus Reliability Fix

- Extends focus and caret preservation from Talk to ZEKE to all text fields, password fields, URL fields, model fields, selects, textareas, and contenteditable controls.
- Prevents background data/storage refreshes from replacing an actively edited control.
- Preserves in-progress API key, endpoint, and model values across necessary renders without persisting secrets to Drive.
- Defers nonessential redraws until the user leaves the active form control.
- No health records, workbook data, or canonical events are migrated or rewritten by this release.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.10.3.md`

# ZEKE v0.10.3

- Metric sparklines now use actual observation dates on the x-axis rather than equal spacing.
- Invalid dates and nonnumeric points are excluded.
- Tile clicks open a focused metric detail view with narrative, full trend, provenance, and underlying observations.
- Tile interactions do not trigger a global app render.
- Data points expose values on hover, click, and keyboard focus.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.11.0.md`

# ZEKE v0.11.0

## Bundled improvements
- Multi-date workout parsing: one Talk to ZEKE message can create separate sessions for each explicit date.
- Date normalization: month/day, two-digit-year, and four-digit-year forms normalize to the same date when context supports it.
- Stairclimber records preserve both duration and step count.
- Natural-language medication backfill supports statements such as “I took my atorvastatin for the past 3 days,” with medication aliases and duplicate-safe repository reconciliation.
- Fitness now includes exercise progression cards, cardio summaries, history, evidence-based next-session suggestions, and confidence labels.
- Metric tile sparklines use the full selected range rather than an arbitrary final 12 points, preserving first/last values and chronological time spacing.
- AI provider cards clearly identify connected providers, successful test time, and connection state; the page summary names connected providers.
- Dashboard diagnostic record counts were replaced by a compact data-current status. Detailed counts remain in Data Integrity.
- Header Help and ZEKE Status controls now respond and explain their purpose.
- The date-range control adapts at narrower browser widths.

## Data safety
- No migration or deletion of existing health/workout records.
- Existing idempotent workbook/JSON synchronization remains in place.
- Ambiguous or questionable data remains reviewable rather than being silently deleted.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.12.0.md`

# ZEKE v0.12.0 — Contextual AI Workout Structuring

This release replaces generic AI interpretation for workout logs with a workout-specific, schema-constrained interpretation path.

## Improvements
- Routes workout-shaped chat messages to a dedicated AI workout interpreter.
- Uses the deterministic parser as a grounded draft and fallback rather than allowing generic AI output to override reliable parsing.
- Separates multiple dates into distinct workout sessions.
- Normalizes M/D, M/D/YY, and M/D/YYYY dates.
- Preserves stairclimber duration and step count together.
- Supports weight × reps × sets and mixed-set variants.
- Stores stable session/workout IDs, activity order, modality, original exercise wording, and normalized exercise names.
- Validates AI output before it becomes a confirmation candidate; malformed or empty AI output is not saved.
- Uses deterministic storage actions after user confirmation; the AI does not write directly to the repository.
- Adds duplicate protection when confirmed workout events match existing records closely.
- Clarification questions explain why the answer is needed.

## Data safety
- No migration or rewrite of existing workout history.
- Raw user input remains preserved.
- Existing events are not deleted.
- AI output is proposed for confirmation before storage.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.12.1.md`

# ZEKE v0.12.1 — Persistent Connections Fix

## Fixed

- Google Drive authorization is restored from the existing browser session after an ordinary page refresh instead of being discarded during application startup.
- Groq and other browser-based AI provider credentials can now be retained across refreshes with **Remember on this device**.
- AI provider model, endpoint, test status, and active availability are restored from a stable version-independent local settings namespace.
- Temporary startup or network failures no longer erase saved AI provider credentials.

## Security and scope

- AI keys remain in this browser/device only and are not written to `events.json`, the connected workbook, Google Drive repository, issue exports, or release files.
- Google passwords are never stored. ZEKE retains only the short-lived OAuth access token already issued to the current browser session.
- Clearing Firefox site data, using private browsing, changing the site origin, explicitly disconnecting, or token expiration can still require reconnection.

## Data safety

This release does not migrate, rewrite, import, delete, or modify health records or workbook data.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.13.0.md`

# ZEKE v0.13.0 — Beautiful Dashboard & Integrity Preview

## Visible changes
- Moves the enhanced Talk to ZEKE conversation to the top of the dashboard and gives it more reading space.
- Redesigns Health at a Glance with restrained metric-specific color, stronger typography, clearer hierarchy, and richer interactive cards.
- Reworks the phone layout so metric cards remain readable instead of collapsing into slivers.
- Makes Settings and Data Integrity directly available in the five-item mobile navigation.
- Makes narrow-screen range controls horizontally scrollable without overlapping the page.

## Data correctness
- Keeps stairclimber duration and steps paired by dated session before choosing the latest record or calculating change.
- Shows the comparison dates used for stairclimber step change.
- Detects the known `Normal 80-100` reference-range import artifact and excludes it from metric charts.
- Detects clarification text leaked into workout raw evidence and surfaces those records on Data Integrity for review.
- Does not silently delete or rewrite flagged records.

## Scope
This is an evening evaluation build focused on dashboard presentation, mobile usability, and visible integrity safeguards. It does not yet implement the future encrypted Drive credential vault, Apple Health bridge, or the complete product-feedback handoff registry.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.14.0.md`

# ZEKE v0.14.0 — Contextual Conversation Preview

## Purpose
A test release focused on how a more reliable, AI-assisted conversation flow feels to use.

## Included
- Structured choices appear first for clarification decisions, preserving Groq bandwidth.
- Every clarification includes **None of these fit** and **Why are you asking?** where appropriate.
- Free-form clarification replies are resolved against the active question and allowed action IDs.
- Deterministic actions remain available when AI is down.
- The false 80/100 blood-pressure issue can be marked invalid directly from the question buttons.
- Clarification text is no longer concatenated into new raw user input, preventing context contamination.
- `37.6% fat` after a recent weight entry is recognized as body-fat percentage and linked to the same measurement session.
- Choice buttons show immediate working feedback.
- Conversation can expand to a full-screen reading mode.
- Conversation scroll behavior is less aggressive when the user is reading older messages.

## Safety
AI proposes only an allowed action ID. ZEKE validates and executes it. No AI response writes directly to the repository.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.15.0.md`

# ZEKE v0.15.0 — Brand & Navigation Evaluation Release

## Purpose
This release is intentionally designed as an evaluation build. It applies the new Project ZEKE visual identity and tests the proposed navigation and conversation architecture without discarding the existing v0.14.0 functionality.

## Included
- New folded-ribbon Z reference assets and provisional in-product mark.
- Deep navy, blue, cyan, and restrained gold visual system.
- Slide-out navigation to reclaim horizontal space; Settings remains last.
- Data Integrity moved out of primary navigation and linked from Settings.
- Persistent Talk to ZEKE launcher on non-dashboard pages.
- Compact dashboard top: Talk to ZEKE and Health at a Glance share the upper screen on wide displays.
- Smaller, icon-forward Health at a Glance cards that still expand into detail.
- Expand button now changes to Collapse while the conversation is expanded.
- Questions & Clarifications page with Answer, Later, Dismiss, and Why-is-ZEKE-asking context.
- Focused evidence panel for the sleep-undertracking insight rather than a generic jump into Recent Health.
- Provisional PWA app icon and updated dark theme metadata.

## Evaluation notes
- Branding assets are raster crops from the supplied brand board. They are suitable for UI evaluation but should be replaced by original transparent/vector artwork before 1.0.
- This release does not claim that all outstanding data-integrity and AI-context issues are fully resolved. Those remain separate engineering workstreams.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.15.1.md`

# ZEKE v0.15.1 — Refined Brand & Layout Evaluation

This iteration responds to direct visual review of v0.15.0.

## Visual system
- Rebalanced the application around a light, calm, high-contrast canvas.
- Preserved ZEKE's navy, blue, cyan, and restrained gold brand language without turning the entire interface into a dark theme.
- Improved text/background contrast across cards, navigation, conversation bubbles, controls, and metric tiles.
- Added softer depth, translucent surfaces, tighter typography, and restrained gradients inspired by modern Apple interfaces.
- Retained information density and visual scanning patterns appropriate for a Weather Channel-style dashboard.

## Space use
- Rebuilt the dashboard into two true masonry-like content columns.
- Talk to ZEKE now shares its column with Coach's Eye, Today's Actions, and “I've been thinking…”, eliminating the unused blank area below conversation.
- Health at a Glance and evidence panels occupy the complementary column.

## Theme behavior
- The evaluation build defaults to the refined light theme once, while Dark and System options remain available in Settings.
- Dark mode was also adjusted for clearer contrast and less near-black visual weight.

## Branding
- Applied the logo board's blue/cyan ribbon language to accents, icons, gradients, highlights, and surface treatment.
- Gold remains reserved for selective attention states rather than routine controls.
- Existing provisional brand assets remain evaluation references pending a transparent vector master.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.16.0.md`

# ZEKE v0.16.0 — Usability & Integrity Repair

## Release blockers addressed
- Automatic connected-workbook sync is paused on startup to stop new fabricated carry-forward events.
- Workbook identities now use stable source ID + sheet + row + metric/exercise/medication identity rather than the sync date.
- Known false `Normal 80-100` blood-pressure artifacts and the confirmed July carry-forward weight/A1c/average-glucose artifacts are excluded from ordinary health views while preserved for audit and repair.
- The Questions & Clarifications route is now registered, so the question counter opens the intended workspace.

## Conversation
- Simple BMI requests are completed directly from the latest verified weight and recorded height instead of entering repetitive confirmation loops.
- Irrelevant medication context is not pulled into BMI calculations.

## Coach's Eye
- Exercise selector grouped by body area.
- On-demand analysis rather than permanently pinning one exercise.
- Timely pre-workout alerts are compact and dismissible.
- Coach's Eye is explicitly limited to training guidance.

## I've Been Thinking
- Broader cross-domain hypotheses only; duplicate workout coaching is removed.
- Duplicate candidate insights are deduplicated.
- Insights can be dismissed.
- Manual refresh records when the area was last refreshed; meaningful data changes remain the primary refresh trigger.

## Layout
- Dashboard modules use a dense two-column grid rather than independent tall columns, reducing large vertical gaps.
- Responsive single-column behavior is retained for narrower screens.

## Important
This build preserves suspect records for audit. It does not silently delete or rewrite the user's historical event file.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.16.1.md`

# ZEKE v0.16.1 — Question Resolution & Dashboard Recovery

## Questions & Clarifications
- Fixed the Questions page Answer button so it opens the selected question in the conversation with its actual resolution choices.
- Free-text answers now follow an apply-first, resolve-second transaction. A question remains open when ZEKE cannot safely translate the answer into the required data change.
- Failed answer attempts are retained on the open question instead of being mislabeled as resolved.
- “Separate events” now adds the held import candidate as a confirmed event.
- Blood-pressure “keep” and “reverse” choices now create the corresponding confirmed measurements before closing the question.
- Duplicate “keep one” explicitly leaves the candidate uncommitted while preserving the resolution evidence.

## Dashboard
- Added a render error boundary. A display exception can no longer leave a silently blank dashboard.
- The recovery screen states that stored data was not erased, shows the actual display error, and provides Retry and Data Integrity actions.
- Updated all static asset cache keys so GitHub Pages does not combine an old app script with the new release.

## Integrity rule
A clarification is only resolved after its promised data operation succeeds. Conversation acknowledgement alone is not considered resolution.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.16.2.md`

# ZEKE v0.16.2

## Dashboard visibility repair

- Removed a legacy `display:none!important` rule that hid the entire Dashboard grid.
- Preserved the current Dashboard layout and responsive rules.
- Advanced asset cache keys so GitHub Pages loads the corrected stylesheet.

## Root cause

A v0.8.3 compatibility rule remained in the cumulative stylesheet. Later releases restored `.dashboard-grid` with `display:grid`, but could not override the earlier `!important` declaration. Other pages rendered normally because only the Dashboard uses this grid.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.16.3.md`

# ZEKE v0.16.3 — Evidence-First Sync Repair

## Critical data-integrity repairs
- Workbook synchronization no longer substitutes the sync time when a workbook date is missing or cannot be parsed.
- Spreadsheet rows are read without collapsing blank rows, preserving real Excel row numbers.
- Every workbook observation must identify the exact nonblank source cell, not merely a row.
- Source identity is now based on source cell + observation type and remains stable when blank rows are present.
- Sync aborts before writing if any candidate lacks a valid date, source cell, or unique source identity.
- Backups include app version and event count.

## Recovery
Use the separately supplied `events-repaired.json` only after retaining the current `events.json` and quarantine file. It rebuilds connected-workbook observations from literal populated cells and preserves non-workbook records.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.0-alpha.md`

# ZEKE v0.17.0-alpha — Conversation & Integrity Test Iteration

Focused alpha stabilization build.

## Included
- Persistent active-date context bar for historical entry.
- Review Queue terminology and first scoped review workspace; review answers no longer have to jump into the main chat.
- Review count describes items rather than homework-like “questions for you.”
- Expand/Collapse label is derived from actual expanded state.
- Inline weight entry on Health; prior values are never carried forward.
- Body Measurements section under Health.
- Exercise cards include direct “Add to [date] workout” entry.
- Workout records are grouped by calendar day conceptually; empty workout shells are excluded from fitness history and analysis.
- AI receives the active date as structured context.
- Dashboard spacing and column balance cleanup.

## Still alpha
The Review Queue aggregation and AI structured-action contract are first-pass implementations and require live testing. Do not treat this build as beta-ready.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.1-alpha.md`

# ZEKE v0.17.1-alpha

Build 2026.07.16.5

## Purpose

Correct the unverifiable v0.17.0-alpha package and make release identity visible before and after application initialization.

## Fixes

- Corrected the `version.js` contract: `window.ZEKE_BUILD` is now the object expected by `app.js`.
- Added an immediate static splash version before JavaScript loads.
- Added visible version/build identification in splash, top bar, sidebar, connection screens, error screen, and About panel.
- Added and updated `README.md` as a release-gate artifact.
- Advanced every local asset cache key to build `2026.07.16.5`.

## Verification gate

Do not test this release unless the page visibly shows `v0.17.1-alpha` and build `2026.07.16.5`.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.2-alpha.md`

# ZEKE v0.17.2-alpha — Usable Stabilization

- Built from the actual ZEKE-main repository.
- Persistent logo and unmistakable release fingerprint.
- Direct entry for weight, sleep duration, body measurements, and repeat exercises.
- Named Restore Center checkpoints with date/time, preview, and safety backup before restore.
- Diagnostics copy action.
- Updated README, feature status, and focused test guide.

This remains an alpha. Natural-language interpretation and advanced coaching are still partial.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.3-alpha.md`

# ZEKE v0.17.3-alpha — Direct Entry & Review Tasks

## Delivered and wired
- Exercise progression tiles now open a numerical structured-entry form instead of routing to chat.
- Exercise entries attach to one workout container per calendar date using `workout-YYYY-MM-DD`.
- Empty exercise records are rejected. Prior values are displayed only as suggestions and are never copied automatically.
- The ZEKE logo and exact version/build remain visible in the top bar.
- Review questions are grouped into task-level cards with granular questions available inside each card.
- Dashboard and conversation counts now report review tasks rather than raw parser-question totals.

## Not included yet
- Full transaction-level resolution of every grouped review question.
- Direct BP/lab/medication forms.
- AI contract v1 and research-backed coaching.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.4.md`

# ZEKE v0.17.4 — Sprint 1 Patch

Build: 2026.07.17.1  
Status: Preview

## Included
- Persistent ZEKE logo and visible version/build in the rendered header.
- Global Active Date context for today or historical entry.
- Numerical exercise-entry form with editable date, weight, repetitions, sets, and notes.
- Prior exercise values appear only as suggestions and are never copied automatically.
- Entries on the same date share the same daily workout identifier.
- Empty exercise entries are rejected.
- Review Queue groups related open questions into task-level cards.
- Expand/Collapse text follows the actual expanded state.
- Updated cache keys and service-worker cleanup to prevent stale nested assets.

## Not claimed as complete
- Full transaction-oriented Review Queue resolution.
- Direct entry for all health categories.
- Coach's Eye recovery engine and peer-reviewed evidence retrieval.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.6.md`

# ZEKE v0.17.6 — Quick Log & Activity Profiles

Build: 2026.07.17.2  
Status: Preview

## Included
- Global **+ Log** in the top bar; mobile opens a bottom sheet.
- Quick routes for workout, activity, intake, weight, BP, sleep, body measurement, labs, and symptoms.
- Health tile **+ Log** opens structured entry; the separate Add Weight block is removed.
- Fitness activity cards use consistent **+ Log** wording.
- Adaptive activity fields for strength, cardio, mobility/stretching, rehabilitation/PT, recovery, and sport/recreation.
- Massage Chair and HydroMassage use recovery fields rather than weight/reps.
- Shoulder PT can be recorded as a simple completed session while the backend supports later detail.
- Add Activity workflow for activities not previously logged.
- Multi-activity workout form adapts fields per activity type.
- Denser responsive Fitness card grid.
- Review task details stay expanded until explicitly collapsed.
- Toast/status messages display above Talk to ZEKE.
- Intake form supports named products and protein shakes at 20 g, 30 g, or 40 g with quantity.

## Not yet complete
- Full regimen scheduling and assumption-vs-confirmation settings.
- Nutrient profiles for branded multivitamins.
- Complete transaction-oriented Review Queue resolution previews.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.7.md`

# ZEKE v0.17.7 — Data Integrity Center

## New
- Data Integrity is now an active cleanup workspace inside ZEKE rather than a read-only audit.
- Detects activity-name duplicates caused by case, punctuation, spacing, and selected aliases.
- Safely merges duplicate activity identities into one canonical display name while preserving every workout record and the original names as aliases.
- Detects exact duplicate workout records and can keep the earliest copy while removing redundant copies.
- Creates a Google Drive backup before every cleanup operation.
- Provides session undo for the most recent cleanup action.

## Prevention
- Activity dropdowns now deduplicate canonical names before display.
- Workout activity names are normalized before saving.
- Save Workout disables immediately and shows Saving… while writing.
- Each workout submission receives one transaction ID.
- Likely identical entries trigger a confirmation before another copy is saved.

## Testing focus
1. Open Settings → Data Integrity.
2. Merge `stair climber` and `Stair Climber`.
3. Confirm only `Stair Climber` remains in the Fitness library and old workout history is preserved.
4. Review any exact duplicate workout group and keep one.
5. Use Undo last cleanup and verify the records return.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.17.8.md`

# ZEKE v0.17.8 — UX Stabilization & Data Integrity

Build: 2026.07.17.4

## Fixed
- Review opens a dedicated, persistent workspace instead of an inline card that can collapse.
- Review actions use plain-language proposed interpretations.
- Review position persists during rerenders within the browser session.
- Fitness has a visible global chart-period selector on desktop and mobile.
- The selected Fitness period persists between visits and displays an exact date range.
- Fitness uses a denser workspace layout rather than a long stack of full-width cards.
- Review, Fitness, and responsive layouts have new stabilization styles.

## Safety
- Ambiguous issues are not repaired automatically.
- Original evidence is preserved.
- Automatic repair remains limited to highly certain, reversible cases.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.18.0.md`

# ZEKE v0.18.0 — Personal Intelligence & Pattern Lab

Build: 2026.07.17.5

## Added

- Removed the persistent dashboard conversation panel. **Talk to ZEKE** is now an on-demand floating control on every page.
- Added a dashboard briefing that routes to insights and Pattern Lab.
- Added **Life & Symptoms** with direct structured entry for:
  - headaches, tinnitus, fatigue, pain, illnesses, and custom symptoms;
  - gluten exposure;
  - menstrual-cycle events;
  - relationship and other life events, including intimacy and arguments.
- Added per-entry controls for private display, Pattern Lab inclusion, and connected-AI access.
- Added **Insight Center**, separating attention items, personal trends, research context, and suggestions.
- Added **Pattern Lab** with deterministic exploratory correlation screening, minimum paired-data checks, sample counts, and explicit non-causal language.
- Added quick-log entries for gluten, symptoms, life events, and menstrual-cycle events.
- Added groundwork for later AI-configured event templates and guarded multiple-regression models.

## Integrity and privacy behavior

- AI access is off by default for newly logged sensitive life events.
- Private entries use neutral previews.
- Pattern results are calculated in application code rather than generated by the language model.
- Findings are labeled exploratory and are not presented as diagnoses or causal conclusions.

## Important limitations in this preview

- The private-event checkbox does **not yet provide a separately encrypted password vault**. It controls labeling and data-use permissions only. Separate encryption, passcode/biometric unlock, auto-lock, and protected exports remain future security work.
- Pattern Lab currently performs guarded pairwise correlation screening. The interface describes the planned regression gate, but full linear/logistic/count/lagged/regularized regression is not yet implemented.
- AI can interpret existing supported workflows, but AI-generated event schemas are not yet automatically created. This release establishes the structured template framework they will use.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.19.0.md`

# ZEKE v0.19.0 — Concept Search & Private Vault Preview

Build: 2026.07.17.6

## Added
- Universal type-and-select entry for Life & Symptoms.
- Canonical concept IDs, aliases, parent relationships, and transparent analysis weights.
- Original wording and provenance preservation.
- Subject ownership for self, partner, family member, or other.
- Concept-family rollups in Pattern Lab while retaining exact-concept variables.
- Explicit exclusion of records where `include_in_analysis` is false.
- PIN-derived AES-GCM encryption for private notes and original wording.
- Private Vault setup, unlock, lock, and reset controls.
- Neutral previews for encrypted private events.
- ZEKE logo returns to Dashboard.

## Security notes
- PIN derivation uses PBKDF2-SHA-256 with 250,000 iterations and AES-GCM authenticated encryption through Web Crypto.
- The PIN itself is not stored. It remains only in session memory while unlocked.
- Losing the PIN can make encrypted payloads unrecoverable.
- This remains an alpha browser application and has not received an independent security audit.

## Pattern Lab notes
Semantic weights control family membership and exploratory indices; they do not predetermine regression coefficients or causal effects.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.19.1.md`

# ZEKE v0.19.1 — Interaction & Fitness Reliability Patch

## Fixed
- Medication/supplement logging now opens a direct structured form instead of routing to Dashboard.
- Per-item dose confirmation preferences are saved.
- Medication backfill transitions into Talk to ZEKE with explicit preview/duplicate/confirmation instructions.
- Fitness activity tiles now expose period-specific detail on hover, keyboard focus, and tap.
- Fitness activity groups and Coach's Eye now use the selected chart period.
- Common exercise-name variants are normalized invisibly and aggregated into the same chart/analysis group.
- Fitness history and summaries now respect the selected period.
- Responsive chart and panel sizing is hardened for narrower windows.
- Life & Symptoms includes a substantially larger symptom vocabulary and improved plural/alias ranking.
- Low-confidence concept searches can consult connected AI for structured, non-diagnostic interpretation.
- Ambiguous question/diamond navigation icons were replaced with clearer symbols.
- Expanded modal actions remain reachable without scrolling back to the top.

## Data integrity
- Original workout records remain unchanged; normalization occurs in the presentation and analytics layer.
- AI suggestions do not write canonical concepts automatically.
- Backfill remains a confirmed bulk operation through Talk to ZEKE.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.19.2.md`

# ZEKE v0.19.2 — Dashboard Correction

This corrective release addresses the mismatch visible in the v0.19.1 screenshot.

- Removed the oversized ZEKE Briefing hero from the Dashboard.
- Replaced it with a compact, action-oriented Insights tile.
- Corrected the desktop Dashboard grid so the first column is no longer left blank while Health at a Glance occupies only the right side.
- Replaced the unexplained `?` and diamond header controls with labeled Help and Status buttons while preserving their existing behavior.
- Preserved the v0.19.1 medication, concept-search, and Fitness reliability changes.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.20.0.md`

# ZEKE v0.20.0 — Responsive Polish Release

## Included
- Rebuilt Dashboard composition so major sections form independent responsive rows rather than two unequal vertical columns.
- Health at a Glance now spans the available width and reflows its metric tiles.
- Insights and Today’s Actions share a priority row and stack cleanly at narrower widths.
- Coach’s Eye and I’ve been thinking share a balanced guidance row.
- Evidence panels render only when they have usable content.
- Empty chart canvases no longer reserve fixed space. Cards expand when enough verified data exist.
- Coach’s Eye now displays “Not logged” when pain was not recorded.
- Fitness workspace and Activity Library reflow across desktop, narrow desktop, and mobile widths.
- Retains v0.19.1/v0.19.2 medication routing, concept search, normalization, and reliability fixes.

## Deferred
Dashboard drag-and-drop, saved layout profiles, pin/auto behavior, and import/export layouts remain planned for v0.21.0 so the responsive foundation can be tested first.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.20.2.md`

# ZEKE v0.20.2 Release Notes

Build 2026.07.17.11

This release contains a structural dashboard whitespace repair and the first complete built-in development handoff system. See `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.20.2.md` for exact scope and verification.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.20.3.md`

# ZEKE v0.20.3 Release Notes

**Build:** 2026.07.17.12  
**Release:** Development Gate & Data Compatibility Release

## Development continuity
- Adds `00_AI_START_HERE.md`, a mandatory stop-and-approval gate for every new development conversation.
- Adds a machine-readable development authorization record.
- Records the startup-gate failure and new prevention rules in the cumulative error log.
- Requires future handoffs to consult accessible prior ZEKE conversations for binding user decisions while independently verifying earlier assistant claims.

## Workbook safety and compatibility
- Preserves the exact-cell provenance created by the v0.16.3 recovery.
- Recognizes all 188 verified workbook observations in the supplied repository without rewriting their IDs, source keys, dates, or provenance.
- Adds a read-only **Run preflight** action in Settings.
- Stops synchronization before writing when conflicts or unsupported changes are detected.
- Removes automatic workbook synchronization from ordinary Talk to ZEKE saves and corrections.
- Requires read → normalize → compare → preview → explicit commit → persisted verification, with an append-only transaction journal.
- Archives the previously connected source workbook before an approved replacement, while continuing to regenerate only a separate event mirror after verification.

## Medication reliability
- Separates **taken**, **missed**, **not taken yet**, and uncertain medication mentions.
- Requires a known daily or weekly schedule before expanding a date range.
- Shows every proposed backfill date before confirmation and identifies matching existing records that will be skipped.
- Uses canonical medication identities for matching while retaining original wording.
- Stores confirmation preferences in the user-owned ZEKE repository rather than browser-only storage.
- Prevents null schedule records from appearing as January 1, 1970.
- Prevents missed, not-yet-taken, pending, or uncertain medication records from completing Today’s Actions.
- Repairs damaged word-boundary characters in concept matching and activity-name formatting.

## Review workflow
- Prevents concurrent startup routines from creating duplicate open clarification questions with the same question key.
- Preserves existing duplicate records as audit history; this release does not silently delete user data.

## Verification
- Passed syntax, JSON, structural, medication, question-idempotency, workbook transaction, source-backup, and real-data idempotency regressions.
- Rendered the dashboard at 1440, 1024, 768, and 390 pixel widths with no document-level horizontal overflow.
- Live Google Drive, Calendar, AI-provider, and deployed-origin behavior remains a deployment test.

## Deployment
Deploy as a full replacement. Do not merge individual files into an older release. Read `README.md` and verify v0.20.3 / build 2026.07.17.12 after deployment.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.20.4.md`

# ZEKE v0.20.4 — Continuity Framework & Medication Clarity

Build 2026.07.17.13

This corrective release preserves v0.20.3 data-compatibility work while preventing the medication class term “GLP-1” from being treated as a unique synonym for tirzepatide. Class-only natural-language entries now request medication identity clarification rather than creating a tirzepatide event.

The release also introduces a portable development operating framework: one root entry point, rapid orientation, comprehension proof, historian/reviewer/investigation/findings/approval phases, anti-wandering rules, artifact lifecycle and authority controls, rejected-path memory, precise verification language, and an executable internal consistency/dead-link audit.

Live Google services and AI providers still require verification in the deployed environment.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.20.5.md`

# ZEKE v0.20.5 — Continuity Baseline Cleanup & Enforcement Release

Build 2026.07.18.1

This release cleans and reconciles the entire active handoff baseline. It fixes the Constitution's obsolete Ask/Tell rule, replaces stale v0.20.3 authority records, introduces an artifact registry and machine-readable governance rules, strengthens the audit, adds negative-control tests, clarifies backlog prerequisites, and converts competing startup files into redirects.

No unrelated product feature or user-data change was included.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.21.0.md`

# Release Notes — ZEKE v0.21.0

**Build:** 2026.07.18.2

## User-facing improvements
- Fitness Activity Library tabs: Frequent, Favorites, Strength, Cardio, Mobility, Recovery.
- Frequent activities are ranked using recent use and session count.
- Activity cards are compact by default and expand for recent details and coaching.
- Stair climber is now treated as a cardio activity rather than a standalone top-level section.
- Coach’s Eye is compact by default and expands for evidence, recent sessions, and actions.
- Replaced unclear deeper-analysis language with View full analysis, Ask ZEKE, and Open in Pattern Lab.
- Health adopts a Frequent, Measurements, and Labs library with expandable items.
- Proactive Health insights remain visible while Pattern Lab handles deeper analysis.
- Added local runtime diagnostics export and clearing controls in Settings.

## Continuity and release discipline
- Single runtime version source is exposed through both `ZEKE_VERSION` and `ZEKE_BUILD`.
- Current-state, gate, iteration, release, and audit records identify this release consistently.
- Development errors, release evidence, runtime diagnostics design, rejected paths, and backlog remain separated by purpose.

## Not yet verified live
Google Drive, Calendar, AI providers, and deployed-origin rendering require environment testing.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.22.0.md`

# ZEKE v0.22.0 Release Notes

**Build:** 2026.07.18.3

## Implemented
- Persistent desktop navigation rail; compact tablet rail; mobile bottom navigation with More overflow.
- Fluid layout rules that adapt continuously rather than only at named breakpoints.
- Coach’s Eye separated into Now, Next Session, and Patterns, using abbreviated coaching.
- Full exercise evidence remains in activity tiles; repeated preview advice disappears while a tile is expanded.
- Coaching chart reduced to a compact evidence view.
- Activity links preserve context when opening the exercise or Pattern Lab.
- Preferred name moved to an optional user profile with a neutral fallback.

## Verification limits
Credentialed providers, deployed-origin rendering, continuous browser-width dragging, and real-device mobile behavior remain user/environment verification items.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.22.1.md`

# ZEKE v0.22.1 Release Notes

**Build:** 2026.07.19.1

## Preserved application features
- Persistent desktop navigation rail; compact tablet rail; mobile bottom navigation with More overflow.
- Fluid layout rules that adapt continuously rather than only at named breakpoints.
- Coach’s Eye separated into Now, Next Session, and Patterns, using abbreviated coaching.
- Full exercise evidence remains in activity tiles; repeated preview advice disappears while a tile is expanded.
- Coaching chart reduced to a compact evidence view.
- Activity links preserve context when opening the exercise, Pattern Lab, or Talk to ZEKE.
- Preferred name is optional and user-profile-backed with a neutral fallback.

## Continuity repairs
- Corrected README release naming and release-gate status.
- Replaced stale Project Health identity and summary.
- Normalized artifact-registry release/build fields and lifecycle labels.
- Added a current v0.22.1 iteration record while retaining v0.22.0 as historical feature evidence.
- Strengthened audits and negative controls for stale continuity metadata and contradictory status.
- Updated handoff, state, gate, tests, checksums, and independent-review instructions.

## Verification limits
Credentialed providers, deployed-origin rendering, continuous browser-width dragging, and real-device mobile behavior remain user/environment verification items.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.22.2.md`

# ZEKE v0.22.2 — Responsive Stabilization, Activity Foundation & Continuity Reconciliation

**Build:** 2026.07.19.4

## Application work inherited from build 2026.07.19.2
- Stabilized Dashboard and Fitness layout structure using independent content-sized rows.
- Added a canonical activity registry shared by library and structured entry, including Chores & Functional Activity.
- Added modality-aware activity summaries and non-strength metrics.
- Added Health Favorites with a separate versioned preference key.
- Repaired Pattern Lab focus propagation and generic-navigation stale-focus clearing.
- Added editing for one workout record at a time, preserving prior state in correction history and refreshing derived views.
- Extended integrity coverage to active runtime files.

## Build 2026.07.19.3 continuity correction
- Reconciled README, Architecture, Feature Status, Handoff Brief, Backlog, Decision Log, Development Error Log, Comprehension Checkpoint, Runtime Diagnostics, Project Health, Project State, gates, registry, release notes, test report, and checksums.
- Recorded explicit boundaries for activity identity, migration, correction history, and asset cleanup.
- No additional user-facing application feature was added.

## Explicitly deferred
Global rename, duplicate identity merge, bulk/ambiguous historical migration, full correction-history browser/global undo, and event-sourced replay.

## Verification boundary
Package integrity and structural regressions are verified locally. Live providers, service-worker deployment behavior, arbitrary-width deployed rendering, and physical-device accessibility remain environment-dependent.

## Build 2026.07.19.4 — dashboard-only acceptance repair

A deployed screenshot showed that the prior responsive repair still allowed the Health at a Glance rail to determine shared grid-row height, leaving a large blank area in the main Dashboard. The Dashboard markup now has two independent flows: a main content stream and a separate health rail. This build intentionally adds no other feature or behavior change.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.23.0.md`

# ZEKE v0.23.0 — Conversation Intelligence & Trusted AI Foundation

**Build:** 2026.07.19.5

## Implemented

- Recent Health Record Review/Edit opens a record-specific editor instead of routing back to the Dashboard.
- Health-record corrections preserve prior values through the existing correction-history path.
- Pending correction flows are closed when an unrelated new health entry is detected, preventing stale edit state from capturing later messages.
- Direct affirmative replies such as “sure” are treated as answers to the active ZEKE question rather than as new records.
- Conversation transcript now renders date separators and message times.
- Added a provider-neutral background-consultation envelope with a fixed outcome allowlist. External AI output is treated as untrusted and cannot request execution, tools, commands, or unauthorized outcomes.
- Dashboard Health at a Glance rail is bounded-fluid rather than fixed-width.
- Added system-wide content-driven responsive composition rules so unrelated sections do not share forced row heights.

## Safety boundary

External AI can only return validated advice within an allowed outcome list. ZEKE retains exclusive authority over record writes and external actions. Prompt content is separated into trusted task instructions and untrusted user data.

## Known limitations

- This is the first vertical slice of the orchestration architecture, not the complete long-term Conversation Engine.
- The active-question detector currently uses explicit question/metadata cues and should be expanded with durable topic objects in later releases.
- Record-specific editing currently covers health measurements/labs and existing workout editing; medication-specific structured editing remains separate.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.23.1.md`

# ZEKE v0.23.1 — Health & Fitness Workflow Stabilization

**Build:** 2026.07.20.1

## What changed

### Sleep and confirmation
- Added deterministic parsing for explicit sleep periods and duration-only sleep reports.
- A typed affirmative response to a pending save now completes that transaction before general interpretation.
- Added direct structured sleep logging from the Health Library Sleep tile.
- Added saved-record navigation and undo support.

### Health records and review
- Sleep is displayed as its own health-event type.
- Recent Health Record and dashboard evidence include sleep and Potential Health Events.
- Review Questions now show the original information, concrete proposal, and exact decision.
- Metric deltas are described as change over the selected period, not as reference-range status.
- Exact display duplicates are collapsed while source records remain preserved.

### Fitness
- Activity tiles consistently select and label a comparable numeric metric or explain why no chart is available.
- Flat trends render rather than disappearing.
- Coach’s Eye and Activity Library use one shared recommendation.
- Initial workout logging and workout editing expose the same optional RPE, pain, technique, notes, and injury/PT context fields.

### Insights, calendar, and navigation
- Replaced internal parsing terminology with concrete observations and useful next actions.
- Added defined-use health follow-up prompts for recent health-related calendar events; calendar presence is never proof of attendance or completion.
- Added a durable Potential Health Events context stream for future relationship analysis.
- Moved Labs into Health and Pattern Lab under Insights.

### Layout
- Rebuilt the dashboard as independent vertical stacks and improved narrow-column coaching readability.

## Compatibility and safety
- Canonical storage and user ownership are unchanged.
- New fields and records are additive.
- AI remains advisory; deterministic code controls record writes.
- No migration is required to roll back to the uploaded v0.23.0 package.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.24.0.md`

# ZEKE v0.24.0 — Trust, Conversation & Workflow

**Build:** 2026.07.21.1

## Added

- Durable workflow transactions with explicit goals, missing decisions, proposed changes, save/duplicate/AI state, actions, history, and outcome.
- User-visible workflow status in Talk to ZEKE.
- Conversation Memory: Waiting for You and Things I’ve Learned.
- Context-specific medication schedule editor.
- Settings-based Support & Improvement Report workbook with privacy controls.
- Unresolved-interaction, workflow, AI, correction, feedback, technical, and audit diagnostics.
- Safe Talk attachment routing for supported structured files.

## Changed

- Review items now show original information, ZEKE’s understanding, proposed record/action, why it matters, and what ZEKE will do.
- Buttons describe the action they complete rather than generic confirmation where practical.
- Deferral, dismissal, duplicate, undo, and failure responses state whether data changed. “Later” preserves questions in Waiting for You and moves them behind newer questions.
- Pattern language says values moved in the same or opposite direction instead of implying an increase.
- Fitness time-period controls and insight layout use less space.
- Current static architecture and legacy bundles are explicitly documented.
- Existing clarification questions can now be updated or resolved without the idempotency guard mistaking the update for a duplicate.
- Open workflows restore common pending state after refresh and provide a visible Resume action.
- Diagnostic export controls now retain privacy, date-range, and clear-after choices across background renders.
- Previously inert metric overflow buttons now open the relevant metric detail; duplicate review-pill IDs were replaced with consistently bound review actions; icon-only workout controls now have accessible names.

## Safety and privacy

- Full workflow content is stored in the user-owned ZEKE repository.
- Local workflow persistence is minimized to operational metadata.
- Support exports remove credentials and offer Full developer, Technical only, and Anonymized modes.
- Calendar events remain context, not proof of attendance; scheduled medication remains expectation, not proof of a dose.

## Known environment boundaries

Live Drive, Calendar, external AI, service-worker deployment, protected workbook, download behavior on every browser, and physical-device accessibility are not established by local package tests.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.25.0.md`

# ZEKE v0.25.0 — Adaptive Fitness & Provider Preview
**Build:** 2026.07.21.2

## Integrated changes
- Added activity-specific Fitness detail tables so strength, cardio, rehabilitation/PT, mobility, recovery, sport, and functional records show only meaningful columns.
- Added a mobile-friendly Gym Logging entry point with larger fields and a one-click **Repeat last workout** workflow that preloads the previous session for quick editing.
- Reframed progression output as cautious **considerations** rather than recommendations.
- Added Provider View with PT, primary-care, and orthopedic focuses, a 30-day activity and pain snapshot, current activity details, visit questions, and browser print/PDF support.
- Expanded Profile settings to distinguish preferred name, pronouns, gender identity, optional sex assigned at birth, and optional clinically relevant anatomy/physiology context.
- Kept Dashboard as home and retained the existing bottom mobile navigation, review workflow, provenance, duplicate detection, and user-owned storage model.
- Revised the existing Constitution and Architecture rather than replacing them.

## Beta boundary
Profiles and provider presentation are preview-ready for local testing. Secure centrally administered AI for multiple independent beta users is not complete in this static package and requires a protected proxy/backend before outside accounts use a shared key.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.25.1.md`

# ZEKE v0.25.1 — Trust & Usability Restoration

This corrective release responds to direct usability review of v0.25.0.

## Restored and corrected
- Removed the duplicated, premature Provider View.
- Preserved Dashboard as the primary health overview.
- Added collapsed-by-default medication and diagnoses/conditions summaries for privacy.
- Fitness now starts on Favorites; when none are selected, ZEKE clearly shows most-used activities as a temporary fallback.
- “Review evidence” now opens a focused evidence review rather than a generic Pattern Lab page headed by an internal identifier.
- “+ Add activity” for defining a reusable activity is now “+ Create activity type.”
- Splash screen, runtime fallback, service worker cache, and continuity metadata now agree on v0.25.1 build 2026.07.21.3.

## Still requiring environment review
- Physical-phone layout and tap flow
- Live storage and AI connections
- Real data rendering of collapsed private summaries
- Browser/service-worker update behavior after deployment


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.25.2.md`

# ZEKE v0.25.2 — Mobile Workout Save Hotfix

## Fixed
- Reworked Gym Logging save handling for mobile browsers.
- Save now responds immediately with “Checking…” and then “Saving…”.
- Added a direct click handler in addition to form submission handling.
- Moved duplicate-check failures into a non-blocking warning path.
- Added a safe transaction-ID fallback for browsers without `crypto.randomUUID()`.
- Any save failure now appears visibly inside the workout form instead of failing silently.

## Scope
This is a focused hotfix based on a real mobile failure reported against v0.25.0. It does not attempt additional dashboard redesign work.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.26.0.md`

# ZEKE v0.26.0 — Daily Briefing & Health Architecture

**Build:** 2026.07.22.1  
**Implementation baseline:** v0.25.2 Mobile Workout Save Hotfix  
**Regression reference:** v0.23.0 Conversation Intelligence / Trusted AI Foundation

## Release intent

This release addresses the concerns raised during the July 21–22 review as one integrated update. It preserves the mobile workout-save repair from v0.25.2 while correcting Dashboard, sleep, Fitness, medication, profile, goal, evidence, and navigation regressions.

## Dashboard and navigation

- Replaced the sparse/shared-height Dashboard composition with an explicit daily-briefing flow.
- Added Health at a Glance, followed by one compact row for Today’s Actions, Coach’s Eye, and Upcoming.
- Gave expandable Trends & Analysis a full-width row so expansion does not create empty neighboring columns.
- Increased card rounding and reduced coupled white space.
- Health at a Glance metrics are selected from Health and can be reordered with explicit controls.
- Preserved **Questions for You** as the visible conversational language.
- Moved Discover into primary navigation.
- Kept Labs, Measurements, Medications, Nutrition, Sleep, Symptoms, and Conditions inside Health rather than as global-sidebar peers.
- Removed the duplicated Provider View concept from the active application.

## Health and sleep

- Sleep confirmed through Talk to ZEKE now uses the same semantic Health path as direct entry and appears in Recent Health Record.
- Deterministic and direct sleep saves share wake-date fields.
- Replaced fragile free-text sleep-time entry with hour, minute, and AM/PM pull-downs.
- Added sleep-specific editing for date, start, end, quality, interruptions, and notes.
- Added reversible Remove controls for Recent Health Record. Removal creates an audit-preserving undo event instead of silently deleting history.
- Recent Health Record and Dashboard search recognize sleep as a first-class Health record.

## Fitness

- Preserved the v0.25.2 direct mobile Save Workout click path, submit fallback, visible status, and error handling.
- Fitness opens on Favorites; when none are selected, it clearly shows the most-used fallback and explains how to favorite an activity.
- Activity cards are genuinely clickable and open focused activity details, replacing dead or ambiguous “view activity” behavior.
- Renamed the ambiguous “+ Add activity” affordance to **+ Create activity type**.
- Strength, cardio/stair, walking, rehabilitation, mobility, recovery, sport, and functional views show only relevant fields.
- Stair steps, ambulatory/walking steps, distance, duration, average heart rate, level/intensity, load, repetitions, and sets remain distinct fields.
- Workout history supports reversible Remove and a focused incomplete-record view.
- Added a provider-backed Goals panel. Goals may be reviewed structurally without AI or optionally reviewed by a connected AI. AI review is advisory, cannot save or alter the goal, and is not medical clearance.

## Medications and supplements

- Today’s medication actions now ask for an explicit outcome: **Taken today**, **Missed today**, or **Not taken yet**.
- Only a confirmed taken event marks a medication action complete.
- Added reviewed batch backfill for past medication doses using a date range and daily/weekly schedule. The preview lists dates, skips existing matching doses, and saves with batch provenance.
- Added visible recurring-schedule success and failure feedback; corrected the schedule-save path that could reference an undefined label.
- Kept the monthly medication/supplement review separate from individual dose completion.

## Profile portability

- The user profile now lives in provider-backed workspace preferences rather than an app-local personal profile record.
- A legacy local profile is migrated into the connected workspace when possible and then removed from the old local key.
- Device-local operational preferences may remain local; durable personal profile content follows the user-owned storage boundary.

## Evidence and recommendations

- Coach’s Eye contains actionable considerations only and may legitimately say that nothing needs attention.
- Trends & Analysis remains descriptive and may identify changes that require no intervention.
- Evidence review shows observations, limitations, dated records, related actions, Pattern Lab access, and a focused PubMed topic search.
- Recommendations remain cautious considerations grounded in available user data and research context rather than clinical directives.

## Interaction reliability

- Added lightweight global search across records, conversation, and discoveries.
- Limited render-state restoration to the app root so a delayed render cannot overwrite data being typed into an open modal.
- Preserved direct, visible success/failure outcomes for meaningful saves.

## Documentation and governance

The existing ZEKE Constitution was edited directly. Architecture, feature status, handoff, project state, gate, decision log, error log, registry, iteration record, test report, and release evidence were reconciled for this release. No parallel constitution was created.

## Deliberately deferred

- Broad session-based mobile Fitness redesign remains deferred until user-reviewed mockups exist.
- Live Google Drive, Calendar, AI-provider routing, deployed service-worker replacement, protected real-workbook, and physical-device/accessibility verification remain environment checks rather than package-local claims.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.26.1.md`

# ZEKE v0.26.1 — Fitness Navigation & Evidence Hotfix

**Build:** 2026.07.22.2

This hotfix repairs the specific navigation, disclosure, relationship-evidence, and coaching-evidence regressions reported after v0.26.0.

## Fixed

- Activity Library now opens on Favorites rather than a previously persisted category.
- The overflowing activity-type button strip has been replaced by a responsive view selector and search field.
- Dashboard Trends & Analysis and Private health summary disclosures remain open through normal rerenders.
- Review relationships is specific to the selected activity and no longer substitutes an unrelated generic pattern.
- Coach considerations now provide a “Why this? Research & evidence” view with the user-data trigger, ZEKE interpretation, direct research links, and limitations.

## Relationship data

Relationship screening can now pair sleep duration with activity-specific load, repetitions, duration, RPE, pain, and session count. It still requires at least five paired dates and never presents correlation as causation.

## Preserved

The v0.25.2 mobile Save Workout hotfix and the full v0.26.0 daily-briefing/Health architecture remain in place.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.27.0.md`

# ZEKE v0.27.0 — Gym Entry Mockup Fidelity

**Build:** 2026.07.22.3

## Included

- Full-window Gym Entry Mode based on the approved mockup hierarchy.
- Vertical scrolling without horizontal page scrolling.
- Today's Workout list and focused Exercise Workspace.
- Set-by-set strength logging, completion checkboxes, Add Set, and Copy Set 1 to all.
- Coach's Eye, progression, last-workout summary, Today's Entry, notes, and Form Guide.
- Edge-to-edge Form Guide bottom sheet.
- Adult-only, fully clothed, diverse guide-media policy; unreviewed images are withheld.
- Continuity documents updated in their established locations.

## Preserved

- v0.25.2 direct Save Workout safeguards.
- v0.26.1 Fitness navigation, Dashboard state, relationship evidence, and Coach evidence behavior outside the approved scope.

## Known limits

The complete reviewed guide-image library and physical-device mockup comparison remain unfinished environment work.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.27.2.md`

# ZEKE v0.27.2 — Exercise Screen Mockup Fidelity

**Build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1

The v0.27.2 runtime implements the exercise-screen mockup work described in the original release. The July 25 governance reconciliation preserves this runtime unchanged, establishes v0.27.2 as the recovery baseline, and records later binding decisions without claiming implementation.

The selected exercise replaces the workout list on screen. The hierarchy is: minimal header, Coach’s Eye, progression, last time, today’s entry, explicit Save Exercise feedback, and an in-place Form Guide bottom sheet over the dimmed exercise screen. Vertical scrolling is allowed; horizontal page scrolling is prohibited.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.27.3.md`

# ZEKE v0.27.3 — Audited Recovery Build

This release was rebuilt directly from the untouched v0.26.1 ZIP.

## Changes
- Mobile Today’s Workout workspace and Exercise Workspace
- Set-by-set reps with “Copy Set 1 to all”
- Coach’s Eye, progression, last-workout context, save/sync states
- Form Guide bottom sheet
- Guide Model settings and curated Creative Commons image metadata/attribution support
- Mobile viewport and safe-area improvements

## Packaging integrity
- All untouched v0.26.1 ZIP entries retain their original ZIP metadata and timestamps.
- Only genuinely modified or newly added files receive the v0.27.3 build timestamp.
- See `PACKAGE_AUDIT_v0.27.3.json` and `PACKAGE_AUDIT_v0.27.3.md`.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.28.0.md`

# ZEKE v0.28.0 — Workout Programs & Trusted Gym Logging

Build: 2026.07.23.0005

## What changed

- Added reusable Workout Programs, including built-in general routines, injury-aware examples, and user-created programs.
- Added Choose Program and Build Program controls to Today's Workout.
- Program selection creates an editable workout draft; it does not mark exercises complete.
- Exercise state now distinguishes not started, draft, and saved.
- Added explicit Cancel Workout and Finish Workout actions.
- Confirmed exercise entries are written to the existing workout event ledger with program identifiers, transaction provenance, and nulls for unentered values.
- User-created programs are written to the connected ZEKE preferences repository through the existing data layer.
- Finishing creates a workout-session summary event; merely opening or exiting Gym Mode does not.
- Added a deterministic readiness score based on confirmed recent sessions, pain, RPE, and load progression.
- Made Progression open the existing activity history view.
- Entering 0 repetitions removes that set; a blank field remains unknown.

## Safety and limits

Injury-aware built-in programs are conservative planning examples, not medical clearance, diagnosis, physical therapy, or individualized rehabilitation. Form Guide licensed photography and fully reviewed exercise-specific content remain pending rather than being represented as complete.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.28.1.md`

# ZEKE v0.28.1 — Exercise-Specific Form Guides

Build: 2026.07.23.0418

## Added

- Added a reviewed, exercise-specific Form Guide library for 17 common strength and cardio activities.
- Each reviewed guide now includes targets, equipment, level, setup, movement, common mistakes, practical cues, and a safety boundary.
- Replaced the generic placeholder panel with a real tabbed bottom sheet that keeps the user inside the exercise screen.
- Added licensed or public-domain photographs with visible creator, source, and license attribution.
- Added a clear offline/image-load fallback rather than silently leaving a broken image.
- Added a truthful fallback for unmatched custom exercises; it does not present generic content as reviewed for the exact exercise.

## Media delivery

The photographs are referenced from Wikimedia Commons rather than copied into this ZIP. This keeps the release small and preserves the source/license link beside each image, but the photos require an internet connection. Written guides remain available when offline.

## Safety boundary

Form Guides are educational. They are not diagnosis, medical clearance, physical therapy, or individualized rehabilitation. Injury-aware programs remain conservative planning examples and must respect clinician restrictions.

## Data and structure

No workout-storage schema or directory was changed in this patch. Confirmed entries continue to use the v0.28.0 event-ledger and connected-preferences paths. Blank values remain null/unknown rather than zero.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.29.0.md`

# ZEKE v0.29.0 — Gym Mode Recovery and Trusted Entry

**Build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2

This runtime rebuilds Gym Mode from the v0.27.2 recovery baseline while preserving the broader desktop ZEKE experience. The 2026.07.25.2 continuity reconciliation changes documentation only and does not alter runtime files.

## Implemented

- Mobile-focused Gym Mode with visible editable workout date.
- Start from Routine or Enter Exercises, with common exercises, library search, custom exercise entry, and one-at-a-time addition.
- Reorderable exercise list and explicit Suggested / Not started / In progress / Saved states.
- Primary fields prefilled from the most recent confirmed entry; optional RPE, pain, rest, and notes remain blank.
- Per-set editable weight and reps.
- Qualitative readiness categories with a numberless gauge and written explanation.
- Apply Recommended Progression changes only the unsaved form.
- Progression history remains inside Gym Mode.
- Strength/cardio-specific entry fields; cardio intensity may be blank or a range.
- Saving to storage → Saved language; no Gym Mode pre-save Saved or Synced status.
- End Workout exits the current Gym Mode visit without preventing later same-day entries.
- Local temporary recovery for unfinished Gym Mode entries in normal browsing.
- Form Guide bottom sheet with a reviewed-image subset and truthful no-verified-image fallback.

## Partial or outstanding

- The readiness rule is a simple heuristic, not yet the reviewed research-supported methodology.
- Tapping the guide image changes the expanded guide state but does not yet display a real multi-image movement sequence.
- Complete Form Guide media review coverage is not established.
- The secure cross-device AI credential vault is not implemented.
- Additional storage-provider adapters and a proven provider-neutral data layer are not implemented.
- Provider-backed routine management, multi-segment sleep, cross-domain editable dates, and separate desktop Workout Entry remain future work.
- Physical-device and deployed-provider acceptance were not performed in the build environment.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.30.0.md`

# ZEKE v0.30.0 — Mobile Workout Entry and Health Conditions

**Build:** 2026.07.26.1  
**Baseline:** ZEKE v0.29.0 Continuity-Reconciled

## Implemented

- Reframed “Gym Mode” as ZEKE’s mobile workout-entry experience rather than a disconnected subsystem.
- Added a prominent **Gym** action to the phone bottom navigation while preserving the desktop Fitness experience.
- Added a clear **Log exercise or activity** menu with three paths: enter one activity, start from a routine, or repeat the last workout.
- Added a common-exercise chooser with full-library search and custom-activity creation; activities are added one at a time.
- Preserved a visible, editable effective date in mobile workout entry and direct activity entry.
- Kept elapsed workout time out of the interface.
- Added provider-backed custom activity and routine preferences through the existing preference repository.
- Added a routine manager. Routines remain reusable templates and do not become historical workout units.
- Added a dedicated **Health → Conditions → Add condition** workflow with visible/editable date, status, source, optional resolution date, clinician/facility, and notes.
- Retained **All** alongside Week, Month, Quarter, 6 Months, and Year in applicable chart controls.
- Preserved truthful workout states: prefilled or routine-loaded values are not saved until the user confirms a storage write.
- Preserved blank optional fields such as pain, RPE, rest, and notes.

## Media limitation

Form Guide entries continue to show only images already present in the reviewed guide library. ZEKE does not substitute generic gym photographs for exercises without a verified image. Expansion provides a larger instructional view and movement guidance; a fully curated multi-image sequence for every exercise remains future content work.

## Verification boundary

Static JavaScript syntax, release-contract checks, file integrity, and ZIP integrity were verified. Physical iPhone/Android behavior and remote Creative Commons image delivery were not available for direct testing in this environment.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.31.0.md`

# ZEKE v0.31.0 — Mobile Workout Visual Fidelity and Form Guides

## Implemented
- Reworked mobile workout entry styling to follow the approved mockup hierarchy, cards, icons, spacing, and prominent Gym navigation.
- Preserved desktop ZEKE and scoped the new styling to phone-width workout entry.
- Integrated the reviewed 17-guide Wikimedia Commons library with per-image attribution and exercise-specific Setup, Movement, Common Mistakes, and Tips.
- Form Guide opens as a 75–80% bottom sheet and supports an expanded image view.
- Added transactional Save Sleep feedback and a provider-agnostic reconnect dialog on storage failure.
- Updated splash, runtime, and continuity version references.

## Honest limitation
The requested additional 20 common-exercise photo set is not fully curated in this package. Seventeen reviewed photo guides are included; unsupported exercises keep written fallback guidance and explicitly avoid unrelated images. This release does not claim those remaining photos are complete.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.40.0.md`

# ZEKE v0.40.0 Release Notes

**Build:** 2026.08.03.1  
**Release label:** Trust, Mobile, Dashboard & Fitness Milestone

## Data integrity and repair

- New dashboard review status and Repair Center.
- Detects supported exact duplicates, known spreadsheet legend artifacts, implausible sleep, zero-as-missing heart rate, malformed paddling fields, answered medication questions, duplicate discoveries, and stale sparse-data discoveries.
- Shows the real-world issue, evidence, recommendation, and confidence before action.
- Creates a provider-backed integrity backup before approved mutations.
- Preserves provenance and correction history; does not invent missing values.
- Adds in-session undo and duplicate-write prevention.

## Dashboard and mobile

- New lighter dashboard composition based on the approved mockup.
- Story cards, Health at a Glance, weekly expectations, Coach’s Eye, truthful recent activity, and review status.
- Visuals use recorded points only; routes and trends are omitted when unsupported.
- Mobile-wide responsive navigation and quick logging; no separate gym-only application.
- Touch-friendly modals, sticky actions, clear completion/exit paths, and direct form-guide access.

## Fitness knowledge and planning

- 102 equipment-aware exercise/activity knowledge objects.
- 12 built-in routine templates.
- Weekly planner asks expected remaining gym and home sessions without inferring commitment from an open calendar.
- Activity-specific fields distinguish strength, cardio, sport, rehab, mobility, recovery, and functional activities.
- Machine, Bowflex, dumbbell, barbell, Smith, cable, and bodyweight variations remain distinct.
- “Glute Lift” is retained as a separate machine identity rather than being merged into Leg Press; exact machine style can be confirmed later.
- Rich guides include setup, movement, mistakes, breathing, mind-muscle cues, modifications, evidence metadata, and source/license media where available.

## Deployment

Replace the complete verified runtime set rather than selecting files by modification date. The service-worker cache is `project-zeke-v0.40.0-20260803.1`. See `DEPLOYMENT_MANIFEST_v0.40.0.md`.

## Known limitations

- Live Google Drive repair and physical-device acceptance require deployment testing.
- Remote exercise images require network access and may become unavailable; written fallbacks remain.
- Deep manual curation is strongest for the high-use core set; lower-priority objects need ongoing evidence review.
- Advanced periodization, watch interfaces, and additional storage providers remain future work.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.40.1.md`

# ZEKE v0.40.1 — Sprint 1: Unified Mobile Input & UI Density

This verified incremental package builds directly on v0.40.0. It prioritizes Talk to ZEKE on mobile, removes gym-only framing from the central mobile action, tightens whitespace, and improves information density without changing the underlying activity architecture.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.40.2.md`

# ZEKE v0.40.2 — Sprint 2: Adaptive Activity Schemas

This sprint builds on v0.40.1 and replaces fixed activity-entry assumptions with schema-driven fields.

## Highlights

- Custom activities can choose their own fields and whether each is required.
- Rehabilitation/PT activities no longer default to strength or require weight.
- Cheerleaders has a dedicated PT-friendly field set.
- Massage Chair has recovery-specific fields.
- Direct activity entry uses one shared schema for rendering, validation, saving, and provenance.

See `SPRINT_2_ACTIVITY_ARCHITECTURE_REVIEW.md` for verification and known limits.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.40.3.md`

# ZEKE v0.40.3 — Sprint 3 Workout Intelligence & User Control

Built on v0.40.2.

## Added
- Per-activity recommendation preferences: More, Balanced, Less, and Exclude.
- Clear explanations of how each preference affects recommendations.
- Persistent, reversible preference storage separate from workout records.

## Changed
- Excluded activities are hidden from recommendation-oriented activity views but remain available in All for management and history.
- Coach's Eye will not recommend an activity marked Exclude.
- Activity cards display non-neutral preference status.

## Preserved
- Specific activity relationship reviews.
- Evidence and limitations views.
- Form guides, favorites, activity-specific schemas, and provenance.

## Known limitation
Routine generation does not yet fully weight More/Less preferences. That integration is deferred to a later refactor.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.7.0.md`

# ZEKE v0.7.0 — Repair Release
Build: 2026.07.09.1

This release replaces the brittle overlay/legacy-mount approach used in several earlier alpha patches with a standalone, source-maintained static application shell that reuses the existing ZEKE repository schema.

## User experience

- One unified **Talk to ZEKE** conversation surface.
- No separate Ask ZEKE, Your Discoveries input, or detached response area.
- Clarification, interpretation confirmation, correction, duplicate resolution, unanswered questions, and AI escalation occur in the same conversation.
- Ambiguous input such as `BP 120 12 2` produces a natural-language clarification instead of guessing or exposing parser output.
- Persistent “questions for you” indicator with Answer now, Later, I don't know, and Ignore behavior.
- Deferred questions do not immediately reappear in the open-question indicator.

## Dashboard

- Mockup-aligned clean, data-dense layout.
- Health at a Glance shows prominent verified values and only plots real event-repository data.
- Week, Month, Quarter, 6 months, Year, and All ranges.
- Hover details on graph points.
- Contextual + Log actions from metric cards.
- Coach's Eye analyzes repeated exercise records and shows evidence/reasoning in expanded view.
- “I've been thinking…” remains conversational.
- Personal & family health history is intentionally kept off the dashboard and appears under Health.
- Sleep is treated inside Health rather than as a separate top-level domain.
- Today's Actions is horizontally scrollable/swipeable and uses current-local-day confirmed events only.

## Data integrity

- No demo personal health values are embedded in production files.
- Confirmation is required before interpreted structured events are saved.
- Likely duplicate entries are checked before creating another structured data point.
- Corrections preserve an audit event rather than silently erasing the prior version.
- Spreadsheet import supports XLSX, JSON, CSV, and TSV.

## AI Router

- Groq Free / Developer is explicitly visible.
- Gemini and OpenRouter connections are also available.
- The current provider/model catalog exposes 11 model choices across the free-first connections.
- Connect & test validates a provider through the visible UI.
- The router chooses among connected services by task/capability and can fall back when a provider request fails.
- Manual AI packet export/import remains available.

## Settings architecture

- AI Connections configures access; it does not ask the user to choose an active AI.
- Storage UI shows Google Drive as available in this alpha and clearly labels OneDrive, Dropbox, Nextcloud/WebDAV, private SFTP, and Local Folder as planned adapters.
- Calendar UI shows Google Calendar as current and clearly labels Apple Calendar/iCloud, Outlook/Exchange, and broader standards-based paths as planned/currently limited.

## Important limits

- Real Google OAuth behavior must still be accepted on the deployed GitHub Pages origin.
- Real external AI calls require the user's provider credentials and provider availability.
- Direct AI keys are intentionally not persisted across a full page session restart in this browser-only alpha.
- Continuous spreadsheet synchronization is not yet implemented; the import path converts historical spreadsheet rows into ZEKE events.
- Non-Google storage adapters and non-Google calendar connectors are shown as planned, not falsely presented as operational.
- File/image interpretation directly from the conversation composer is not complete in this release.
- A durable encrypted offline pending-sync queue is not complete yet.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.8.0.md`

# ZEKE v0.8.0 Milestone Alpha

Build: **2026.07.11.1**

## Release theme

**Personal Data Intelligence + AI-First Conversation**

This milestone focuses on a polished desktop dashboard and on making existing user history useful. It is not a demo-data release: production UI cards are driven by connected/imported records and unavailable metrics stay hidden.

## Major changes

- Dark-first polished desktop dashboard aligned with the approved ZEKE mockup.
- Light, Dark, and System appearance choices.
- Clean unfilled line charts by default; no filled area-chart default.
- Trend panels are omitted when there are not enough observations to support a trend.
- Health at a Glance uses latest verified values overall while range controls affect trend analysis.
- One persistent Talk to ZEKE transcript with both user and ZEKE messages.
- AI-first conversational interpretation when a connected AI service is available; deterministic validation and confirmation still protect the record.
- Context-aware clarification answers such as `1x/week, usually on Fridays` update the relevant schedule.
- Persistent clarification queue with Answer now, Later, I don't know, and Ignore.
- Date-scoped Today's Actions and horizontally scrollable action tiles.
- Duplicate review that distinguishes accidental duplicates from legitimate repeated events.
- Spreadsheet/JSON ingestion that writes accepted records into the same event repository used by the dashboard and Coach's Eye.
- PHAS/Health Cortex-oriented spreadsheet normalization for Measurements, Medication, Strength Training, Workout Log/Cardio, Supplements, Labs, Daily Log, and Injuries/Pain patterns.
- Excel serial date handling.
- Long-form lab and measurement normalization.
- Import reports with rows read, records imported, duplicate reviews, and clarification counts.
- Coach's Eye session aggregation for one-row-per-set strength logs.
- Deeper optional AI Coach analysis using actual exercise history and relevant context; AI cannot alter records.
- Stable provider-independent `workspace_id` in repository manifest.
- Persistent conversation and import batch history in the user-owned repository.
- Session-scoped Google access-token restoration for normal browser refreshes while the token is still valid; long-lived secrets are not stored in localStorage.
- Broad AI connection registry; the AI Router chooses among connected services. The user does not select an active/default model for ordinary use.
- Manual AI packet export/import remains available.
- Mobile Preview control included for design evaluation; desktop remains the primary milestone target.

## Important alpha limits

- Google Drive is the operational storage adapter in this build. OneDrive, Dropbox, WebDAV/Nextcloud, SFTP, and local-folder adapters are presented as planned, not functional.
- Google Calendar is the operational calendar connector in this build. Apple/iCloud, Outlook/Exchange, and CalDAV/ICS connectors are planned.
- Arbitrary spreadsheet changes are not yet continuously synchronized after import; import is currently an explicit ingestion action.
- Direct browser API-key use is an alpha convenience and has security tradeoffs. Provider metadata persists, but API keys remain in memory for the browser session. Secure relays are preferable for broader distribution.
- Live OAuth behavior and live AI credentials must be tested on the deployed GitHub Pages origin.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.8.1.md`

# ZEKE v0.8.1 Evaluation Alpha

Build: **v0.8.1 · 2026.07.11.2**

This is a direct patch of the v0.8.0 milestone codebase. It preserves the existing Google Drive repository, event model, interpretation pipeline, confirmation workflow, conversation persistence, and AI Router.

## Visible changes
- Version labels and cache-busting identifiers updated throughout the deployable site.
- New real-data coverage strip showing verified records, health/lab entries, workouts, medications, unresolved questions, and latest evidence date.
- “I’ve been thinking…” redesigned as a compact evidence-linked feed that can use saved discoveries, workout progression, available health metrics, and repeated supplement/nutrition mentions.
- Additional density and responsive styling without inserting fabricated personal records.

## Validation
- JavaScript syntax checked with Node.
- Static-site file references checked.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.8.2.md`

# ZEKE v0.8.2 — Workout History Compatibility Release

## Fixed
- Workout history detection now recognizes legacy and imported categories including workout, exercise, exercise sets, fitness, strength training, resistance training, cardio, and training sessions.
- Records with workout-shaped structured fields are recognized even when their original category label differs.
- Common historical workout text can be recognized as a fallback without rewriting the source record.
- Fitness now contains a chronological **Workout history** table showing date, activity, load, reps/sets, duration/steps, and provenance.
- Exercise summaries and Coach's Eye use the same normalized compatibility layer.

## Version
Visible build label: `v0.8.2 · 2026.07.11.3`


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.8.3.md`

# ZEKE v0.8.3 — Data Visibility and Compact Dashboard Safety Release

## Purpose
This release fixes data invisibility and awkward dashboard gaps without migrating, rewriting, deleting, or consolidating existing records.

## Data safety
- No automatic repository migration.
- No changes to `health/events.json` format.
- No deletion or replacement of imported source records.
- Compatibility normalization is performed in memory for display only.
- Repository and workout diagnostics are read-only.

## Improvements
- Flexible recognition of health and lab records across legacy/imported field names.
- Expanded Health at a Glance metric catalog.
- Recent Health Evidence panel displays useful records even when there are too few points for a graph.
- Read-only repository inventory reports loaded record categories and recognized metrics.
- Workout Data Status distinguishes recognized workouts, possible unrecognized candidates, and source files/sheets.
- Independent dashboard columns remove large blank grid areas when panels have uneven heights.
- Visible build identification updated to v0.8.3 / 2026.07.11.4.


---

## Historical source: `docs/history/release-notes/RELEASE_NOTES_v0.9.0.md`

# ZEKE v0.9.0 — Data Integrity Read-Only Alpha

Build: **v0.9.0 · 2026.07.11.5**

This release adds a read-only Data Integrity workspace so missing display data can be diagnosed without changing existing records.

## Added
- Repository census with loaded event counts, category counts, source counts, and date coverage.
- Explicit distinction between recognized workouts and possible workout-shaped records.
- Metric registry showing how health/lab names map to dashboard metrics.
- Import diagnostics using preserved import-batch reports.
- Canonical repository map for the files ZEKE expects under `Project Zeke`.
- Searchable repository browser showing classification, summary, provenance, and status.
- Exportable JSON data audit for troubleshooting and handoff.

## Data safety
- No migration is run.
- No source spreadsheet is edited.
- No canonical JSON file is rewritten by opening or filtering the Data Integrity page.
- No uncertain record is automatically reclassified or merged.
- Export creates a local audit download only.
