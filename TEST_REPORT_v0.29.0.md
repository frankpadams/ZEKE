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
