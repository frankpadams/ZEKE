# Current release verification — v0.44.0

Static checks performed during build:
- app.js parses with Node.
- mobile-native.js parses with Node.
- 5-item mobile bottom navigation remains present.
- More drawer binding exists for both bottom-nav and mobile-header More.
- static splash contains v0.44.0/build 2026.08.18.0.
- dynamic loading HTML contains version/build.
- service-worker cache includes mobile-native CSS/JS.
- mobile Home has explicit status/snapshot/timeline/recent hierarchy.
- mobile Fitness presentation hides generic fitness insight/Goals content and exposes library-first tabs.

Physical iPhone screenshot acceptance remains required after deployment.

---

# ZEKE Living Test Report

## Current candidate — v0.43.1 Mobile Professional Polish

**Build:** 2026.08.17.1  
**Verification status:** package-local mobile implementation and archive-readiness checks passing; broader PT visual, physical-device, and live-provider gates remain explicit.

### Mobile and workflow verification passed

- Active JavaScript syntax: **12/12 runtime files passed** (`version.js`, app/data/parser/AI/workflow/form-guide/knowledge/integrity/longitudinal/ingestion/calendar modules).
- Package-local JavaScript regression suite: **23 passed, 0 failed, 4 fixture-dependent skips** across 27 `*.test.js` files. The skipped tests require protected live/workbook fixtures and self-identify as skipped when those fixtures are unavailable.
- `tests/mobile-professional-polish.test.js` — source contract passed for independent exact-variation chart series, missing-load omission, variation-before-Coach workflow, per-set effort/pain, complete three-path mobile logging menu, navigation cleanup, and the professional mobile visual layer.
- `tests/mobile-professional-polish.test.py` — rendered acceptance passed at **320, 375, 390, 430, and 768 px**. Core routes had no horizontal overflow; phone widths retained a balanced five-item bottom nav and no duplicate floating ZEKE control; the drawer occupied ~76.9% of a 390 px screen; and the mobile logging sheet retained Enter one activity / Start from routine / Repeat last workout without overflow.
- The same rendered test confirmed the Lat Pulldown canonical chart uses **two independent line paths** for two loaded exact variations, four loaded points total, and **no series for the missing-load Machine observation**. It also confirmed no duplicate Bowflex canonical tile, in-card period control, and loaded-summary logic based on comparable data.
- The batch workout path confirmed exact variation appears **before** Coach's Eye, same-variation history is used, variation is absent from Optional Details, every set has distinct effort and pain controls, a one-session progression state contains no empty graph, and the date/header does not cover the first set.
- `tests/v043-mobile-rendered-smoke.py` — direct single-exercise flow passed: variation selector/create-new, three inline set rows, per-set load/reps/effort/pain, Coach + Why, Form Guide, no dialog overflow, and no fabricated `RPE 0`/`RIR 0` when effort data is missing.
- `tests/rendered-workflow-smoke.py` — broad maintained workflows passed across Dashboard, Fitness, Health, Questions, Insights, and phone routes with no page errors or unnamed/unbound visible controls. Medication confirmation/backfill, search, dashboard disclosures, Fitness search/detail/evidence, goal save, rehab activity creation, sleep log/edit, review deferral, and recurring-schedule editing remained functional.
- `tests/v040-rendered-smoke.py` and `tests/support-report-browser-smoke.py` passed.
- `python tests/governance-negative-controls.py`: **9/9 negative controls passed**.
- `python tools/project_audit.py`: **0 errors, 0 warnings** before final manifest generation.

### Explicit release boundary

`node tests/pt-visual-release-gate.js` remains intentionally **blocked**: 14 included rehab/PT entries, 8 with verified two-frame guides, and 6 without acceptable exact-movement visual coverage:

- Shoulder Internal Rotation — Resistance Band (IR)
- Doorway Chest Stretch
- PNF Shoulder Diagonal 1 (D1)
- PNF Shoulder Diagonal 2 (D2)
- Shoulder External-Rotation “No Monies” Exercise
- Cheerleaders — Resistance Band

Physical-phone acceptance and live Google Drive/Calendar/cross-device-provider checks are not established by package-local Chromium. These blockers are not concealed or reclassified as passing.

---

## v0.43.0 RC2.1 continuity/self-description reconciliation

**Build:** 2026.08.16.3

### Passed in this reconciliation pass

- Added and executed `tests/v043-rc21-continuity.test.js`; required current authority documents are present and current architecture concepts are discoverable from the package.
- `node --check assets/app.js` passed.
- `node --check assets/data-layer.js` passed.
- `node --check assets/ai-router.js` passed.
- Full package-local JavaScript suite: **26 passed, 0 failed**; protected external-fixture tests explicitly self-classify as skipped when `ZEKE_TEST_DATA_ROOT` is absent.
- `tests/v043-mobile-rendered-smoke.py` passed at phone viewport: vertical 7-item navigation, no page overflow, variation selector/create path, three inline set rows, optional effort/pain, Coach + Why, and Form Guide with no dialog overflow.
- `python tools/project_audit.py`: **0 errors, 0 warnings** after reconciliation.
- Historical Gym Mode text remains in historical records but current authorities explicitly supersede it.
- Added living `RELEASE_NOTES.md` required by the documentation map.

### Not newly established

This reconciliation does not newly establish physical-phone acceptance, live Google Drive/Calendar behavior, cross-device credential persistence, remote PT-media availability, or clinical correctness. Those remain release gates/verification boundaries.

---

# ZEKE Living Test Report

## Current candidate — v0.43.0 RC2

**Build:** 2026.08.16.2  
**Package-local result:** passing, with explicit release blockers below.

### Passed

- `python tools/project_audit.py`: 0 errors / 0 warnings.
- `python tests/governance-negative-controls.py`: all negative controls passed.
- Active JavaScript syntax checks passed for app, data layer, AI router, and workflow engine.
- 25/25 package-local JavaScript test files returned success; protected real-data suites explicitly skip when `ZEKE_TEST_DATA_ROOT` is unavailable.
- `tests/v043-rc2-longitudinal.test.js`: medication occurrence, conversation interruption/meta, mobile calendar reconciliation, report/export, connected credential, and self-describing-package contract passed.
- `tests/v043-mobile-rendered-smoke.py`: vertical mobile drawer, no page overflow, variation selector/create flow, three independent set rows, optional effort/pain, Coach/why, and Form Guide passed.
- `tests/rendered-workflow-smoke.py`: desktop/mobile routes and maintained interaction workflows passed without page errors or unnamed/unbound visible controls on tested routes.
- `tests/support-report-browser-smoke.py`: anonymized support workbook and credential-exclusion workflow passed.

### Release blockers / not established

- Six PT/rehab movements still need verified high-quality visual guides.
- Physical-phone design acceptance is outstanding.
- Live Google Drive read/write, real historical medication reconciliation, retrospective calendar reconciliation, and cross-device API credential behavior are not established by package-local testing.
- Connected-workspace API keys are Drive/OAuth protected in this alpha; no additional ZEKE-managed end-to-end encryption layer is claimed.

---

# ZEKE Test Report

## Current candidate verification — v0.43.0 RC1

**Build:** 2026.08.15.1  
**Verification date:** 2026-08-15  
**Status:** package-local functional/browser checks passing; release remains blocked by incomplete PT visual coverage and physical-device acceptance.

### Passed package-local checks

- `node --check assets/app.js` — PASS.
- `node --test tests/*.test.js` — PASS, 24/24 test files; the three tests requiring `ZEKE_TEST_DATA_ROOT` report an explicit external-fixture skip when the fixture is unavailable and still run when supplied.
- `python tools/project_audit.py` — PASS after living-document consolidation.
- `python tests/governance-negative-controls.py` — PASS all negative controls.
- `python tests/rendered-workflow-smoke.py` — PASS desktop and mobile routes; no unbound/missing-name interactive controls in audited routes.
- `python tests/v040-rendered-smoke.py` — PASS after fixing a real mobile dashboard horizontal-overflow regression.
- `python tests/support-report-browser-smoke.py` — PASS.
- `python tests/v043-mobile-rendered-smoke.py` — PASS: mobile drawer items are vertically stacked, phone page has no horizontal overflow, and `+ Log Exercise` contains variation selector/create-new, inline per-set load/reps/effort/pain, ZEKE Coach last-workout/suggestion/why, and Form Guide.

