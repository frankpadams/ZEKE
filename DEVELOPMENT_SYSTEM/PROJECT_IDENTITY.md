# Project Identity

ZEKE is a private, user-owned personal-management system, beginning with health and fitness but not limited to them. It is not merely a chatbot, fitness logger, medical device, or cloud-owned personal database.

## Immutable unless explicitly reopened by the user

- The user owns canonical data and chooses the active storage provider.
- Storage semantics are provider-agnostic; Google Drive is an adapter, not the architecture.
- AI may interpret and propose; deterministic code and explicit user action govern canonical writes.
- Provenance, reversibility, effective dates, and uncertainty remain visible.
- Missing is not zero; suggested is not confirmed; in progress is not saved; saved is not synced unless a separate sync operation exists.
- Phone-focused Gym Mode must not replace or break desktop ZEKE.
- Personal records must not be silently inferred, carried forward as current, or marked complete without evidence.

## Current architecture — challengeable with justification

ZEKE v0.29.0 · build 2026.07.25.1 is the current runtime and forward-development baseline. It was rebuilt from v0.27.2; v0.28.x remains rejected. Confirmed records belong with one active primary user-chosen provider. Normal-browser local storage may be used only for temporary unfinished-form recovery and is never canonical. AI credentials follow a separate encrypted-vault architecture that is not yet implemented.

## Encouraged fresh thinking

Question unnecessary complexity, brittle UI assumptions, testing gaps, weak recovery paths, and ways to improve phone and desktop experiences. Fresh proposals must respect immutable principles and pass findings/scope approval before implementation.
