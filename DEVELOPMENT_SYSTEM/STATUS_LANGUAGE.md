# Required Status Language

**Current runtime:** ZEKE v0.46.0 · build 2026.08.24.3  
**Governance revision:** 2026.08.24.3  
**Reviewed:** 2026-08-24

## Development and release claims

- **Verified:** directly demonstrated by a named test, inspection, rendered run, deployed check, physical-device check, or reopened-package comparison.
- **Package integrity verified:** archive structure, bytes, hashes, timestamps, and document checks passed; this does not prove runtime behavior.
- **Continuity reconciled:** current authorities agree with the runtime and evidence; this does not prove unrun behavior.
- **Implemented, package-tested:** code exists and named package-local tests passed; live/device behavior may remain unverified.
- **Implemented, unverified:** code exists but the relevant behavior was not directly exercised.
- **Partially implemented:** only a defined subset exists; the missing portion must be named.
- **Governance locked:** the user approved the requirement; code may not yet implement it.
- **Proposed:** suggested direction not yet approved.
- **Hypothesis:** suspected explanation awaiting evidence.
- **Historical:** accurate only as a record of an earlier state.
- **Rejected:** not an approved forward-development path.

Release notes and handoffs must not use “working,” “fixed,” “safe,” “synced,” “ready,” “research-supported,” “provider-agnostic,” or “verified” where named evidence does not support the claim.

## User-facing persistence states

- **Not started:** no user entry has been made.
- **Suggested:** values or exercises were deliberately loaded from a routine, previous performance, or recommendation but are not performed facts.
- **In progress:** the user entered or changed something not yet durably saved.
- **Saving to provider/storage:** the durable write is in progress.
- **Saved:** the active provider/storage operation acknowledged the durable write.
- **Save failed:** the write was not acknowledged; the current entry remains available for retry where possible.
- **Unsaved changes:** a saved record was edited again but the correction has not been saved.

A separate **Synced** state is valid only after ZEKE implements and verifies a distinct durable-local-save plus remote-sync queue. It must not be simulated.

## Talk to ZEKE closure language

Every meaningful interaction states what changed—or that nothing changed. Retry and correction paths distinguish saved, already recorded, duplicate, failed, dismissed, waiting for clarification, and not saved.


Current continuity review: v0.46.0 · build 2026.08.24.3 · governance 2026.08.24.4.
