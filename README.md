# ZEKE v0.20.5

> **Development handoff:** begin only with [`00_AI_START_HERE.md`](00_AI_START_HERE.md).

**Build:** 2026.07.18.1  
**Release:** Continuity Baseline Cleanup & Enforcement Release

ZEKE is a private, user-owned personal management system. This release is a continuity-baseline cleanup: it preserves the v0.20.4 application and data safeguards while making the handoff authority chain internally consistent and enforceable.

## Defining changes
- Constitution now reflects the approved unified **Talk to ZEKE** interaction.
- Current release, scope, iteration, release-gate, and artifact records agree.
- A machine-readable artifact registry distinguishes authoritative, supporting, historical, and superseded materials.
- The audit now catches stale identities, scope mismatches, authority conflicts, wrong file counts, broken links, unsafe medication aliases, and known supersession conflicts.
- Negative-control tests prove the audit fails when contradictions are deliberately introduced.
- Competing start files are explicit redirects rather than parallel authorities.

## Deploy
Replace the entire deployed ZEKE application folder with this release. Back up the deployed folder first and hard-refresh after upload.

## Verification boundary
Local structural, governance, and application regressions are recorded in `TEST_REPORT_v0.20.5.md`. Live Google Drive, Calendar, AI-provider, branding-asset, and deployed-origin behavior still require the user's configured environment.
