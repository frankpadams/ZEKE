# AI / Developer Start Here — ZEKE v0.43.1

**Build:** 2026.08.17.1  
**Release label:** Mobile Professional Polish  
**Last known user-deployed baseline:** v0.40.5 · build 2026.08.06.5

This package is intentionally self-describing. A new developer or AI team should be able to continue ZEKE using this package alone. Do not assume access to prior chats.

## Read in this order

1. `ZEKE_CONSTITUTION.md` — product invariants.
2. `RELEASE_NOTES.md` — what this candidate changes and what still blocks promotion
3. `PROJECT_STATE.md` — current truth and release boundary.
3. `CURRENT_RELEASE_SCOPE.md` — complete v0.43 work scope and acceptance criteria.
5. `DESIGN_AUTHORITY.md` — authoritative mobile/fitness mockup decisions and what is superseded.
5. `ARCHITECTURE.md` — storage, longitudinal data, AI, calendar, and provenance contracts.
6. `FEATURE_STATUS.md` — implemented vs incomplete vs planned.
7. `KNOWN_ISSUES.md` — current blockers only.
8. `DECISION_LOG.md` — durable product/architecture decisions.
9. `TEST_REPORT.md` — consolidated current and historical test evidence.
10. `DEVELOPMENT_MEMORY/ITERATION_HISTORY.md` — consolidated iteration history.
11. `DOCUMENTATION_MAP.md` — package map.

## Runtime

ZEKE is a readable static web application. `index.html` loads the runtime directly; there is no compile step. Canonical user data lives in the connected user-owned storage repository (Google Drive in alpha). Browser storage is for limited device/session UI state, not the authoritative health record.

## Non-negotiable current rules

- Preserve original user wording, provenance, corrections, missing-as-unknown, and reversible history.
- Medication schedules and medication dose occurrences are different entities. A schedule may generate clearly labeled assumed occurrences; later corrections modify the occurrence without rewriting history.
- A calendar appointment is candidate evidence, never proof that an event occurred.
- Calendar retrospective health reconciliation is a mobile-first workflow: screen candidates quickly, then confirm only selected items.
- AI/provider credentials are stored in the connected ZEKE workspace for cross-device use, not in localStorage. They are excluded from all reports/diagnostics.
- DEXA is provenance/method for Health → Measurements / Body Composition, not a top-level navigation destination.
- The authoritative mobile exercise-entry design is the normal `+ Log Exercise` page. Do not reintroduce “Gym Mode.”
- Canonical exercises own variation-specific histories. Variations are plotted as separate series on the same canonical exercise axes and are never assumed mechanically equivalent.
- Inline set rows are both display and input; reps/load may differ per set; effort and pain are optional per set.
- High-quality PT visual guides are a release gate.
- The side navigation must remain vertical on mobile/intermediate widths; horizontal compressed menu buttons are a regression.
- Generated spreadsheets are reports/exports. They are not a competing database. Legacy workbooks are migration/reconciliation sources only.
- Consolidate release/test/provenance documentation into living histories; do not recreate file sprawl.

## Before publishing

Run the package-local suites, rendered mobile gates, project audit, and ZIP readback. Then perform physical-phone visual acceptance against `DESIGN_AUTHORITY.md`. Do not promote an RC if PT visual coverage, mobile visual acceptance, longitudinal medication correction, calendar reconciliation, or storage credential sync is unverified.
