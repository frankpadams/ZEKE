# Development Workflow

**Status:** Authoritative

## Before editing
1. Unpack the prior release into a clean directory.
2. Read the authoritative documents in `README_FIRST.md` order.
3. Review the error log and active prevention rules.
4. Review Backlog items and resurface eligible items to the user.
5. Establish the exact baseline by checksums and current version strings.
6. Write the planned scope into the iteration record.

## During development
1. Modify source, tests, README, Project State, Backlog, and Iteration Record together.
2. Preserve provenance and user-owned data rules.
3. Record newly discovered defects in the error log or known issues.
4. Do not use release notes as a wish list. They describe only code present in the package.

## Verification levels
- **Syntax:** parsers accept changed files.
- **Structural:** expected DOM/classes/functions exist.
- **Rendered:** application is served and visually inspected at required widths.
- **Functional:** interactions are exercised.
- **Live-data:** connected services and real data are exercised.

Always state which levels passed.

## Packaging
1. Stage from a clean directory.
2. Synchronize version/build in all active files.
3. Run the release gate.
4. Create ZIP.
5. Reopen ZIP into a fresh verification directory.
6. Re-run checksum, version, syntax, and document checks.
7. Deliver only the verified ZIP.
