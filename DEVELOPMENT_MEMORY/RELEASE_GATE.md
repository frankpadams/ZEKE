# Release Gate — ZEKE v0.43.0 RC2.1

**Runtime build:** 2026.08.16.3  
**Governance revision:** 2026.08.16.3

## Status

**RC2 implementation is substantially complete; promotion remains blocked by PT visual completeness, physical-device acceptance, and live connected-data verification.**

## Approved release-gate scope

- Preserve approved mobile design authority for `+ Log Exercise`; no separate Gym Mode.
- Maintain canonical exercise families with variation-specific histories and shared-axis multi-series charts.
- Keep inline per-set load/reps and optional effort/pain with Coach rationale and integrated form guide.
- Maintain dated medication dose occurrence history with assumed/confirmed provenance, retroactive correction, and historical reconstruction.
- Fix conversational workflow interruption, deterministic last-dose reasoning, save-state integrity, and meta-conversation exclusion from health data.
- Add mobile past-year calendar candidate screening with Relevant / Not relevant / Unsure, then dedupe and explicit confirmation before health-record backfill.
- Generate Health Reports/Export from canonical longitudinal data and demote the legacy connected workbook to migration/reconciliation.
- Sync AI provider credentials through the connected user-owned workspace across devices; migrate and clear legacy local-only keys.
- Keep mobile/intermediate side navigation vertical and overflow-safe.
- Keep the package self-describing for a new team through current architecture, design authority, release scope, tests, known issues, and history.

## Environment verification

**Environment verification outstanding.** Live connected Drive behavior and physical-device acceptance are not established by package-local testing.

## Verification required before promotion

1. Project audit and governance negative controls pass.
2. Applicable JavaScript regression suite passes; unavailable protected fixtures are explicitly classified.
3. Rendered mobile navigation/exercise-entry workflows pass without horizontal overflow.
4. Longitudinal medication/calendar/report/credential RC2 regression passes.
5. Final ZIP readback/hash verification passes.
6. Six missing PT visual guides are completed with exact verified media.
7. Physical-phone visual acceptance against `DESIGN_AUTHORITY.md` is complete.
8. Live Google Drive read/write and cross-device credential behavior are verified in the user environment.
9. Self-describing package continuity reconciliation passes: current release notes exist, active docs agree on architecture, and historical superseded language cannot be mistaken for current authority.

## Security boundary

Connected AI keys are stored in the user-owned connected workspace and excluded from reports/logs. This alpha relies on Drive account/OAuth confidentiality; it does not yet provide a separate ZEKE-managed end-to-end encryption layer.

## Rollback

Retain the prior complete package as rollback unit. Longitudinal corrections preserve source/provenance rather than destructively rewriting unrelated history.


## RC2.1 package-local verification

- Project audit: 0 errors / 0 warnings.
- JavaScript regression suite: 26 passed / 0 failed (external fixture-dependent checks skip explicitly when fixture is unavailable).
- Phone rendered smoke: passed vertical navigation, no horizontal overflow, variation selector/create path, three inline set rows, optional effort/pain, Coach/Why, and Form Guide.
- Continuity/self-description regression: passed.

These package-local passes do not clear the physical-phone, live-connected-provider, legacy-data reconciliation, or six-PT-visual promotion gates.
