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

## User-observed v0.40.5 issues accepted for v0.41.0

- Discover still separates Overview and Pattern Lab and uses large navigation/empty-state cards rather than surfacing the findings themselves.
- Pattern output can promote high-correlation, tiny-sample or same-session workout relationships that are mathematically real but not useful.
- Trends & Analysis often repeats lifetime change instead of explaining current/recent momentum.
- Dashboard time-frame controls sit in the top bar and visually imply global control.
- Today’s Actions is dominated by recurring schedules and is not yet a compact daily-action surface.
- Workout normalization can merge equipment variations into one progression history.
- PT exercise coverage, shorthand expansion, and recognition/form-guide support remain incomplete.
- The workout logger does not yet provide an explainable next-session progressive-overload target at the point of entry.
- Duplicate-record review exposes technical concepts and does not clearly compare both candidate records.
- Medication schedules do not yet offer an opt-in assumed-as-scheduled adherence mode.
