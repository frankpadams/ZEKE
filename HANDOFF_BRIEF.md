# ZEKE v0.40.0 Handoff Brief

**Current version:** 0.40.0  
**Build:** 2026.08.03.1  
**Status:** Package verification complete; environment verification outstanding.

## What changed

- Added a deterministic Integrity Engine and user-facing Repair Center for the authoritative JSON.
- Added provider-backed repair backups, correction/audit records, duplicate-write prevention, and session undo.
- Reconciles answered medication-schedule questions and consolidates duplicate question identities.
- Rebuilt the dashboard toward the approved lighter mockup using truthful data states.
- Applied navigation, entry, modal, and guide improvements across the whole mobile app rather than a separate gym mode.
- Added 102 equipment-aware exercise/activity knowledge objects, 12 built-in routines, weekly workout expectation planning, and richer form guidance.
- Added unified version/cache tokens, runtime manifesting, and deployment verification documents.

## Expected live repair candidates

The supplied live-data fixture produced candidates for exact duplicates, an imported spreadsheet legend artifact, a 20-hour sleep entry, zero-valued missing heart rate, malformed paddling fields, an already-answered Mounjaro schedule question, and stale/duplicate discoveries. The app must rescan the connected live repository; fixture counts are not a promise about the deployed state.

## Verification boundary

Package-local automated and rendered tests passed. Deployment still requires the alpha user to verify Google Drive connection, provider writes/backups, actual mobile layout, remote exercise media, and the proposed live-data repairs before applying them.
