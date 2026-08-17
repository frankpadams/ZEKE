# ZEKE Known Issues — v0.43.0 RC2.1

**Build:** 2026.08.16.3

## Release blockers

1. **PT visual coverage is incomplete.** The last RC1 audit identified verified two-frame/appropriate visual coverage for 8 of 14 rehab/PT entries. Remaining known visual gaps: Band Internal Rotation, Doorway Chest Stretch, D1, D2, No Monies, and Cheerleaders. Do not substitute mechanically different images merely to make the count pass.
2. **Physical-phone visual acceptance is outstanding.** Browser viewport tests are not equivalent to real-device comparison against `DESIGN_AUTHORITY.md`.

## Environment verification outstanding

- Live Drive read/write/reconnect across multiple devices.
- Cross-device AI credential sync and provider test on a second device.
- Real-calendar 365-day retrospective scan volume/performance and user acceptance.
- External form-guide media availability in deployed environment.

## Security limitation

AI API keys are synced through the user-owned connected ZEKE workspace to satisfy cross-device persistence. In RC2 they rely on Drive account/OAuth confidentiality rather than a separate end-to-end encrypted credential vault. Keys are excluded from reports, diagnostics, and public package files. A hardened encrypted vault is a future security enhancement.

## Historical issues resolved or structurally addressed in RC2

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
