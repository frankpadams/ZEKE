# 00 — AI START HERE

**This is the only authoritative entry point for continuing ZEKE development.** Files named README, READ_THIS_FIRST, release notes, or test reports cannot authorize development or override this sequence.

## Fast orientation
Read, in order:
1. `HANDOFF_BRIEF.md`
2. `ZEKE_CONSTITUTION.md`
3. `DEVELOPMENT_SYSTEM/PROJECT_IDENTITY.md`
4. `DEVELOPMENT_MEMORY/PROJECT_STATE.json`
5. `DEVELOPMENT_MEMORY/DEVELOPMENT_GATE.json`
6. `DEVELOPMENT_SYSTEM/AUTHORITY_AND_LIFECYCLE.md`
7. `DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json`
8. `DEVELOPMENT_MEMORY/DEVELOPMENT_ERROR_LOG.md`
9. `DEVELOPMENT_MEMORY/BACKLOG.md`
10. The current iteration record named by `PROJECT_STATE.json`

Run `python tools/project_audit.py`, then answer `DEVELOPMENT_SYSTEM/COMPREHENSION_CHECKPOINT.md`.

## Required phases
Historian → independent reviewer → investigation → findings checkpoint → explicit scope approval → implementation → verification → packaging.

Unexpected findings are not automatic authorization to repair. Present the evidence, classification, risks, smallest corrective scope, exclusions, acceptance criteria, and rollback plan; then STOP.

## Anti-wandering constraints
- General enthusiasm such as “continue” or “get moving” is not authorization.
- Preserve immutable principles unless the user explicitly reopens them.
- Do not redesign adjacent systems to simplify a local change.
- Fresh ideas belong in findings, not code, until approved.
- State evidence levels precisely: Verified, Implemented but unverified, Proposed, Hypothesis, or Historical.
- Never claim live-provider, rendered, or data behavior without direct evidence.

## First response from a new AI
Report baseline identity and checksum status; five core principles; verified versus unverified state; surfaced backlog; contradictions/audit failures; fresh-angle observations; proposed investigation scope and exclusions; then clearly STOP for approval.