### Release-blocking PT visual audit

`node tests/pt-visual-release-gate.js` currently reports **14** included rehab/PT knowledge entries, **8** with verified two-frame visual media, and **6** still missing acceptable exact-movement visual coverage:

- Shoulder Internal Rotation — Resistance Band (IR)
- Doorway Chest Stretch
- PNF Shoulder Diagonal 1 (D1)
- PNF Shoulder Diagonal 2 (D2)
- Shoulder External-Rotation “No Monies”
- Cheerleaders — Resistance Band

Side-Lying Shoulder Abduction now has verified public-domain start/end media from Wikimedia Commons. The six remaining entries are intentionally blocked rather than being filled with visually similar but mechanically different exercises.

### Environment / user acceptance still required

- Physical-phone comparison against the approved July mobile reference and the authoritative `+ Log Exercise` phone mockup.
- Live Google Drive/provider authentication and durable write/readback.
- Protected workbook tests with `ZEKE_TEST_DATA_ROOT` when that external fixture is available.
- Deployed remote-media availability.

---

# ZEKE Consolidated Test Report

Living test history. Each release edits this document; separate per-version test-report files are not retained in the package.


## Current release — v0.43.0 RC1

**Build:** 0.43.0 / 2026.08.15.1  
**Status:** RC implementation in progress; package-local deterministic regression coverage is passing for the new v0.43 requirements. Physical-device visual acceptance, live Google Drive write/readback, and protected-workbook fixtures remain environment-dependent release gates.

### v0.43 checks added
- Mobile + Log Exercise page: inline set rows with distinct weight/reps and optional per-set effort/pain.
- Canonical exercise family with variation-specific shared-axis chart series.
- Reviewable historical exercise consolidation and known user-confirmed mappings.
- Body Measurement selector with Body Composition and DEXA source/method provenance.
- Recent Health Record edit/remove correction path.
- Vertical mobile navigation drawer at responsive widths.
- PT guide completeness is explicitly a release blocker: included PT exercises without verified visual media may not be represented as complete visual guides.

### Test classification
- Package-local syntax and targeted v0.43 regression: **PASS**.
- Retained historical tests with obsolete exact-version assertions were updated to test the feature contract rather than falsely require an old version number.
- Tests requiring `ZEKE_TEST_DATA_ROOT` remain **environment-dependent**, not product failures.
- Physical-device mockup fidelity remains **not yet verified in this container** and must be checked before final publish.


---

## Historical source: `TEST_REPORT_v0.7.0.md`

# ZEKE v0.7.0 Test Report
Build: 2026.07.09.1

## Browser-render acceptance

Tested with system Chromium in headless mode using a test-memory provider and synthetic non-production seed data.

Passed:
- standalone app shell renders
- exactly one Talk to ZEKE surface
- no Ask ZEKE duplicate input
- Health at a Glance visible
- Coach's Eye visible
- “I've been thinking…” visible
- build identifier visible
- family-history section absent from dashboard and present under Health
- Today's Actions overflows horizontally rather than clipping
- previous-day atorvastatin event does not mark today's action complete in America/New_York timezone
- `BP 120 12 2` asks blood pressure versus bench press
- selecting blood pressure asks for explicit systolic/diastolic values
- `120/82` then produces a natural-language confirmation
- clarification answer can create a recurring schedule/action
- Groq Free / Developer appears in AI Connections
- no ordinary active-provider selector
- responsive dashboard becomes single-column at narrow viewport
- no browser page errors during the acceptance flow

## AI Router acceptance

Using mocked provider HTTP responses:
- provider connection/test path passed
- live question through the visible Talk to ZEKE composer returned AI output
- Groq failure followed by OpenRouter fallback successfully returned the fallback response
- no browser page errors occurred

This validates routing and UI behavior, not live third-party credentials or provider uptime.

## Storage startup acceptance

Using mocked Google Identity Services and Drive responses:
- stored safe setup metadata triggered a silent authorization request with empty prompt
- successful silent authorization produced `connected`
- failed silent authorization produced `reconnect-required`
- failed silent authorization did not return to first-time storage setup

This validates ZEKE's startup-state logic. Real deployed-origin OAuth acceptance remains necessary.

## Spreadsheet import acceptance

A test XLSX workbook with Vitals and Workouts sheets was imported.

Passed:
- XLSX reader loaded
- common metric columns mapped to measurement/lab events
- workout row mapped to a workout event
- blank spreadsheet cells did not create zero-valued fake measurements
- import result message remained visible after data refresh
- no browser page errors occurred

## Static integrity

Passed:
- JavaScript syntax checks for data layer, parser, AI router, and app
- all local references from index.html exist
- ZIP integrity test
- package contains no test seed data


---

## Historical source: `TEST_REPORT_v0.8.0.md`

# ZEKE v0.8.0 Acceptance Test Report

Build: **v0.8.0 · 2026.07.11.1**

## Passed in browser QA harness

- Standalone v0.8 dashboard renders from the current source tree.
- Visible build label matches package version.
- Six Health at a Glance cards render from seeded verified history.
- Default trend chart uses an unfilled line; no area-fill element is present.
- Sparse-data case: one blood-pressure observation shows one compact card and no trend panel.
- Unified transcript displays both user and ZEKE turns.
- Clarification exchange `1x/week, usually on Fridays` is retained in the transcript and updates Mounjaro to a weekly schedule with Friday as the usual day.
- AI-first interpretation receives recent verified events and conversation context; interpreted output still requires confirmation.
- Multi-sheet XLSX import reads Excel serial dates correctly and imports Measurements, Workouts, and Labs without false duplicate reviews.
- PHAS-schema acceptance workbook imports long-form Measurements, Medication administrations, one-row-per-set Strength Training, Cardio, Supplements, and Injury/Pain context.
- One-row-per-set strength data are aggregated into exercise sessions for Coach's Eye analysis.
- Likely duplicate review logic preserves distinct set numbers and distinct dates.
- Light theme applies successfully.
- Prior-day completion does not carry forward into current-day action completion in prior acceptance tests.
- Google Drive JSON reader handles both already-parsed JSON API responses and JSON text responses.
- Disconnect clears the session-scoped Google token.

## Controlled AI tests

AI routing and fallback behavior were tested with controlled provider responses/stubs. No claim is made that the user's specific live API credentials were tested. Connection tests must be run from the deployed app with the user's own credentials.

## Deployment-origin tests still required

The following depend on the real GitHub Pages origin and external provider behavior:

- Google OAuth/GIS silent restoration with the user's real session and browser policies.
- Live Drive read/write permissions.
- Live AI provider credentials, quotas, rate limits, CORS behavior, and model availability.
- Real Google Calendar data retrieval.

These are acceptance tests for the deployed alpha, not reasons to invent a passing result in the package.


---

## Historical source: `TEST_REPORT_v0.10.0.md`

# ZEKE v0.10.0 Test Report

Build: **2026.07.11.6**

## Automated checks completed

- JavaScript syntax validation passed for every application JavaScript file.
- Static-site HTTP smoke test passed.
- Idempotent reconciliation test passed:
  - first synchronization created one event;
  - second identical synchronization created zero events and reported one unchanged event;
  - changed source content updated the same event rather than appending another;
  - final event count remained one.
- Release ZIP integrity test passed.

## Data-safety behavior reviewed

- Timestamped JSON backup is created before a synchronization commit.
- Source workbook is stored as a managed copy and is not rewritten during synchronization.
- Human-readable spreadsheet output is written to a separate `ZEKE-Event-Mirror.xlsx` file.
- Blank source cells do not delete canonical JSON records.
- Semantic matches are linked rather than duplicated.
- Source-key matches are updated in place when the source value changes.
- Ambiguous source-key conflicts are preserved and counted rather than overwritten.

