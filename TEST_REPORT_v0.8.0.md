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
