# ZEKE Consolidated Test Guide — v0.48.0 current development

**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2

## v0.48 integrity/interaction checks
1. Run JavaScript syntax checks and `node tests/v048-interaction-integrity.test.js`.
2. Run `node tests/factor-idempotency.test.js` and existing v0.47 carry-forward tests.
3. In the deployed authorized Google environment, open the duplicate-event question and choose **Same event — keep one**. Verify immediate Saving state, provider acknowledgement, question disappearance, reload persistence, and no duplicate error notices.
4. Force/encounter expired authorization where practical. Confirm one silent retry; if it cannot recover, one reconnect-required status is shown and the question remains unresolved after reload.
5. Do not describe the defect as fixed until the persistence round-trip is demonstrated.

# ZEKE Consolidated Test Guide

**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6

Living manual and environment-dependent validation guide. Historical guide content is retained below and should be edited in place for future releases.

## v0.47.0 release / recovery checks

### Browser-rendered visual acceptance
- Run `python3 tests/v047-desktop-visual-gate.py`.
- Run `python3 tests/v047-route-render-gate.py`.
- Run `python3 tests/v047-dashboard-adversarial-gate.py`.
- Inspect the generated screenshots against `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png`.
- Confirm no page-scale icon/SVG, irregular shared gutters, cross-column dead-space cascade, or unbounded Dashboard list.
- Run mobile rendered checks at 320/375/390/430/768px and confirm the separate mobile composition remains intact.

### Governance and authority
- Run `python3 tools/project_audit.py`. It must verify **all registered authoritative documents** have the exact current release/build/governance review stamp and that standing supporting-continuity documents are current.
- Run `python3 tests/governance-negative-controls.py`.
- Confirm runtime identity is v0.47.0 build 2026.08.24.1; governance revision is 2026.08.24.6.
- Search active runtime-facing files for stale startup/build strings. Historical documentation may contain old versions when clearly historical.

### Desktop/UX
- Cold-load Dashboard before any refresh and verify the page can reach its final meaningful content.
- Confirm Dashboard uses deliberate readable columns; no text-heavy narrative card collapses into a narrow strip and no unrelated sibling creates large dead space.
- Confirm Recent Activity uses stable visual cues and remains intentionally scrollable on desktop when content exceeds its bounded window.
- Confirm Dashboard remains cross-domain rather than duplicating the full Health metric grid.
- Open Talk to ZEKE; exercise compact/expanded/close/reopen and verify page scrolling/navigation are restored after close.
- On Questions for You duplicate resolution, verify each consequential choice immediately produces visible selected/working feedback and Edit remains a separate tool.

### Fitness/body-area/variation
- Browse to an exercise without search using body/context navigation.
- Confirm exercise detail exposes linked primary/secondary body areas; body-area views can surface related exercise and existing injury/PT context.
- Confirm variation rows are recency-ordered and do not show redundant Last/Current/count labels.
- Confirm latest variation performance includes sets where applicable.
- Confirm detailed chart renders each variation as an independent shared-axis series; missing load is absent/gapped and one-observation variations remain points.
- Confirm a selected variation can be emphasized without losing the parent comparison.
- Confirm workout recommendation displays a short decision-relevant Why this before deeper explanation.

### Environment checks
Physical-device acceptance, deployed Google/Calendar/provider behavior, live AI-provider behavior, and real PDF/OCR ingestion remain environment checks and are not package-local passes.

---


---

## Historical source: `TEST_GUIDE_v0.17.2-alpha.md`

# ZEKE v0.17.2-alpha Test Guide

1. Verify identity: the page header must show `v0.17.2-alpha · 2026.07.16.6 · ZEKE-0172-REAL` and the logo must remain visible.
2. Health: enter a weight, sleep duration, and body measurement. Confirm no prior value is carried forward.
3. Fitness: use `+ Add to today's workout` on an existing exercise and enter weight/reps/sets. Confirm an empty workout is never saved.
4. Historical mode: choose an older date and repeat one direct entry. Confirm the selected date remains visible.
5. Restore Center: create a named restore point. Confirm its name, local date/time, version, and event count appear. Preview it; do not restore unless desired.
6. Review Queue: open one review item, expand/collapse it, and answer inside the scoped workspace.
7. Settings: copy diagnostics and verify the fingerprint is `ZEKE-0172-REAL`.


---

## Historical source: `TEST_GUIDE_v0.17.3-alpha.md`

# Test Guide — ZEKE v0.17.3-alpha

1. Confirm the top bar always shows the ZEKE logo and `v0.17.3-alpha · 2026.07.16.7`.
2. Open Fitness. Click **Add to today's workout** on an existing exercise tile. A numerical form must open; the app must not route to chat.
3. Try saving the exercise form empty. ZEKE must refuse.
4. Enter weight/reps/sets and save. Confirm the entry appears in Workout History for the selected date.
5. Open Review Queue. Confirm the page shows grouped **review tasks**, with granular questions under **Show granular questions**, and no `40 items need review` wording.


