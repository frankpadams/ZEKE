# ZEKE Backlog

**Status:** Authoritative

| ID | Item | Priority | Status | Origin | Resurface when |
|---|---|---:|---|---|---|
| UI-021 | Drag-and-drop dashboard editing | High | Blocked pending evidence decision | v0.20 planning | User accepts either deployed-origin responsive verification or explicitly approves isolated-harness evidence as sufficient |
| UI-022 | Saved layout profiles | High | Back burner | v0.20 planning | UI-021 design begins |
| UI-023 | Pin vs Auto tiles | Medium | Deferred | v0.20 planning | Layout profiles exist |
| UI-024 | Layout export/import and reset/undo | Medium | Deferred | v0.20 planning | UI-021 implementation begins |
| FIT-014 | Complete Fitness information architecture polish | High | Ready for review | prior iteration | Next Fitness-focused release |
| MED-008 | Re-audit medication logger routing and confirmation preferences | High | Completed v0.20.3 | prior iteration | Reopen only if medication regression fails or requirements change |
| DOC-003 | Consolidate or archive historical documentation | Medium | Partially completed v0.20.5 | v0.20.2 | Reopen when physical archive/pruning is worth compatibility risk |

## Current backlog disposition
- **MED-008:** Completed within the approved scope. Medication states, schedule-aware backfill, preview, duplicate handling, canonical identity, null-date behavior, and repository-based preferences were addressed and regression-tested.
- **DOC-003:** The active authority chain and competing entry points were consolidated in v0.20.5. Physical relocation or deletion of historical records remains deferred because it offers limited handoff value and may break external references.
- **FIT-014:** Resurfaced and deliberately excluded from this data-compatibility release. It remains Ready for review.
- **UI-021:** Blocked until the user resolves what evidence level satisfies the responsive prerequisite: deployed-origin verification, or explicit acceptance of isolated-harness evidence.

At the start of every iteration, explicitly bring back all **Ready for review** items and any deferred or Back burner item whose resurfacing condition is true.