## Environment limitation

Google Drive network operations cannot be executed in the offline build environment. The Drive API code was syntax-checked and follows the same authenticated upload/read pattern already used by the existing application, but the first live Drive synchronization remains an alpha validation step.


---

## Historical source: `TEST_REPORT_v0.12.1.md`

# ZEKE v0.12.1 Test Report

- JavaScript syntax validation: passed for app, parser, data layer, AI router, and version files.
- Google session restoration inspection: constructor now restores a valid unexpired token from sessionStorage and no longer clears it on startup.
- AI connection persistence inspection: remembered provider keys are loaded from a stable localStorage namespace and never included in Drive metadata.
- Archive integrity: passed.

Live OAuth and provider calls require the user's authenticated browser and were not executed in the offline packaging environment.


---

## Historical source: `TEST_REPORT_v0.13.0.md`

# ZEKE v0.13.0 Test Report

- JavaScript syntax validation: required before packaging.
- Known blood-pressure artifact pattern: excluded from chart series and surfaced in Data Integrity.
- Stairclimber summary: sorted chronologically and computed from paired session objects.
- Mobile navigation: five visible destinations including Data Integrity and Settings.
- Mobile health cards: two-column grid, one column below 390 px.
- Data migration: none.


---

## Historical source: `TEST_REPORT_v0.15.0.md`

# ZEKE v0.15.0 Test Report

## Static checks
- JavaScript syntax: pending automated check in packaging step.
- Existing files preserved from v0.14.0.
- Version/cache identifiers updated.
- Brand assets bundled locally; no external image dependency.
- Manifest references bundled provisional app icon.

## Manual acceptance targets
1. Menu button opens slide-out navigation; clicking outside closes it.
2. Settings is the final navigation item.
3. Data Integrity is reachable from Settings.
4. Talk to ZEKE is available from Health, Fitness, Labs, Medications, Calendar, Questions, and Settings.
5. Expanded conversation button changes from Expand to Collapse.
6. Questions counter opens the Questions & Clarifications workspace.
7. Sleep “Explore evidence” opens a focused evidence panel.
8. Dashboard uses the new brand palette and compact top layout on wide displays.
9. Mobile layout keeps two-column health cards where space allows and converts the persistent chat to a bottom launcher.


---

## Historical source: `TEST_REPORT_v0.15.1.md`

# ZEKE v0.15.1 Test Report

- JavaScript syntax validation: passed for app.js, data-layer.js, parser.js, ai-router.js, and version.js.
- Dashboard structure: verified Talk to ZEKE is nested in the primary content column with subsequent panels below it.
- Responsive CSS review: desktop, tablet, and mobile breakpoints included.
- Theme migration: one-time light-theme evaluation migration included; Dark and System controls preserved.
- No health records or user configuration files were modified in this package.


---

## Historical source: `TEST_REPORT_v0.16.0.md`

# ZEKE v0.16.0 Test Report

- JavaScript syntax: passed (`node --check`)
- Stable workbook source key: verified in source
- Startup automatic sync: disabled
- Questions hash route: registered
- Expand/Collapse state: retained
- Coach exercise selector and dismissible alert: implemented
- Insight dismiss and refresh controls: implemented
- BMI direct calculation path: implemented
- Dashboard dense grid responsive breakpoints: implemented
- Known integrity artifacts: suppressed from ordinary health tables, preserved in audit data

Manual validation is still required against the connected Google Drive workspace because external account state is not available in the local test environment.


---

## Historical source: `TEST_REPORT_v0.16.1.md`

# ZEKE v0.16.1 Test Report

## Static checks
- `assets/app.js`: JavaScript syntax check passed.
- `assets/data-layer.js`: JavaScript syntax check passed.
- `assets/ai-router.js`: JavaScript syntax check passed.

## Workflow checks
- Questions-page Answer action now creates `pending.type = question` with the full question object.
- Free-text clarification does not call `resolveFactor(..., resolved)` unless `applyQuestionAnswer()` reports success.
- Unapplied answers preserve an open question and record the attempted answer.
- Separate duplicate choice commits the candidate event before resolving.
- Blood-pressure keep/reverse choices commit confirmed measurement events before resolving.

## Dashboard checks
- Render path is protected by an exception boundary.
- Cache-busting key updated to `20260716.2` for CSS and JavaScript assets.
- Build reports `v0.16.1 · 2026.07.16.2`.


---

## Historical source: `TEST_REPORT_v0.20.3.md`

# ZEKE v0.20.3 Test Report

**Build:** 2026.07.17.12  
**Test date:** 2026-07-18 UTC

## Automated regression results

| Test | Result | Verified behavior |
|---|---|---|
| `factor-idempotency.test.js` | Pass | Two concurrent writes with the same question key produce one open factor. |
| `medication-parser.test.js` | Pass — 6 assertions | Missed and not-yet states remain distinct; scheduleless ranges clarify; weekly Friday ranges expand correctly; aliases preserve canonical and original identities. |
| `medication-action-status.test.js` | Pass — 8 assertions | Only confirmed taken/administered/completed doses satisfy a medication Today action; missed, not-yet, pending, uncertain, and unconfirmed records do not. |
| `workbook-preflight.test.js` | Pass | Actual workbook maps 188 candidates and reconciles as 188 unchanged, with zero creates, updates, links, conflicts, or unsupported updates. |
| `workbook-real-data-idempotency.test.js` | Pass | Against the actual 258-event repository, a no-change commit retains 258 events and verifies all 188 source observations unchanged. |
| `workbook-commit-verify.test.js` | Pass | A new source observation receives an event backup, commits once, verifies from persisted storage, and is idempotent on the second run. |
| `workbook-source-replacement-backup.test.js` | Pass | A previously connected source receives an archival backup path before the approved replacement is written. |
| `release-structure.test.js` | Pass | Version/cache identity, startup continuity requirements, reviewed-sync call boundaries, persisted verification, source archival, medication completion allowlist, and regex control-character repair are present. |

## Real-data workbook result

Using the user-supplied `Project Zeke.zip` read-only fixture:

- Workbook candidates: **188**
- Existing events before test: **258**
- Existing events after no-change commit: **258**
- Unchanged: **188**
- Created: **0**
- Updated: **0**
- Linked existing: **0**
- Conflicts: **0**
- Unsupported updates: **0**
- Event backup for no-change commit: **none**, because no event write occurred
- Persisted post-commit verification: **188 unchanged**

The source fixture was not altered or bundled. Its original archive SHA-256 remained:

`e23f939dbfcaba8e76a0cf2146857639990d15389cffe1b37f9537e26db13e0d`

## Syntax and document integrity

- All JavaScript files accepted by `node --check`.
- All JSON files and `manifest.webmanifest` parsed successfully.
- `assets/app.js` contains no literal backspace or NUL control characters.
- Active index assets use the v0.20.3 cache token `20260717.12`.
- Active release identity is v0.20.3 / build 2026.07.17.12.

## Rendered verification

An isolated Chromium test-memory harness rendered the dashboard at:

- 1440×1000
- 1024×900
- 768×1024
- 390×844

At each width, the application shell rendered and document `scrollWidth` did not exceed `clientWidth`. The responsive card reflow, metric cards, Today’s Actions, Coach’s Eye, insights, top navigation, and mobile stacking were visually inspected.

The environment blocks local HTTP/file navigation by administrator policy. Rendering therefore used Chrome DevTools Protocol document injection with an opaque origin. Relative branding-image requests cannot resolve in that harness, so the broken image placeholders in test screenshots are a harness limitation and not evidence about deployed branding assets. Live Google, Calendar, AI, and deployed-origin navigation were not tested.

## Verification boundary

Live connected-service behavior still requires the user’s deployed installation and credentials. Unperformed checks are not implied passes. The release ZIP was reopened into a clean directory. All 223 files matched staging exactly, all 20 critical-file checksums passed, and the applicable regression suite passed again from the unzipped package. These results are also recorded in `DEVELOPMENT_MEMORY/RELEASE_GATE.md`.


---

## Historical source: `TEST_REPORT_v0.20.4.md`

