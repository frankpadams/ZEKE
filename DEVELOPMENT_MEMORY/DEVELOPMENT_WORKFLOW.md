

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.2 · governance 2026.08.24.3
## Full standing-authority reconciliation
Before packaging any release, review **every artifact registered as authoritative**, not merely files containing the version string. Update the Artifact Registry review stamp for each authority only after reading it for contradictions, stale current-state claims, newly binding user decisions, implementation status, and verification boundaries. Also review the standing supporting-continuity set defined by the registry/audit.

A release must fail when:
- an authoritative artifact lacks the current release/build/governance review stamp;
- a supporting continuity document still declares an obsolete release as current;
- Design Authority, Architecture, scope, decision logs, project state, gate, tests, and release notes disagree about a durable decision;
- a release-gate pass is asserted without the named evidence.

Rendered UX verification includes cold-load scroll reachability, readable card widths, visible response to consequential controls, Talk close/expand/collapse states, and representative screen composition—not horizontal overflow alone.

# Development Workflow

**Status:** Authoritative

## Mandatory authorization gate
1. Begin with `../00_AI_START_HERE.md`.
2. Complete the authoritative-document, prior-conversation, baseline, error-log, backlog, and user-data reviews.
3. Present the required Pre-Development Checkpoint.
4. Ask the user to approve, reject, or revise the proposed scope.
5. Stop until explicit approval is received.
6. Record the approved scope and approval timestamp in both the iteration record and `DEVELOPMENT_GATE.json` before the first edit.

General requests to begin or continue do not replace explicit approval of a presented scope.

## Before editing
1. Unpack the prior release into a clean directory.
2. Read authoritative documents in the order defined by `README_FIRST.md`.
3. Review accessible prior ZEKE conversations and durable project context for binding user decisions and corrections. User decisions are requirements unless they conflict with the Constitution or verified current evidence; previous assistant assertions must be independently corroborated.
4. Review the cumulative error log and apply all relevant prevention rules.
5. Review the Backlog and resurface eligible items to the user.
6. Establish the exact baseline using checksums and active version strings.
7. Review supplied user data for compatibility and provenance constraints when relevant.
8. Complete and record the authorization gate above.

## During development
1. Change only the approved scope.
2. Modify source, tests, README, Project State, Backlog, Decision Log, and Iteration Record together.
3. Preserve provenance, user-owned data, compatibility rules, and applicable prior user decisions.
4. Prefer backward-compatible readers and adapters over rewriting legitimate historical data.
5. Record newly discovered defects in the error log or known issues.
6. Do not use release notes as a wish list. They describe only code present in the package.
7. If scope must materially expand, stop and obtain approval for the revised scope before implementing it.

## Verification levels
- **Syntax:** parsers accept changed files.
- **Structural:** expected DOM, classes, functions, fields, and documents exist.
- **Rendered:** application is served and visually inspected at required widths.
- **Functional:** interactions and regression tests are exercised.
- **Live-data:** connected services and supplied real-data fixtures are exercised.

Always state exactly which levels passed and which remain unverified.

## Packaging
1. Stage from a clean directory.
2. Synchronize version/build in all active files.
3. Run the release gate.
4. Create the ZIP.
5. Reopen the ZIP into a fresh verification directory.
6. Re-run checksum, version, syntax, structural, document, and applicable regression checks.
7. Deliver only the verified ZIP.
