# ZEKE v0.22.1

**Build:** 2026.07.19.1  
**Release:** Persistent Navigation, Coaching Clarity & Continuity Repair Release

This full replacement packet preserves every application feature delivered in v0.22.0 and repairs the development-continuity materials so the application, release state, authority registry, project-health summary, release gate, tests, and independent-review request all describe one authoritative baseline.

## Application features preserved from v0.22.0
- Persistent desktop navigation rail, compact tablet rail, and mobile bottom navigation with More overflow.
- Fluid arbitrary-width layout behavior and dashboard whitespace reduction.
- Coach’s Eye separated into Now, Next Session, and Patterns.
- Abbreviated dashboard coaching linked to authoritative activity-tile detail.
- Compact default coaching charts and repeated-advice removal.
- Context-preserving routes to activity details, Pattern Lab, and Talk to ZEKE.
- Optional profile-backed preferred name with a neutral fallback; no hard-coded user identity.

## Continuity repairs in v0.22.1
- Corrected stale release naming and status language.
- Normalized the artifact registry and current/historical lifecycle states.
- Replaced the stale v0.20.5 Project Health summary.
- Added machine checks for stale registry headers, stale Project Health identity, contradictory release-gate status, and incorrect current-iteration lifecycle.
- Updated the handoff, state, gate, release notes, test evidence, checksums, and independent-review brief.

## Deploy
Replace the deployed ZEKE files with the contents of this folder. Preserve existing `zeke-config.js` values when appropriate. After deployment, hard-refresh once and verify the visible header reports v0.22.1 · 2026.07.19.1.

## Verification limits
Static syntax, governance, and regression checks can be run from this package. Live Google Drive, Calendar, AI-provider, deployed-origin rendering, continuous arbitrary-width dragging, and real-device mobile behavior still require verification in the configured environment.

Start future development with [00_AI_START_HERE.md](00_AI_START_HERE.md).
