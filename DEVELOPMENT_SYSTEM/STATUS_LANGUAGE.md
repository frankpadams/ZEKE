# Required Status Language

**Current baseline:** ZEKE v0.24.0 · build 2026.07.21.1

## Development and release claims

- **Verified**: directly demonstrated by a named test, inspection, rendered run, deployed check, or reopened-package comparison.
- **Implemented, unverified**: code exists but the relevant behavior was not directly exercised.
- **Proposed**: approved or suggested direction not implemented.
- **Hypothesis**: suspected explanation awaiting evidence.
- **Historical**: accurate only as a record of an earlier state.

Release notes and handoffs must not use “working,” “fixed,” “safe,” or “ready” where only implementation is known.

## User-facing workflow states

Talk to ZEKE uses plain outcome language:

- **Understanding** — the message is preserved and being interpreted.
- **AI checking** — a connected AI is being consulted.
- **Waiting for you** — a specific answer changes what ZEKE can do.
- **Ready for confirmation** — a proposed change exists, but nothing has been saved yet.
- **Waiting for correction** — the original remains preserved and no replacement has been saved.
- **Completed** — the interaction reached an explicit outcome.
- **Not saved** — no structured record changed.
- **Already recorded** — an existing record was kept rather than creating a duplicate.
- **Dismissed** — the original may remain preserved, but no structured change was made.
- **Paused** — a newer unrelated workflow superseded the active one.
- **Could not complete** — ZEKE preserved what it could and does not claim success.

Every closure message must state what changed—or that nothing changed. A retry must distinguish saved, already saved, duplicate, failed, and not saved outcomes.
