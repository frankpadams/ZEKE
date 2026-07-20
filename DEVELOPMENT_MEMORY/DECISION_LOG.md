# Decision Log

**Status:** Authoritative and cumulative

- **DEC-001:** AI proposes; deterministic code commits canonical data.
- **DEC-002:** Empty data never reserves visualization space.
- **DEC-003:** Dashboard uses independent content-sized rows rather than paired long columns.
- **DEC-004:** Structured forms own structured facts; Talk to ZEKE handles commands, corrections, imports, and bulk work.
- **DEC-005:** Normalization remains largely invisible to the user while preserving original wording and provenance.
- **DEC-006:** A release is not complete until the final ZIP is reopened and audited.
- **DEC-007:** Documentation is part of the product and must be updated in the same iteration as code.
- **DEC-008:** Every iteration requires a presented Pre-Development Checkpoint and explicit user approval recorded before the first edit; a general request to continue is not sufficient authorization.
- **DEC-009:** The v0.16.3 recovery’s exact source identity—source ID, original sheet name, exact source cell or cells, category, and metric/entity—is authoritative historical provenance. New synchronization code must remain compatible with it rather than rewriting recovered records.
- **DEC-010:** Medication matching uses a canonical medication identity for analysis and duplicate detection while preserving the original source wording in every historical or newly entered record.
- **DEC-011:** Connected-workbook synchronization is user-initiated. A read-only preflight must be available independently, and ordinary conversation saves or corrections must not trigger background synchronization.

- **DEC-012:** Accessible prior ZEKE conversations are required continuity input. Explicit user decisions carry forward unless they conflict with the Constitution or verified evidence; previous assistant claims remain hypotheses until corroborated.
- **DEC-013:** Workbook synchronization follows read → normalize → compare → preview → explicit commit → persisted verification. It is journaled, idempotent, backs up before event writes, archives a previously connected source before replacement, never rewrites the source workbook during synchronization, and regenerates a separate mirror only after verification.
- **DEC-014:** A medication Today’s Action is complete only after a confirmed taken/administered/completed event for that medication on the current local day. Missed, not-yet-taken, pending, uncertain, scheduled, or carried-forward records never count as completion.

## 2026-07-18 — Unified Talk to ZEKE is constitutional
Separate Ask and Tell inputs are superseded. One unified input handles questions, observations, corrections, commands, and uploads; the system infers intent and asks clarification when necessary.

## 2026-07-18 — Authority must be executable
Current release identity, scope, artifact authority, lifecycle, supersessions, and package counts must be machine-checkable. Prose-only declarations cannot certify a release.

- **DEC-015:** Activity entry, library filtering, detail rendering, charts, and coaching derive from one canonical category registry rather than separately maintained label lists.
- **DEC-016:** An activity has one primary category and may carry secondary attributes. User-facing category does not erase task-specific metrics or analytical distinctions.
- **DEC-017:** Current Workout History editing is record-scoped. Global rename, duplicate merge, bulk recategorization, and broad migration require separate explicit approval and safeguards.
- **DEC-018:** Legacy activity migration uses existing structured fields, known identities/aliases, and high-confidence deterministic mappings. Ambiguous records enter a review queue and are never silently assigned by loose regex alone.
- **DEC-019:** Correction architecture preserves the original/raw source and a compact change history while maintaining a corrected canonical record for derived views. Full event-sourced replay is not adopted without demonstrated need.
- **DEC-020:** Runtime assets are inventoried and classified before deletion. Lack of an obvious static reference is not sufficient evidence that an asset is safe to purge.
- **DEC-021:** A continuity release is complete only after all active standing documents are reviewed for relevance, not merely the state/gate files required by the audit script.


## 2026-07-19 — v0.23.0 trusted AI and conversation-state decisions

- Treat all external AI output as untrusted consultation data.
- AI providers cannot directly call tools, write records, disclose data, or initiate actions.
- ZEKE validates AI output against a fixed outcome allowlist and retains exclusive execution authority.
- Pending correction/edit flows must not consume clearly unrelated new observations.
- Recent Health Record review/edit must open a record-specific editor rather than route to the Dashboard.
- All major page layouts should use independent content-driven streams and bounded-fluid columns.