# Test Report — ZEKE v0.20.4

Build: 2026.07.17.13

## Verified in the packaging environment
- Project consistency audit: 0 errors, 0 warnings.
- Medication parser: existing cases passed; class-only “GLP-1” requires clarification and creates no medication event.
- Medication Today action status: 8 tests passed.
- Concurrent/generated-factor idempotency: passed.
- Workbook transaction, backup, persisted verification, repeat sync, and source replacement backup tests: passed.
- Actual supplied repository regression: 188 candidates; 188 unchanged; 0 created, updated, linked, conflicted, skipped, or unsupported; event count remained 258.
- Release structure/version/cache-token checks: passed.
- Relative Markdown link audit: passed.

## Implemented but not verified here
- Credentialed live Google Drive and Calendar behavior.
- Connected AI-provider behavior.
- Deployed-origin navigation and branding behavior.

## Important interpretation
The workbook inventory also reports 324 unmapped cells/possible observations. This is not treated as evidence of 324 lost events; it remains a diagnostic requiring field-level review before expanding mappings.


---

## Historical source: `TEST_REPORT_v0.20.5.md`

# Test Report — ZEKE v0.20.5

**Build:** 2026.07.18.1

## Independently reproduced in this build environment
- All JavaScript syntax checks passed.
- All JSON files parsed.
- Medication parser: 6 tests passed.
- Medication Today-action: 8 tests passed.
- Generated-question idempotency passed.
- Workbook commit/verify and source-replacement backup tests passed.
- Supplied Project Zeke data regression: 188 candidates; 188 unchanged; zero creates, updates, links, conflicts, skips, or unsupported updates; 258 events before and after.
- Project governance audit: zero errors and warnings.
- Negative controls passed for stale version, scope mismatch, constitutional conflict, wrong package count, and broken link.

## Package cleanup
Legacy duplicate application bundles and obsolete partial-replacement instruction files were removed from the active package. Historical release and test records remain non-authoritative audit history.

## Explicit verification boundaries
Live Google Drive, Calendar, AI-provider, branding-asset, and deployed-origin browser behavior require the user's configured environment. No claim is made that those were verified here.


---

## Historical source: `TEST_REPORT_v0.21.0.md`

# Test Report — ZEKE v0.21.0

**Build:** 2026.07.18.2

Automated checks performed during packaging are recorded by the release builder. Manual deployment checks still required:
1. Confirm header and tab show v0.21.0 / 2026.07.18.2.
2. Open Fitness and test all Activity Library tabs.
3. Expand and collapse activity cards with mouse and keyboard.
4. Confirm Stair Climber appears under Cardio.
5. Expand Coach’s Eye and test evidence, Ask ZEKE, and Pattern Lab actions.
6. Open Health and test Frequent, Measurements, and Labs.
7. Export runtime diagnostics from Settings.
8. Verify mobile layout and sticky/accessible close actions.


---

## Historical source: `TEST_REPORT_v0.22.0.md`

# Test Report — ZEKE v0.22.0

**Build:** 2026.07.18.3

## Passed
- JavaScript syntax check for the active application bundle.
- Medication parser, medication action, factor idempotency, workbook commit/verify, release-structure, and navigation/coaching/profile structural regressions.
- Project governance audit: 0 errors, 0 warnings.
- Governance negative controls: stale version, scope mismatch, constitutional conflict, wrong file count, and broken link all detected.
- JSON parse checks for authoritative machine-readable state.
- Final ZIP reopened and byte-compared with staging.

## Not verified in this environment
- Credentialed Google Drive, Calendar, or live AI-provider behavior.
- Deployed-origin browser rendering.
- Continuous manual browser-width dragging and real-device mobile usability.
- Real-data workbook tests that require the external ZEKE_TEST_DATA_ROOT fixture.


---

## Historical source: `TEST_REPORT_v0.22.1.md`

# Test Report — ZEKE v0.22.1

**Build:** 2026.07.19.1

## Passed
- JavaScript syntax check for the active application bundle.
- Existing medication, factor-idempotency, workbook, release-structure, and navigation/coaching/profile structural regressions.
- Project governance audit with current identity, lifecycle, Project Health, and release-status consistency checks.
- Governance negative controls for stale version, scope mismatch, constitutional conflict, wrong file count, broken link, stale registry header, stale Project Health identity, contradictory release-gate status, and incorrect current-iteration lifecycle.
- JSON parse checks for authoritative machine-readable state.
- Current artifact registry and authority-set agreement.
- Final checksum generation and ZIP reopen/byte comparison.

## Not verified in this environment
- Credentialed Google Drive, Calendar, or live AI-provider behavior.
- Deployed-origin browser rendering.
- Continuous manual browser-width dragging and real-device mobile usability.
- Real-data workbook tests that require the external ZEKE_TEST_DATA_ROOT fixture.


---

## Historical source: `TEST_REPORT_v0.22.2.md`

# Test Report — ZEKE v0.22.2

**Build:** 2026.07.19.4

## Passed locally
- JavaScript syntax checks for active runtime modules.
- Existing regression suite, including activity-foundation structural tests.
- `python tools/project_audit.py`.
- `python tests/governance-negative-controls.py`.
- JSON parsing of all active machine-readable continuity files.
- Markdown relative-link validation through the project audit.
- Runtime-file registry presence checks.
- Full SHA-256 checksum regeneration after continuity reconciliation.
- Final ZIP reopen, extraction, checksum verification, and repeated project audit.

## Documentation reconciliation checks
- README and deployment identity match the current runtime build.
- Architecture and Feature Status describe v0.22.2 rather than obsolete snapshots.
- Backlog contains deferred activity identity/migration work and deployed verification.
- Decision and error logs contain the binding lessons from the independent reviews and incomplete first documentation pass.
- Artifact registry identifies the current iteration, release notes, test report, and continuity reconciliation record correctly.

## Not verified in this environment
- Live Google Drive, Calendar, and AI providers.
- Service-worker/cache upgrade on the deployed origin.
- Continuous arbitrary-width visual behavior.
- Physical-device mobile, touch, keyboard, and screen-reader behavior.
- Reproduction of the reported repeated-advice condition.

## Build 2026.07.19.4 focused acceptance checks

- Added `tests/dashboard-layout-acceptance.test.js`.
- Verified that Dashboard markup contains independent main-stream and health-rail wrappers.
- Verified that the health rail neutralizes legacy grid-row placement.
- Verified syntax and existing environment-independent regression tests.
- Deployed-origin visual confirmation remains required after replacing the GitHub Pages files and hard-refreshing.


---

## Historical source: `TEST_REPORT_v0.23.0.md`

# Test Report — ZEKE v0.23.0

**Build:** 2026.07.19.5

## Automated checks

- JavaScript syntax checks: passed for app.js, ai-router.js, and data-layer.js.
- Release-structure test: passed after version/cache reconciliation.
- Conversation/security/editing structural acceptance test: passed.
- Existing activity, dashboard, medication, factor, navigation, workbook commit/verify, and source-backup tests: passed.
- Real-workbook tests require ZEKE_TEST_DATA_ROOT and were not executed without that external fixture.

## Manual acceptance scenarios required after deployment

1. Click Review/Edit on Weight or Body Fat and verify the selected record opens in a modal without navigating to Dashboard.
2. Start a record correction, then enter a sleep observation; verify the stale correction is paused and sleep is interpreted independently.
3. Ask ZEKE a question that expects a yes/no answer, reply “sure,” and verify it continues the conversation without offering to save the reply.
4. Verify transcript date separators and times.
5. Test wide desktop, tablet, and mobile layouts for large unexplained gaps.
6. Connect an AI provider and verify malformed or action-seeking structured output is rejected.


---

## Historical source: `TEST_REPORT_v0.23.1.md`

# Test Report — ZEKE v0.23.1

**Build:** 2026.07.20.1

## Passed package checks

