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
