# ZEKE v0.40.2 — Sprint 2: Adaptive Activity Schemas

This sprint builds on v0.40.1 and replaces fixed activity-entry assumptions with schema-driven fields.

## Highlights

- Custom activities can choose their own fields and whether each is required.
- Rehabilitation/PT activities no longer default to strength or require weight.
- Cheerleaders has a dedicated PT-friendly field set.
- Massage Chair has recovery-specific fields.
- Direct activity entry uses one shared schema for rendering, validation, saving, and provenance.

See `SPRINT_2_ACTIVITY_ARCHITECTURE_REVIEW.md` for verification and known limits.