- JavaScript syntax checks passed for `assets/app.js`, `assets/parser.js`, `assets/data-layer.js`, `assets/ai-router.js`, `version.js`, and `sw.js`.
- Twelve executable Node regression tests passed, including sleep parsing, idempotent confirmation, undo, dashboard composition, navigation hierarchy, shared Fitness recommendations, medication safeguards, workbook commit verification, and source-replacement backup.
- Isolated Chromium rendering completed without page errors for Dashboard, Fitness, Health, Questions, Insights, and a 420-pixel mobile Dashboard viewport.
- Rendered interaction checks confirmed the Sleep + Log fields, sleep-specific edit fields, workout optional fields during initial entry, and a concrete sleep review showing source, proposal, question, and actions.
- Governance negative controls passed for stale identity, scope mismatch, constitutional conflict, wrong file count, broken links, stale registry identity, stale Project Health identity, contradictory gate language, and iteration lifecycle mismatch.
- Project governance audit passed after continuity reconciliation and final package count synchronization.

## Not executed in this environment

- `tests/workbook-preflight.test.js` and `tests/workbook-real-data-idempotency.test.js` require the protected external `ZEKE_TEST_DATA_ROOT` fixture. They were not executed and are not represented as passed.
- Live Google Drive, Google Calendar, configured AI providers, GitHub Pages cache/service-worker behavior, physical-device mobile behavior, and assistive-technology accessibility remain environment verification outstanding.

## Packaging checks

- The final ZIP is reopened into a fresh directory.
- File inventory and SHA-256 checksums are compared with staging.
- Syntax, structural regressions, governance audit, and release identity checks are repeated against the reopened package.


---

## Historical source: `TEST_REPORT_v0.24.0.md`

# ZEKE v0.24.0 Test Report

**Build:** 2026.07.21.1  
**Release:** Trust, Conversation & Workflow  
**Test date:** 2026-07-21

## Verified locally

### Active-runtime syntax

`node --check` passed for:

- `assets/app.js`;
- `assets/workflow-engine.js`;
- `assets/data-layer.js`;
- `assets/parser.js`;
- `assets/ai-router.js`;
- `version.js`;
- `sw.js`.

### Deterministic JavaScript regressions

The non-fixture JavaScript suite passed:

- activity foundation;
- conversation security and editing;
- dashboard layout acceptance;
- clarification-factor idempotency and later update/resolution;
- medication action status;
- medication parser;
- navigation, coaching, and profile hierarchy;
- release structure and cache identity;
- sleep and insight stabilization;
- sleep transaction save/repeat/undo;
- Trust, workflow, and Conversation Memory structure;
- workbook commit/verify and repeated-sync idempotency;
- workbook source replacement backup;
- workflow-engine state, logs, privacy filtering, metrics, and clearing.

### Rendered Chromium workflow smoke

An isolated Chromium render passed with no page errors on:

- Dashboard;
- Fitness;
- Health;
- Conversation Memory;
- Insights;
- mobile-width Dashboard.

The rendered run directly exercised:

- workout create fields for effort, pain, technique, and injury context;
- sleep create and edit fields;
- narrative review source, proposed data, and all decision actions;
- Later preserving the review in Waiting for You;
- editing a non-medication recurring action through the focused schedule editor;
- restoration of an open workflow and its visible Resume path with contextual choices;
- an automated visible-control contract audit on Dashboard, Fitness, Health, Conversation Memory, Insights, and the mobile-width Dashboard. The audit found no visible enabled control without a bound action and no icon-only control without an accessible name.

### Support & Improvement Report download

An isolated Chromium download test created and reopened the workbook. It verified these tabs:

1. Executive Summary
2. Technical Errors
3. Unresolved Interactions
4. AI Consultation History
5. User Corrections
6. UX Feedback
7. Potential Health Events
8. Audit History
9. Conversation Metrics
10. Workflow History
11. Developer Notes

The test selected Anonymized mode, applied a date range, enabled clear-after-export, and verified those choices survived intervening UI renders. It reopened the workbook, confirmed the selected privacy mode, verified retained runtime and unresolved-interaction logs were cleared only after a successful download, and scanned workbook XML for credential-like test values; none were found.

### Governance and package controls

- project audit passed;
- all governance negative controls passed;
- all JSON documents parsed successfully;
- active runtime files matched the artifact registry;
- final staged file count matched the development gate;
- release checksums were regenerated;
- the final ZIP was reopened and compared with the staged directory.

## Not run: external fixture tests

These tests require `ZEKE_TEST_DATA_ROOT` and were not run because the protected external fixture was not supplied:

- `tests/workbook-preflight.test.js`;
- `tests/workbook-real-data-idempotency.test.js`.

This is an explicit external-fixture boundary, not a passing result.

## Environment verification outstanding

Local package testing does not establish:

- live Google Drive persistence or cross-device restoration;
- live Google Calendar access and follow-up writes;
- Gemini, Groq, or other real provider routing/failover;
- deployed service-worker replacement and hard-refresh behavior;
- report download behavior across every supported browser/device;
- protected real-workbook behavior without the external fixture;
- physical-device accessibility, screen-reader, and touch acceptance.

These remain environment verification tasks after deployment.


---

## Historical source: `TEST_REPORT_v0.25.0.md`

# ZEKE v0.25.0 Test Report
**Build:** 2026.07.21.2

## Verified locally
- Active JavaScript parses successfully with `node --check assets/app.js`.
- Project governance audit passes.
- Existing JavaScript regression tests pass.
- Activity-specific history column definitions are present for each supported activity category.
- Provider View route, navigation item, focus controls, and print action are wired.
- Repeat-last-workout control calls the preloading workout editor.
- Progressive profile fields save without replacing existing profile values.
- Version labels are synchronized in active runtime files.

## Environment verification still required
- Physical iPhone/Android gym entry usability and one-handed touch testing.
- Browser print/PDF layout with real records.
- Live Google Drive persistence and protected workbook regression.
- Live AI provider routing and failure logging.
- Multi-account beta isolation and centrally managed AI proxy (not implemented in this static release).


---

## Historical source: `TEST_REPORT_v0.25.1.md`

# Test Report — ZEKE v0.25.1

Build: 2026.07.21.3

## Automated checks
- JavaScript syntax checks
- Deterministic JavaScript regression suite
- Governance negative controls
- Project audit
- Final package reopen and comparison

## Manual/environment checks still required
- Deployed desktop and mobile screenshots
- Service-worker cache replacement on GitHub Pages
- Live Google Drive and AI provider behavior
- Real user data rendering and privacy review


---

## Historical source: `TEST_REPORT_v0.25.2.md`

# Test Report — ZEKE v0.25.2

Static verification completed:
- JavaScript syntax check passed for `assets/app.js`.
- Workout save button is explicitly `type="button"` with a direct click handler.
- Form submit remains supported as a fallback.
- Saving-state reset and visible error handling are present.
- `crypto.randomUUID()` has a compatibility fallback.
- Duplicate-scan errors no longer silently abort the entire save flow.

Still requires physical-device verification on the user's mobile browser and live connected storage.


---

## Historical source: `TEST_REPORT_v0.26.0.md`

# Test Report — ZEKE v0.26.0

**Build:** 2026.07.22.1  
**Package status:** Verification complete  
**Environment status:** Verification outstanding

## Verification summary

The staging directory and a freshly reopened ZIP were tested independently. The final ZIP was then reopened again, re-tested, checksum-verified, and byte-compared with staging.

### Syntax

- `node --check assets/app.js` — passed
- `node --check assets/parser.js` — passed

### Package-local JavaScript regressions

Fifteen regression files passed:

- activity foundation
- conversation security and editing
- Dashboard layout acceptance
- factor idempotency
- medication action status
- medication parser
- navigation/coaching/profile architecture
- release structure
- sleep and insight stabilization
- sleep data transaction
- trust workflow UX
- v0.26 regression contract (37 checks)
- workbook commit/verify
- workbook source replacement/backup
- workflow engine

The executable package-local total is fifteen after excluding the two protected real-data tests.

### Rendered Chromium workflow smoke

Passed on:

- Dashboard
- Fitness
- Health
- Questions for You
- Discover/Insights
- mobile-width Dashboard

Rendered interactions verified:

