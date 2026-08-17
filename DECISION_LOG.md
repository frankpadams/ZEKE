# ZEKE Decision Log — Current Index

**Status:** Canonical index. Full historical decisions remain in `DEVELOPMENT_MEMORY/DECISION_LOG.md`.

## Current binding decisions

1. User-owned provider-backed records are canonical; local convenience state is not the durable health record.
2. AI proposes; deterministic code plus explicit user action govern canonical writes.
3. Missing is unknown, suggestions are not facts, and Save is shown only after the real durable operation succeeds.
4. Talk to ZEKE is one unified input; separate Ask/Tell interfaces are superseded.
5. Mobile workout capture is an adaptive arrangement of ZEKE, not a separate Gym application.
6. Activity entry/history/coaching should converge on one activity-schema service and show only relevant fields.
7. User preferences are reversible and separate from historical facts.
8. Every release begins with governance/continuity review and ends with documentation, verification, provenance, and a self-describing package.
9. `RELEASE_NOTES.md` and `CHANGELOG.md` are cumulative living documents. Version-specific notes are historical snapshots, not competing current authorities.
10. A feature is called Implemented only when code/artifact evidence exists; Verified only when the named check actually ran; environment-dependent claims remain explicit.
11. Whitespace is purposeful: information density should improve usefulness without reducing readability or touch accessibility.
12. An unfamiliar future team must be able to continue from the package alone.

## New Sprint 4 decision

**DEC-S4-001 — Canonical documentation set:** The normal current-state entry points are `00_AI_START_HERE.md`, `ZEKE_CONSTITUTION.md`, `PROJECT_STATE.md`, `ARCHITECTURE.md`, `FEATURE_STATUS.md`, `ROADMAP.md`, `KNOWN_ISSUES.md`, `DECISION_LOG.md`, `CHANGELOG.md`, and `RELEASE_NOTES.md`. Historical artifacts remain available but cannot override these unless explicitly designated in the authority map.

## v0.41.0 decisions — Fitness Intelligence & Clarity

13. **Exercise identity:** a movement/exercise family and an exact equipment/variation are related but distinct identities. Variation is the progression unit.
14. **Load basis:** load semantics are structured (for example displayed machine load, per-hand dumbbell, total barbell/system load, Bowflex setting, band resistance, bodyweight/assistance, or unknown). Different bases are not silently converted or compared.
15. **Historical repair:** existing records are never silently rewritten. Preserve the entered name/raw evidence and add reviewed identity metadata only after appropriate confidence/review.
16. **PT naming:** show full understandable PT exercise names first with recognized therapist shorthand in parentheses. Do not expand an uncertain clinic-specific abbreviation without evidence.
17. **PT split movements:** grouped paper labels such as ER/IR may be convenient routine groupings, but external rotation and internal rotation remain separately loggable and may use different resistance.
18. **Form guide:** recognition/setup guidance is a core PT-library feature; generic guides never override clinician-specific instructions.
19. **Progressive overload:** next-session targets appear inside the workout logger for the exact variation, include the reason, and use personal performance/effort/context before published evidence.
20. **Discover:** user-facing Discover is a curated set of meaningful findings. Internal analytical buckets and raw correlation output are secondary drill-downs.
21. **Trend recency:** recurring analysis prioritizes Now → Recent → Longer-term context and should not repeatedly present an unchanged lifetime fact as a fresh insight.
22. **Range ownership:** time-frame controls live with the content they control; Dashboard and Fitness range state are independent.
23. **Today:** the Dashboard Today area contains only genuinely time-relevant, directly actionable items and hides when there is nothing useful to show.
24. **Duplicate review:** duplicate resolution asks a plain-language comparison question and shows both candidate records before asking the user to decide.
25. **Scheduled adherence:** medication-specific scheduled-dose assumptions are opt-in, provenance-marked as assumed rather than explicitly confirmed, and remain correctable by the user.
## v0.43 RC2/RC2.1 binding decisions

21. **Dose occurrences are first-class history.** A recurring medication schedule does not replace a dated occurrence ledger. Expected occurrences may be generated as assumptions only when the owner opts into that behavior; assumptions remain distinguishable from confirmed administrations and are retroactively editable.
22. **Historical dose backfill preserves uncertainty.** Existing schedules, prior records, and retrospective adherence statements may reconstruct history, but inferred occurrences must never be relabeled as directly observed.
23. **Calendar evidence requires confirmation.** Retrospective calendar candidate review is a mobile-first UX. Calendar entries remain candidate evidence until confirmed; reconciliation deduplicates against existing health records before asking detailed questions.
24. **Reports are outputs, not a second database.** Human-readable XLSX/CSV/JSON reports are generated from canonical longitudinal records. Legacy workbooks are migration/reconciliation sources until verified, not competing sources of truth.
25. **Cross-device AI credentials use connected user-owned storage.** Browser-local API-key storage is legacy/noncanonical. Secret values are excluded from reports, diagnostics, source packages, and screenshots/logging wherever practicable.
26. **Historical Gym Mode references are superseded.** Current mobile exercise entry is reached through `+ Log Exercise`; no separate Gym product mode should be reintroduced from historical documents or tests.
27. **Package-alone handoff is a release requirement.** A competent new team must be able to continue from the package without this chat history.

