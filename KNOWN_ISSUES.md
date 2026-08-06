# ZEKE Known Issues

**Status:** Canonical current issue register

## Open — requires environment verification

- Physical iPhone and representative Android acceptance has not been completed for the current sprint lineage.
- Live Google Drive reconnect, durable write/readback, repair backup, and undo require deployed testing with the user’s account.
- Remote form-guide media depends on network/source availability; written-guide fallback remains required.

## Open — implementation limitations

- Parts of the older multi-exercise workout editor still use legacy strength/cardio branching rather than the adaptive schema service.
- Activity recommendation preferences do not yet fully weight generated routines.
- Provider adapters beyond Google Drive are not implemented.
- Lower-priority exercise knowledge objects require deeper evidence/media review.
- Full correction-history/revert experience remains incomplete.

## Documentation/history

- Numerous historical test reports, iteration records, manifests, and provenance snapshots remain intentionally preserved. Use `DOCUMENTATION_MAP.md`; do not treat every historical file as current authority.

## Resolved in Sprint 4

- Root-level release-note sprawl was consolidated into `RELEASE_NOTES.md`; version-specific snapshots were archived.
- Current package identity and startup/handoff documents were reconciled after Sprint 3.
