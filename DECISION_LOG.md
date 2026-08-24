# ZEKE Decision Log — Current Index

**Current authority review:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.1 · governance 2026.08.24.2

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
9. `RELEASE_NOTES.md` is the cumulative living release history; `DEVELOPMENT_MEMORY/ITERATION_HISTORY.md` is the living implementation/iteration history. Version-specific snapshots are historical, not competing current authorities.
10. A feature is called Implemented only when code/artifact evidence exists; Verified only when the named check actually ran; environment-dependent claims remain explicit.
11. Whitespace is purposeful: information density should improve usefulness without reducing readability or touch accessibility.
12. An unfamiliar future team must be able to continue from the package alone.


## v0.46.0 binding UX / connected-knowledge decisions

28. **Whole-screen UX:** the screen is the unit of quality; layout primitives own geometry and must prevent unreadable widths, accidental dead space, and unreachable content.
29. **Dashboard role:** Dashboard is a selective cross-domain briefing, not a mini Health page or equal-weight card wall.
30. **Microvisuals:** stable icons, sparklines, status markers, and timeline cues are functional orientation aids and must remain truthful.
31. **Visible action feedback:** every consequential action immediately enters a visible selected/working/result state; silent clicks are defects.
32. **Talk window:** Talk to ZEKE uses predictable closed/compact/expanded states with an obvious close control and no stale scroll lock.
33. **Browse-first exercise navigation:** search is optional; body area, Recent, Favorites, PT/Rehab, equipment/location, and movement/context routes provide practical discovery.
34. **Exercise/body links:** exercise detail uses linked primary/secondary body areas and body-area hubs may surface related exercises, PT/rehab, and current/past injury context.
35. **Anatomy relationship layer:** exercise/PT/injury/symptom concepts share governable structure relationships (muscles/joints/bones/soft tissue/laterality/movement) with direct/indirect and primary/secondary/stabilizer distinctions where supported.
36. **No automatic prohibition:** anatomy overlap is context, not a contraindication; explicit restrictions and actual response retain separate authority.
37. **Reference-knowledge updates:** general knowledge is versioned, source-traceable, diffed/validated before activation, rollback-capable, and separate from personal records.
38. **Variation presentation:** variation rows show their own latest useful details and are ordered by recency; redundant Last/Current/count badges are omitted.
39. **Variation chart truth:** detailed charts compare independent variation series on shared axes; missing load is unknown/gapped, never zero.
40. **Recommendation explanation:** show a concise decision-relevant Why this up front, with deeper reasoning on demand.
41. **Intentional scrolling:** a readable scrollable Recent Activity window is acceptable on desktop; nested scrolling is minimized on mobile.

## New Sprint 4 decision

**DEC-S4-001 — Canonical documentation set (superseded by living-document consolidation):** Current-state entry points are now `00_AI_START_HERE.md`, `ZEKE_CONSTITUTION.md`, `CURRENT_RELEASE_SCOPE.md`, `DEVELOPMENT_MEMORY/PROJECT_STATE.json`, `ARCHITECTURE.md`, `DESIGN_AUTHORITY.md`, `DECISION_LOG.md`, `RELEASE_NOTES.md`, `TEST_REPORT.md`, and `DEVELOPMENT_MEMORY/RELEASE_GATE.md`. Superseded duplicate status/change files are retained only through consolidated histories.

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



## 2026-08-23 — Fitness/Log workflow separation without artificial modes
- Log remains a top-level action for the explicit intent to record something.
- Fitness is not a logging mode: users can explore exercises, form guides, history, PT/rehab, progress, and proposed workouts without creating records.
- Contextual logging remains available where naturally useful, including inside an active workout.
- No separate Explore/Workout mode selector is introduced; the distinction is expressed through explicit mutating actions.