- open workflow resume
- explicit medication Taken/Missed/Not-yet choices and taken completion
- global sleep search
- Favorites default and activity detail opening
- goal structural review and provider-backed save
- workout RPE, pain, technique, and injury-context controls
- sleep selectors and sleep-specific editing
- monthly medication review
- reviewed medication backfill with existing-dose skip
- concrete review question content and Later preservation
- recurring medication schedule editor and save label
- visible controls had accessible names and bound interactions in the tested routes

### Other package checks

- Support & Improvement Report browser smoke — passed; anonymized workbook generated with 11 expected tabs and diagnostic-log clear behavior.
- Project audit — passed with 0 errors and 0 warnings.
- Governance negative controls — all passed, including stale identity, scope mismatch, constitutional conflict, wrong count, broken link, stale registry, contradictory gate, and lifecycle contradiction cases.
- SHA-256 manifest — verified for every package file except the manifest itself.
- ZIP extraction — one expected top-level release directory.
- Staging/reopened byte comparison — identical.

## Protected tests intentionally not run

- `tests/workbook-preflight.test.js`
- `tests/workbook-real-data-idempotency.test.js`

Both require an explicitly supplied protected fixture through `ZEKE_TEST_DATA_ROOT`. Their absence is not treated as a pass.

## Environment verification still required

Package-local evidence does not establish:

- live Google Drive persistence or cross-device refresh
- live Calendar integration
- live AI-provider routing, safety, quotas, or failover
- deployed service-worker cache replacement
- protected real-workbook behavior
- physical-device mobile save, sleep selectors, keyboard/zoom, or accessibility
- multi-account isolation or protected shared-AI infrastructure

## Release conclusion

The package is internally coherent and suitable for the owner’s next alpha deployment/test cycle, subject to the environment-verification boundary above.


---

## Historical source: `TEST_REPORT_v0.26.1.md`

# Test Report — ZEKE v0.26.1

**Build:** 2026.07.22.2  
**Release:** Fitness Navigation & Evidence Hotfix

## Package verification completed

The staged package was tested after implementation and metadata reconciliation.

### Static and deterministic checks

- `node --check assets/app.js` — passed.
- 16 package-local JavaScript regression files — passed.
- Protected real-workbook tests were not run because their external fixture was not supplied; this remains an environment check.

### Rendered Chromium workflow smoke

Passed on Dashboard, Fitness, Health, Questions for You, Discover, mobile Dashboard, and mobile Fitness.

The rendered test verified:

- Activity Library opens with Favorites selected.
- Approved selector order is Favorites, Recent, Strength, Cardio, Mobility/PT, Sports, Custom, All.
- The old Activity Library chip row is absent.
- Selector controls and the Activity Library panel do not overflow at 1440 px or 390 px viewport widths.
- Search filters to Seated Row.
- Activity details expand.
- Review relationships opens a Seated Row-specific modal and gives a specific insufficient-data explanation rather than a generic destination.
- Coach evidence opens direct PubMed sources and explains the personal trigger.
- A Dashboard trend remains open after a range change forces a full application rerender.
- Existing workflow, medication, sleep, goal, question, search, and mobile logging interactions remain functional.
- No page errors, unnamed visible controls, or visibly unbound controls were detected in the tested routes.

### Governance and package integrity

- Governance negative controls — passed.
- Project audit — passed with 0 errors and 0 warnings.
- SHA-256 manifest — regenerated and verified after final files were written.
- Final ZIP — reopened and compared against staging during packaging.

## Research sources wired into the application

- 2026 ACSM resistance-training overview, PMID 41843416.
- 2009 ACSM progression models position stand, PMID 19204579.
- 2022 acute sleep-loss and physical-performance meta-analysis, PMID 35708888.

ZEKE displays these as group-level research context, separately from the user’s records and from product-level conservative rules.

## Environment verification outstanding

This package does not establish live Google Drive, Google Calendar, AI-provider, deployed cache/service-worker, protected real-workbook, accessibility-device, or physical-device behavior.


---

## Historical source: `TEST_REPORT_v0.27.0.md`

# Test Report — ZEKE v0.27.0

**Build:** 2026.07.22.3  
**Release:** Gym Entry Mockup Fidelity

## Passed in package

- JavaScript syntax check for `assets/app.js`.
- JSON parsing for active development JSON documents.
- Required Gym Mode DOM hooks and responsive CSS selectors present.
- Version/build synchronized in active runtime files.
- Final ZIP reopened successfully.
- Unchanged entries compared against the supplied v0.26.1 ZIP for byte identity and ZIP modification timestamp identity.
- No horizontal Gym Mode page-scroll rule is present; vertical main-workspace scrolling is enabled.

## Not claimed

- Physical iPhone, Android, or narrow-browser interaction.
- Pixel-level comparison against the approved mockup on a device.
- Live Google Drive, Calendar, AI provider, protected workbook, or deployed service-worker behavior.

## Release boundary

Package-local verification does not replace environment verification.


---

## Historical source: `TEST_REPORT_v0.27.2.md`

# Test Report — ZEKE v0.27.2

**Build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1

## Original runtime package evidence

- JavaScript syntax.
- Final ZIP integrity.
- Unchanged entries retain original ZIP bytes and timestamps.
- Modified/new entries use the actual build time in America/New_York.
- Selected-exercise DOM replaces the workout-summary DOM rather than appending beneath it.
- Header, Coach’s Eye, progression, Last Time, Today’s Entry, Save Exercise, and Form Guide bottom-sheet structures are present.
- Gym Entry CSS prohibits horizontal overflow and permits vertical scrolling.

## Governance reconciliation evidence

- No runtime files changed.
- Authoritative JSON documents parse.
- The final governance ZIP reopens successfully.
- Unchanged file bytes and timestamps match the source ZIP.
- Changed/new governance entries use the actual local package-generation time.
- One clearly named extraction folder is present and Mac metadata artifacts are absent.

## Not represented as verified

- The reported Gym Mode defects are not fixed by this documentation-only revision.
- Physical-device testing.
- Live provider synchronization.
- AI-vault implementation.
- Pixel-perfect identity across every browser.


---

## Historical source: `TEST_REPORT_v0.27.3.md`

# ZEKE v0.27.3 Test Report

- Package audit generated against untouched `Zeke-026-1.zip`.
- Unchanged ZIP entries retain original hashes and timestamps.
- Structural JavaScript tests executed.
- Physical iOS Safari/Chrome/Firefox testing remains required.


---

## Historical source: `TEST_REPORT_v0.28.0.md`

# ZEKE v0.28.0 Test Report

Build: 2026.07.23.0005

## Automated checks

- JavaScript syntax: passed with Node 0--check.
- Required release files present: passed.
- Base directory structure preserved: passed.
- Unchanged-file timestamps compared with v0.27.2: verified during packaging.
- Blank numeric fields serialize as null in the Gym Entry save path: code inspection passed.
- Exercise save uses ZekeData.addEvent: code inspection passed.
- User program save uses ZekeData.savePreferences: code inspection passed.
- Workout-session summary is created only by Finish Workout: code inspection passed.

## Environment checks still required

- Live Google Drive save and reload.
- Mobile Safari and Chrome interaction.
- Service-worker update after deployment.
- Screen-reader and keyboard review.


---

## Historical source: `TEST_REPORT_v0.28.1.md`

# ZEKE v0.28.1 Test Report

Build: 2026.07.23.0418

## Package checks completed

- `node --check` passed for `assets/app.js`, `assets/exercise-guides.js`, `version.js`, and `sw.js`.
- The guide-library contract passed for all 17 reviewed guides, including required Setup, Movement, Common Mistakes, Tips, photo source, creator, and license fields.
- The full JavaScript regression suite passed: 19 test files, 19 passed, 0 failed.
- The two real-workbook tests reported a truthful environment skip because `ZEKE_TEST_DATA_ROOT` was not supplied; they did not claim real-data verification.
- `python tools/project_audit.py --root .` passed with 0 errors and 0 warnings.
- All governance negative controls passed.
- Script ordering confirms `assets/exercise-guides.js` loads before `assets/app.js`.
- The final package was compared directly with the v0.28.0 ZIP for byte identity and archived modification timestamps.
- The final ZIP was reopened and passed integrity testing.