---

## Historical source: `TEST_GUIDE_v0.17.4.md`

# ZEKE v0.17.4 Test Guide

1. Confirm the splash and running header show `v0.17.4 · 2026.07.17.1`.
2. Confirm the ZEKE ribbon logo remains visible after the menu is closed.
3. Open Fitness, choose a prior exercise, and click its add action. A numerical form—not chat—must open.
4. Change the date in the exercise form and save a test entry. Confirm it appears under that date.
5. Open Review Queue. Confirm the header reports review tasks and related questions are grouped.
6. Expand and collapse a task. Confirm the button label changes with the panel state.


---

## Historical source: `TEST_GUIDE_v0.17.6.md`

# Test Guide — ZEKE v0.17.6

1. Confirm ribbon and `v0.17.6 · 2026.07.17.2` remain visible.
2. Open top **+ Log** and confirm the menu is readable on desktop and mobile.
3. Log Weight from the Weight tile; confirm there is no separate Add Weight section.
4. Log Stair Climber: duration/steps/level/HR should appear, not weight/reps.
5. Log Massage Chair: duration/area/program should appear, not weight/reps.
6. Log Shoulder PT with no required specific exercises.
7. Add a new stretch/activity, then verify it appears as a compact card with **+ Log**.
8. Use Log Workout with two different activity types and confirm each row has relevant fields.
9. Open Review Queue details and confirm they stay open until Collapse details is clicked.
10. Click the diamond status icon and confirm the toast is above Talk to ZEKE.
11. Use Log Intake for a 30 g protein shake quantity 2; verify 60 g total is recorded.
12. Repeat one entry on a historical date and verify it does not attach to today.


---

## Historical source: `TEST_GUIDE_v0.17.7.md`

# ZEKE v0.17.7 Test Guide

## Install
Replace the files listed in `FILES_TO_REPLACE_v0.17.7.txt`, then hard-refresh ZEKE. The build label should read `v0.17.7 · build 2026.07.17.3`.

## Activity cleanup
- Go to Settings → Data Integrity.
- Confirm duplicate groups are shown for capitalization variants.
- Select Preview & merge. ZEKE must show the aliases and number of affected workout records before proceeding.
- After merging, Fitness should show one canonical card and the workout history should remain present.

## Exact duplicate workouts
- Use Review & keep one on an exact duplicate group.
- Confirm ZEKE creates a backup and removes only the redundant copies.

## Undo
- Select Undo last cleanup.
- Confirm the immediately previous cleanup is reversed.

## Duplicate prevention
- Open Log Workout and submit once. The button must immediately become disabled and read Saving….
- Re-enter identical values for the same date. ZEKE should ask whether to save the likely duplicate.
- Confirm the activity dropdown contains only one spelling/case variant for each activity.


---

## Historical source: `TEST_GUIDE_v0.18.0.md`

# ZEKE v0.18.0 Test Guide

1. Deploy the complete repository and confirm the footer/top bar shows v0.18.0 build 2026.07.17.5.
2. Confirm the dashboard no longer contains a persistent chat card.
3. Confirm the floating **Talk to ZEKE** button opens and closes the chat panel from the dashboard and other pages.
4. Open **Life & Symptoms** and log:
   - a headache with severity;
   - a tinnitus event;
   - a gluten exposure;
   - a menstrual-cycle event;
   - a private life event.
5. Confirm entries appear in Recent Events and private entries display as “Private event.”
6. Confirm AI access is unchecked by default for each new event.
7. Open Quick Log and confirm Gluten exposure, Symptom / ailment, Life event, and Menstrual cycle appear.
8. Open Pattern Lab. With fewer than five paired days, confirm it reports insufficient overlapping observations.
9. After at least five dates contain two varying numeric variables, confirm Pattern Lab can display an exploratory association with r and n.
10. Open Insight Center and confirm research context is visually separate from personal trends and questions.

## v0.45.1 release checks

Run `node tests/v0451-integrated-release.test.js` for the integrated Fitness/adaptive-training/document-intake/medication/calendar/Constitution contract. Run `node tests/pt-visual-release-gate.js` for movement-specific PT media verification and `node tests/workflow-exploration-and-log.test.js` for the non-mutating Fitness/top-level Log workflow. The rendered suites must load the complete current runtime chain, including longitudinal schema, ingestion, document intake, calendar privacy, and training intelligence.

External real-data fixture tests may report SKIP when `ZEKE_TEST_DATA_ROOT` is not provided; a SKIP is not a pass. Live Google/AI-provider and owner physical-device acceptance are environment checks and must remain outstanding until actually run.
