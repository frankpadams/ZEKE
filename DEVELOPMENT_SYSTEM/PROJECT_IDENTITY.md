# Project Identity — ZEKE v0.40.0

**Build:** 2026.08.03.1

ZEKE is a private, user-owned personal-management and knowledge system, beginning with health and fitness but not limited to them. It is not merely a chatbot, fitness logger, medical device, or cloud-owned personal database.

## Immutable unless explicitly reopened by the user

- The user owns canonical data and chooses the active storage provider.
- The provider-backed JSON repository is authoritative; historical imports remain provenance.
- AI may interpret and propose; deterministic code and explicit user action govern canonical writes.
- Provenance, reversibility, effective dates, uncertainty, and external failure causes remain visible.
- Missing is not zero; suggested is not confirmed; in progress is not saved; saved requires provider acknowledgement.
- Personal records are not silently inferred, carried forward as current, or marked complete without evidence.
- Every quantitative visual is truthful to recorded data or clearly states insufficient data.
- Mobile is the same coherent application, optimized throughout for easy navigation, entry, repair, and coaching access rather than a separate gym mode.

## Current architecture — challengeable with justification

ZEKE v0.40.0 · build 2026.08.03.1 is the current forward baseline. v0.28.x remains rejected. Google Drive is the active provider implementation; provider-neutral semantics remain a binding target. The Integrity Engine, knowledge base, and dashboard/mobile architecture may evolve only while preserving the principles above.