## Rendered/environment boundary

The legacy rendered-workflow smoke script exceeded the available execution window and did not produce a result. This release therefore does not claim rendered-browser, live-network image, deployed service-worker, connected Drive/Sheets, protected-workbook, physical-device, or accessibility-device verification. Those remain environment checks.

## Media boundary

Photos are loaded from Wikimedia Commons at runtime. The package verifies that every reviewed photo has explicit source, creator, and license metadata and that image-load failure produces a visible fallback. It does not claim that the remote image files are embedded in the ZIP or available offline.


---

## Historical source: `TEST_REPORT_v0.29.0.md`

# Test Report — ZEKE v0.29.0

**Build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2  
**Continuity reconciliation:** Runtime files unchanged from the original v0.29.0 package.

## Continuity and package checks

- `python tools/project_audit.py`: **passed with 0 errors and 0 warnings** after reconciliation.
- `python tests/governance-negative-controls.py`: **9 of 9 negative controls passed**.
- Current JSON authority files parsed successfully.
- Current Markdown relative links passed the project audit.
- Current version/build agree across Project State, Development Gate, Governance Rules, Artifact Registry, README, Version, Release Gate, current iteration, release notes, and this report.
- The final package is required to reopen successfully and match the generated provenance manifest before delivery.

## Active JavaScript syntax

`node --check` passed for:

- `version.js`
- `assets/app.js`
- `assets/data-layer.js`
- `assets/parser.js`
- `assets/ai-router.js`
- `assets/workflow-engine.js`
- `tests/gym-mode-v029.test.js`
- `tests/release-structure.test.js`

## Package-local JavaScript regression run

**Passed: 15**

- `activity-foundation.test.js`
- `conversation-security-and-editing.test.js`
- `dashboard-layout-acceptance.test.js`
- `factor-idempotency.test.js`
- `gym-mode-v029.test.js`
- `medication-action-status.test.js`
- `medication-parser.test.js`
- `navigation-coaching-profile.test.js`
- `release-structure.test.js`
- `sleep-data-transaction.test.js`
- `trust-workflow-ux.test.js`
- `v026-regression-contract.test.js`
- `workbook-commit-verify.test.js`
- `workbook-source-replacement-backup.test.js`
- `workflow-engine.test.js`

**Failed: 2 — not concealed or reclassified as passed**

1. `sleep-and-insight-stabilization.test.js` — reports `workout-rpe missing from workout entry/edit schema`. The current Gym Mode contains optional RPE/pain/rest/notes controls under new identifiers, but this older contract also covers the broader create/edit schema. It requires a targeted regression review; this documentation-only reconciliation does not change code or weaken the test.
2. `v0261-regression-contract.test.js` — requires v0.26.1 metadata inside the current `version.js`. That metadata assertion is obsolete for v0.29.0, although the remainder of the historical behavioral contract may still be valuable. The test should be reconciled in a separately approved test-maintenance scope rather than falsifying current version metadata.

**Blocked by unavailable external fixture: 2**

- `workbook-preflight.test.js`
- `workbook-real-data-idempotency.test.js`

Both require `ZEKE_TEST_DATA_ROOT` pointing to the protected extracted Project Zeke repository.

## Runtime evidence represented by package-local tests

The Gym Mode contract test checks for the visible editable date, qualitative gauge, recommended-progression control, previous-entry prefill disclosure, collapsed optional details, cardio intensity range, Gym-contained history route, routine suggestion state, truthful save-in-progress wording, absence of the prior false Gym Mode Synced phrase, and truthful no-image fallback.

These are structural/source assertions. They do not prove pixel fidelity, touch behavior, actual storage-provider acknowledgement, remote image correctness, or physical-device behavior.

## Environment verification outstanding

- iPhone 8 and newer physical-device acceptance.
- Representative Android aspect ratios and devices.
- Common laptop/desktop widths and zoom levels.
- Deployed Google/storage authorization and write persistence.
- Non-Google provider adapters, which are not implemented.
- Secure cross-device AI credential vault, which is not implemented.
- Live Form Guide image delivery and movement-level review.
- Real multi-image Form Guide sequence, which is not implemented.
- Protected real-workbook tests requiring the external fixture.
- Accessibility and service-worker/cache behavior on the deployed origin.

## Verification wording

The continuity package may be described as **continuity reconciled** and **package integrity verified** after final archive comparison. The runtime must not be described as fully device-verified, provider-agnostic, research-validated, or fully complete.


---

## Historical source: `TEST_REPORT_v0.30.0.md`

# ZEKE v0.30.0 Test Report

## Passed

- JavaScript syntax: `assets/app.js`, `assets/data-layer.js`, `assets/parser.js`, `assets/ai-router.js`, `assets/workflow-engine.js`, `sw.js`, and `version.js`.
- v0.30 mobile workout-entry contract test.
- Existing Gym v0.29 contract test.
- Existing navigation, dashboard, medication, parser, workflow, and activity-foundation tests that do not depend on unavailable external fixtures.
- ZIP integrity and one-root-folder checks.

## Known legacy test failures

- `sleep-and-insight-stabilization.test.js` still expects legacy workout field identifiers.
- `v026-regression-contract.test.js` rejects wording that remains in a historical/custom-activity creation path.
- `v0261-regression-contract.test.js` incorrectly requires v0.26.1 metadata in the current release.
- Workbook tests requiring `ZEKE_TEST_DATA_ROOT` were not run because the protected fixture was unavailable.

## Environment limits

The local browser runner was blocked by the execution environment’s navigation policy. Physical phone testing and deployed remote-image testing remain required before calling the rendered experience fully verified.


---

## Historical source: `TEST_REPORT_v0.31.0.md`

# ZEKE v0.31.0 Test Report

Static verification performed: JavaScript syntax, package structure, version coherence, reviewed guide library load, mobile workout contract strings, Save Sleep feedback, and reconnect dialog presence.

Rendered physical-device verification remains required on iPhone 8 and newer plus representative Android sizes. Remote Wikimedia delivery remains an environment-dependent check.


---

## Historical source: `TEST_REPORT_v0.40.0.md`

# ZEKE v0.40.0 Test Report

**Build:** 2026.08.03.1  
**Package verification:** Passed  
**Environment verification:** Outstanding

## Passed current JavaScript regressions

- activity foundation
- conversation security and editing
- dashboard layout acceptance
- factor idempotency
- integrity live-fixture repair transaction, backup, and undo
- form-guide library
- medication action/status and parser
- navigation/coaching/profile
- release structure
- sleep and insight stabilization
- sleep transaction and undo
- trust/workflow UX
- v0.40 major milestone
- workbook commit/verify, preflight, real-data idempotency, source replacement/backup
- workflow engine

## Rendered Chromium smoke

Passed on desktop routes and a 390×844 mobile viewport:

- no page errors
- no horizontal page overflow
- dashboard v3 with three story cards, weekly plan, and review status
- mobile center action labeled Log
- 103 visible fitness cards when All is selected (102 knowledge objects plus the user/custom path represented by the UI)
- guide opens and includes targeting/mind-muscle content
- representative Repair Center shows exact duplicate, import legend, implausible sleep, paddling fields, and answered-question candidates

## Live-data fixture evidence

The supplied read-only live fixture produced 18 candidates: 3 exact-duplicate groups, 1 import artifact, 7 zero-as-missing heart-rate candidates, 1 paddling-field candidate, 1 implausible sleep candidate, 1 answered medication question, and 4 stale/duplicate discoveries. Source files were not modified during testing. The live-fixture transaction test applied all 18 proposed repairs in an isolated in-memory provider, verified the expected supersession/quarantine/field cleanup/question/discovery results, and restored the original event/factor/discovery state through Undo.

## Governance and package checks

- `python tools/project_audit.py`: passed after current authority reconciliation.
- `python tests/governance-negative-controls.py`: passed all negative controls.
- JavaScript syntax checks: passed.
- Final ZIP: reopened and compared against file-level manifest/provenance.

