# Project Identity

ZEKE is a private, user-owned personal management system, beginning with health and fitness but not limited to them. It is not merely a chatbot, a medical device, or a cloud-owned personal database.

## Immutable unless explicitly reopened by the user
- The user owns canonical data and chooses its storage provider.
- AI may interpret and propose; deterministic code and user confirmation govern canonical writes.
- Provenance, reversibility, and uncertainty must remain visible.
- The interface should remove user friction rather than make users classify inputs unnecessarily.
- Empty or unsupported visualizations collapse instead of reserving space or inventing meaning.
- Personal records must not be silently inferred, carried forward as current, or marked complete without evidence.

## Current architecture — challengeable with justification
The present browser application uses user-owned repository storage, deterministic parsers, optional AI routing, read-only preflight, reviewed commit, verification, journal, and mirror regeneration. Architecture documentation describes what exists today; roadmap and backlog describe possible futures.

## Encouraged fresh thinking
Question unnecessary complexity, brittle UI assumptions, testing gaps, repetitive confirmation friction, weak recovery paths, and ways to improve mobile use. Fresh proposals must respect immutable principles and pass findings/scope approval before implementation.