## Not established by this report

- Live Google Drive authentication and write acknowledgements.
- Physical iPhone/Android usability.
- Remote-media uptime.
- Medical or clinical effectiveness.


---

## Historical source: `TEST_REPORT_v0.40.4.md`

# ZEKE v0.40.4 Test Report

**Build:** 2026.08.06.4

## Sprint 4 package-local checks passed

- Active JavaScript syntax validation
- Sprint 2 adaptive-activity regression
- Sprint 3 workout-intelligence regression
- Activity-foundation structural regression
- Release-structure identity/runtime-order regression
- Governance negative controls
- Project governance/package audit: 0 errors, 0 warnings

## Broader JavaScript suite

- 16 tests passed.
- 5 returned non-zero results.
- Three require the unavailable external `ZEKE_TEST_DATA_ROOT` protected fixture.
- `sleep-and-insight-stabilization.test.js` still expects legacy workout field class names and requires Sprint 5 review against the adaptive-schema implementation.
- `v040-major-milestone.test.js` still contains additional v0.40.0-era string expectations beyond the identity assertions already modernized; Sprint 5 must reconcile the test with current behavior without weakening its safeguards.

## Not established

- Physical-device behavior
- Live Google Drive authentication/write/readback
- Remote-media availability
- Protected real-workbook behavior without its external fixture

**Sprint 4 package verification complete; broader release-candidate and environment verification outstanding.**


---

## Historical source: `TEST_REPORT_v0.40.5.md`

# Test Report — ZEKE v0.40.5 RC1

**Build:** 2026.08.06.5
**Date:** 2026-08-06

## Passed

- `node --check assets/app.js`
- 18 package-local JavaScript test suites
- `python3 tests/governance-negative-controls.py`
- `python3 tools/project_audit.py --root .`
- `python3 tests/rendered-workflow-smoke.py`
- `python3 tests/v040-rendered-smoke.py`
- `python3 tests/support-report-browser-smoke.py`

## Not run as package-local passes

The following require a protected/external real-data fixture through `ZEKE_TEST_DATA_ROOT`:

- `integrity-live-repair-transaction.test.js`
- `workbook-preflight.test.js`
- `workbook-real-data-idempotency.test.js`

These are classified as fixture-dependent, not regressions.

## Findings fixed during Sprint 5

- Obsolete structural expectations for legacy workout classes and the old mobile “Log” label.
- Missing accessible names on activity-entry close controls.
- Unbounded rendered-test waits and stale workout-entry interaction path.

## Environment boundary

Package-local testing cannot establish live Google Drive durability or physical-device behavior.


---

## Historical source: `TEST_REPORT_v0.41.0.md`

# ZEKE v0.41.0 RC1 Test Report

**Build:** 2026.08.07.1  
**Verification boundary:** package-local unless explicitly stated otherwise

## Passed checks

### Runtime / targeted regression

- `node --check assets/app.js` — passed.
- `node --check assets/knowledge-base.js` — passed.
- `tests/v041-fitness-intelligence.test.js` — passed, 17 checks.
- `tests/form-guide-library.test.js` — passed.
- `tests/release-structure.test.js` — passed; v0.41.0 / 2026.08.07.1 identity confirmed.

### Rendered browser

`tests/rendered-workflow-smoke.py` — passed in isolated Chromium.

Covered desktop Dashboard, Fitness, Health, Questions, Discover and mobile Dashboard/Fitness. The smoke found no page errors, missing accessible names, or unbound visible controls on the tested routes. The tested mobile Fitness activity library defaulted to Favorites and did not horizontally overflow. Existing medication confirmation, workflow resume, search, dashboard disclosure persistence, specific relationship review, Coach evidence, goal save, rehab-field activity creation, sleep log/edit, medication review/backfill, review deferral, and recurring-schedule editor flows remained functional.

### Support/privacy workflow

`tests/support-report-browser-smoke.py` — passed. The generated support workbook remained anonymized and cleared logs as expected.

### Governance

`tests/governance-negative-controls.py` — passed all negative controls.

## Broader JavaScript regression suite

**16 passed; 6 returned non-zero.**

### Non-zero: protected fixture unavailable

These tests require `ZEKE_TEST_DATA_ROOT`, which is not available in the package-local test environment:

- `tests/integrity-live-repair-transaction.test.js`
- `tests/workbook-preflight.test.js`
- `tests/workbook-real-data-idempotency.test.js`

They are not represented as passing or failing runtime behavior; they are environment/fixture-blocked.

### Non-zero: obsolete historical expectations

- `tests/sprint2-adaptive-activity.test.js` hardcodes the v0.40.x version pattern and v2 exact rehab-field/schema strings. v0.41 intentionally advances the activity schema/field set; current rehab behavior is covered by the v0.41 structural and rendered tests.
- `tests/trust-workflow-ux.test.js` requires the old technical review headings such as “Original information” and “Proposed record or action.” The approved v0.41 duplicate-review redesign intentionally removes that implementation-facing language; current review interactions are covered by rendered/structural checks.
- `tests/v040-major-milestone.test.js` is a historical v0.40 milestone assertion and hardcodes the prior current-version identity. It is retained as historical evidence rather than rewritten to manufacture a current pass.

## Feature-specific v0.41 checks

The new v0.41 regression verifies presence/structure for:

- exact exercise identity and review-based historical mapping;
- exact-variation progressive-overload/evidence behavior;
- section-owned Dashboard ranges and removal of the detached topbar range selector;
- Discover screening and recent-oriented trend logic;
- plain-language duplicate review;
- schedule-assumed medication adherence provenance;
- expanded PT entries and removal of uncertain `K` shorthand assertions;
- v0.41 styling hooks.

## Not established by package-local testing

- Live Google Drive authentication and durable provider-backed write/readback.
- Physical iPhone/Android behavior.
- Remote form-guide media network availability in the deployed environment.
- Protected real-workbook fixture behavior without `ZEKE_TEST_DATA_ROOT`.
- User acceptance of recommendations against the user's real workout history.

**Package verification complete; environment verification outstanding.**


---

## Historical source: `TEST_REPORT_v0.42.0.md`

# ZEKE v0.42.0 RC1 — Package Test Report

**Run:** 2026-08-11  
**Scope:** extracted package, local static/runtime tests only.

## Passed
- JavaScript syntax: `assets/app.js`, `parser.js`, `longitudinal-schema.js`, `ingestion-engine.js`, `calendar-privacy.js`.
- New v0.42 longitudinal/ingestion regression test: retrospective 12-day protein assertion, two-month medication-adherence reconciliation flag, allergy immunotherapy, blood donation, DEXA classification, source-specific reference range, calendar privacy defaults, timeline normalization.
- Existing package tests passed: activity foundation; conversation security/editing; dashboard layout acceptance; factor idempotency; form guide library; medication action status; medication parser; navigation/coaching/profile; sleep/insight stabilization; sleep transaction; Sprint 3 workout intelligence; workbook commit/verify; workbook source replacement backup; workflow engine.
- `rendered-workflow-smoke.py` passed, including medication backfill and review workflows.

## Not counted as regressions
Several inherited tests encode an exact historical version string (v0.40.x/v0.41.0) and fail after a truthful version bump; they are historical release assertions rather than forward-compatible behavior tests. `trust-workflow-ux.test.js` also contains an inherited exact-copy expectation not introduced by v0.42.0.

## Environment-gated / not run as acceptance
- Live integrity/workbook tests requiring `ZEKE_TEST_DATA_ROOT` were not supplied a live extracted user repository.
- The older `v040-rendered-smoke.py` exceeded the local execution time budget and is superseded by the passing current rendered workflow smoke for this package.
- No claim is made for live Google Drive/Calendar write-readback, remote AI/vision/OCR, remote media, or physical-device rendering.

## Release assessment
Package-local v0.42.0 additions pass their dedicated regression checks and the current rendered workflow smoke. Release remains RC1 pending deployment and connected-provider/user acceptance.
