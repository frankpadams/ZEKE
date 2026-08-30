# v0.48.0 integrity decisions — 2026-08-25

**Current authority review:** 2026-08-29 · runtime v0.48.0.2 build 2026.08.30.1 · governance 2026.08.30.1

See root `DECISION_LOG.md` and `DEVELOPMENT_SYSTEM/EVIDENCE_INTEGRITY.md`. Current v0.48 work is evidence-calibrated; user-approved next-release features remain specified until preserved implementation exists.

# Decision Log

**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6

**Status:** Authoritative and cumulative


## 2026-08-24 — v0.47.0 Visual System Recovery + Preserved Functionality

- Recover from the known stable v0.45.1 package while using reconciled v0.46.0 build 2026.08.24.2 as the verified functional donor.
- Do not merge presentation code from the failed later v0.46 visual experiments.
- Preserve all verified post-v0.45 functionality: Talk close/expand states; Questions saving feedback and durable resolution; browse-first exercise/body navigation; anatomy/injury/PT links; variation recency/sets/shared-axis charts; short-Why workout reasoning; document intake; medication/calendar privacy; adaptive remaining-workout behavior.
- The exact approved desktop mockup at `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png` is binding through Design Authority.
- Desktop Dashboard uses the mockup’s coordinated rows and compact density; weekly workout planning moves to Fitness rather than being deleted.
- Desktop and mobile use separate purpose-built presentation compositions over the same functional model.
- UI icons are explicitly bounded SVG components; generic SVG sizing rules are prohibited.
- A visual release requires actual browser rendering plus visual inspection and adversarial states, not merely syntax/DOM/overflow tests.
- v0.47.0 is a real semantic release because the package is materially different; future material changes also increment the release version.


## 2026-08-24 — v0.46.0 UX Architecture + Connected Anatomy

- The screen is the unit of visual quality; component-level success cannot certify an unusable composition.
- Dashboard is a cross-domain daily briefing, with only a selective Health snapshot.
- Stable visual identities and microvisuals support scanning before reading.
- Recent Activity may intentionally scroll in a bounded desktop window; mobile normally uses natural page flow.
- Talk to ZEKE must always be easy to close and must preserve predictable closed/compact/expanded state without stale scroll locks.
- Consequential buttons must visibly enter selected/working/result states.
- Exercise discovery is browse-first; body-area navigation is a primary non-search path.
- Exercise detail links primary and secondary body areas. Body-area views can link to exercises, PT/rehab, history, and known injury/symptom context.
- ZEKE maintains a shared, versioned anatomy/body-structure reference layer mapping muscles, joints, bones/body areas, useful soft tissue, laterality, and movement patterns; primary/secondary/stabilizer and direct/indirect involvement are distinguished where supported.
- Anatomy relationships are contextual and never automatically convert into exercise prohibitions.
- Reference knowledge must support provenance, review state, refresh/diff/validation, rollback, and stale warnings without overwriting user-specific records or clinician/PT facts.
- Variation rows are recency-ordered and show their latest own performance; redundant “Last,” “Current,” or variation-count labels are removed.
- Expanded exercise charts keep variation histories as independent series on shared axes and preserve missing-as-unknown semantics.
- Workout recommendations show a short “Why this” up front with deeper reasoning available on demand.
- Runtime v0.46.0 build 2026.08.24.2 remains unchanged by governance revision 2026.08.24.3; this revision reconciles standing documentation and hardens the release audit.
- **DEC-001:** AI proposes; deterministic code commits canonical data.
- **DEC-002:** Empty data never reserves visualization space.
- **DEC-003:** Dashboard uses independent content-sized rows rather than paired long columns.
- **DEC-004:** Structured forms own structured facts; Talk to ZEKE handles commands, corrections, imports, and bulk work.
- **DEC-005:** Normalization remains largely invisible to the user while preserving original wording and provenance.
- **DEC-006:** A release is not complete until the final ZIP is reopened and audited.
- **DEC-007:** Documentation is part of the product and must be updated in the same iteration as code.
- **DEC-008:** Every iteration requires a presented Pre-Development Checkpoint and explicit user approval recorded before the first edit; a general request to continue is not sufficient authorization.
- **DEC-009:** The v0.16.3 recovery’s exact source identity—source ID, original sheet name, exact source cell or cells, category, and metric/entity—is authoritative historical provenance. New synchronization code must remain compatible with it rather than rewriting recovered records.
- **DEC-010:** Medication matching uses a canonical medication identity for analysis and duplicate detection while preserving the original source wording in every historical or newly entered record.
- **DEC-011:** Connected-workbook synchronization is user-initiated. A read-only preflight must be available independently, and ordinary conversation saves or corrections must not trigger background synchronization.

- **DEC-012:** Accessible prior ZEKE conversations are required continuity input. Explicit user decisions carry forward unless they conflict with the Constitution or verified evidence; previous assistant claims remain hypotheses until corroborated.
- **DEC-013:** Workbook synchronization follows read → normalize → compare → preview → explicit commit → persisted verification. It is journaled, idempotent, backs up before event writes, archives a previously connected source before replacement, never rewrites the source workbook during synchronization, and regenerates a separate mirror only after verification.
- **DEC-014:** A medication Today’s Action is complete only after a confirmed taken/administered/completed event for that medication on the current local day. Missed, not-yet-taken, pending, uncertain, scheduled, or carried-forward records never count as completion.

## 2026-07-18 — Unified Talk to ZEKE is constitutional
Separate Ask and Tell inputs are superseded. One unified input handles questions, observations, corrections, commands, and uploads; the system infers intent and asks clarification when necessary.

## 2026-07-18 — Authority must be executable
Current release identity, scope, artifact authority, lifecycle, supersessions, and package counts must be machine-checkable. Prose-only declarations cannot certify a release.

- **DEC-015:** Activity entry, library filtering, detail rendering, charts, and coaching derive from one canonical category registry rather than separately maintained label lists.
- **DEC-016:** An activity has one primary category and may carry secondary attributes. User-facing category does not erase task-specific metrics or analytical distinctions.
- **DEC-017:** Current Workout History editing is record-scoped. Global rename, duplicate merge, bulk recategorization, and broad migration require separate explicit approval and safeguards.
- **DEC-018:** Legacy activity migration uses existing structured fields, known identities/aliases, and high-confidence deterministic mappings. Ambiguous records enter a review queue and are never silently assigned by loose regex alone.
- **DEC-019:** Correction architecture preserves the original/raw source and a compact change history while maintaining a corrected canonical record for derived views. Full event-sourced replay is not adopted without demonstrated need.
- **DEC-020:** Runtime assets are inventoried and classified before deletion. Lack of an obvious static reference is not sufficient evidence that an asset is safe to purge.
- **DEC-021:** A continuity release is complete only after all active standing documents are reviewed for relevance, not merely the state/gate files required by the audit script.


## 2026-07-19 — v0.23.0 trusted AI and conversation-state decisions

- Treat all external AI output as untrusted consultation data.
- AI providers cannot directly call tools, write records, disclose data, or initiate actions.
- ZEKE validates AI output against a fixed outcome allowlist and retains exclusive execution authority.
- Pending correction/edit flows must not consume clearly unrelated new observations.
- Recent Health Record review/edit must open a record-specific editor rather than route to the Dashboard.
- All major page layouts should use independent content-driven streams and bounded-fluid columns.

## 2026-07-20 — v0.23.1 workflow-stabilization decisions

- **DEC-022:** Replies to an active confirmation transaction are routed before general natural-language parsing. A confirmation can save once, report the result, and offer view/undo.
- **DEC-023:** Sleep is a first-class health event with start/end timestamps, wake date, duration, quality, optional interruptions/notes, and provenance.
- **DEC-024:** Review Questions must show the source, proposed record/action, uncertainty, and exact consequence of each action; internal processing rules are not a user decision.
- **DEC-025:** Metric change and reference-range status are distinct concepts. A tile may describe change only from the observations currently being compared unless a valid contextual range is separately established.
- **DEC-026:** One exercise recommendation object feeds every Fitness surface. Different surfaces may vary detail, not direction.
- **DEC-027:** Every insight question or action has a defined downstream use. Information that cannot yet be structured is preserved as a Potential Health Event and included in later relationship analysis.
- **DEC-028:** Calendar events are contextual evidence and question triggers, never proof of attendance, completion, treatment, or outcome.
- **DEC-029:** The primary sidebar contains major domains. Labs belongs to Health; Pattern Lab belongs to Insights.

## 2026-07-21 — v0.24.0 trust and workflow decisions

- Treat every meaningful user interaction as one durable workflow with explicit terminal status.
- Store full workflow content in the user-owned repository; keep only minimized operational metadata locally.
- Replace Questions/Past Decisions with Conversation Memory: Waiting for You and Things I’ve Learned.
- Present review items as source → understanding → proposal → purpose → downstream action → decision.
- Put the multi-tab Support & Improvement Report under Settings → Diagnostics & Exports.
- Use focused editors after interpretation and AI cannot safely complete a task, beginning with medication schedules.
- Treat Talk to ZEKE attachments and Settings imports as the same safeguarded import path.
- Define the readable static runtime as authoritative and legacy hashed bundles as historical.


## 2026-07-22 — v0.26.0 daily briefing and domain decisions

- The Dashboard answers user questions and functions as a daily briefing.
- Health at a Glance is user-curated from Health; Fitness exercises do not become health-state tiles.
- Today’s Actions, Coach’s Eye, and Upcoming share one compact desktop row; Trends & Analysis gets a full-width expandable row.
- Coach’s Eye is actionable-only with a high threshold and zero-to-three items; Trends & Analysis is descriptive-only.
- Health absorbs Life & Symptoms, Sleep, Medications, Measurements, Labs, Nutrition, Conditions, and related context.
- Fitness remains the process/training domain. Discover becomes the global exploration destination.
- Preserve the phrase “Questions for You.”
- Activity history and detail tables show only activity-relevant fields; stair steps, ambulatory steps, and distance are distinct.
- Record removal is reversible and audit-preserving.
- External-app behavior is contextual handoff only.
- v0.25.2 mobile workout saving is a protected regression boundary.


## 2026-07-22 — v0.26.0 medication, goals, profile, and interaction decisions

- **DEC-030:** A medication schedule expresses expectation, not completion. Completion requires an explicit confirmed taken/administered event on the applicable local date.
- **DEC-031:** Historical medication entry uses a reviewed batch transaction: choose date range and cadence, preview every date, skip matching existing records, preserve batch provenance, and provide undo.
- **DEC-032:** Health and Fitness goals are durable user-owned records. Deterministic structure review is always available; connected-AI review is optional, advisory, non-committing, and not medical clearance.
- **DEC-033:** The user profile belongs in provider-backed workspace preferences. Device-local personal-profile storage is legacy migration input only, not the current system of record.
- **DEC-034:** Root re-render preservation must never overwrite live values in direct-entry overlays that are not being replaced. Editable-state restoration is scoped to the replaced root.
- **DEC-035:** Favorites is the default Fitness library lens. When no favorites exist, ZEKE may show a clearly labeled most-used fallback rather than silently switching the user’s selected lens.


## 2026-07-22 — v0.26.1 interaction and evidence hotfix

- Activity Library presentation defaults to Favorites on each fresh load; stale category persistence is rejected.
- Activity categories use one responsive selector plus search, not a horizontally clipped chip strip.
- Dashboard disclosure state is explicit application state and survives rerenders.
- Relationship links must resolve to the selected item or an item-specific insufficient-data explanation; unrelated generic fallback is prohibited.
- Coach considerations must expose the user-data trigger, ZEKE interpretation, specific research sources when applicable, and limitations.

## 2026-07-25 — Recovery baseline, storage, health-entry, Gym Mode, and AI-vault decisions

- **DEC-036:** ZEKE v0.27.2 is the approved recovery baseline. The v0.28.x Gym Mode branch is rejected as a forward-development baseline.
- **DEC-037:** Storage is provider-agnostic. Google Drive is the first adapter; OneDrive, Dropbox, SFTP/private storage, and future providers use the same canonical record contract.
- **DEC-038:** ZEKE uses one active primary storage provider at a time. Confirmed records and corrections are durable there.
- **DEC-039:** Normal-browser local storage may hold temporary unfinished-form recovery only. It is noncanonical and cannot feed history or analysis. Incognito does not guarantee preservation of unsaved work.
- **DEC-040:** Every workout, lab, vital, medication, sleep, symptom, and comparable entry screen visibly shows an editable effective date.
- **DEC-041:** A sleep day may contain multiple separately preserved sleep segments. Overnight sleep defaults to the date of final morning awakening; awake gaps are not counted as sleep.
- **DEC-042:** Workout history is adequately grouped by day and individual saved exercises. User-facing named sessions are not required.
- **DEC-043:** Routines such as Chest Day are reusable starting templates, not mandatory historical workout identities. They may include optional target sets/reps.
- **DEC-044:** Custom exercises are supported through activity-specific field profiles.
- **DEC-045:** Gym Mode is primarily a phone workflow for live gym entry. Desktop ZEKE uses a spacious Workout Entry experience and must not be altered by phone-specific layout code.
- **DEC-046:** Opening an exercise may prefill primary fields from the most recent confirmed performance. Optional pain, RPE, rest, and notes remain blank. Applying a recommended progression changes the unsaved form only.
- **DEC-047:** Readiness uses evidence-based categories plus written explanation. A numberless speedometer-style visual is permitted as a rough qualitative cue; insufficient evidence produces no progression action.
- **DEC-048:** Gym Mode History and Form Guide remain inside Gym Mode and preserve current unsaved entry state.
- **DEC-049:** Form Guide media must be manually verified to depict the named exercise being performed; licensing metadata alone is not verification.
- **DEC-050:** Saved means the active provider acknowledged the durable write. A separate Synced state is prohibited unless ZEKE later implements and verifies a distinct synchronization layer.
- **DEC-051:** AI-provider credentials use a provider-backed encrypted vault, PIN unlock through a narrowly scoped rate-limited security component, in-memory plaintext only, recovery code, and destructive vault reset when recovery is impossible.
- **DEC-052:** AI-vault recovery is separate from Gym Mode or personal-record recovery.
- **DEC-053:** Honest timestamps, one labeled extraction folder, preserved unchanged bytes/timestamps, hashes, and narrow verification claims are release-integrity requirements.


## 2026-07-25 — v0.29.0 authority and continuity reconciliation

- **DEC-054:** ZEKE v0.29.0 is the current runtime and forward-development baseline. v0.27.2 remains its historical recovery source; v0.28.x remains rejected.
- **DEC-055:** A current release is not authoritative until the README, handoff, architecture, feature status, state/gate, current iteration, test report, backlog, decision/error memory, artifact registry, project identity/health, and release gate agree with the actual runtime and evidence.
- **DEC-056:** Governance-locked requirements must be labeled implemented, partial, or unimplemented. A release may not infer implementation from the Constitution or decision log.

- **DEC-057:** Release history uses cumulative canonical `RELEASE_NOTES.md` and `CHANGELOG.md`; version-specific release notes remain archived historical snapshots. Every package must be independently understandable by an unfamiliar future development team.

## 2026-08-17 — v0.43 RC2/RC2.1 longitudinal and continuity decisions

- **DEC-050:** Medication schedules and medication dose occurrences are distinct entities. Each expected/actual administration can be represented as a dated occurrence with status and provenance.
- **DEC-051:** Schedule-derived medication occurrences are assumptions, never silent confirmations. A user correction such as “I missed last Friday” updates the matching occurrence and retains correction history.
- **DEC-052:** Historical medication occurrences should be reconstructed from existing trusted evidence where possible; confidence/provenance must survive the migration.
- **DEC-053:** Retrospective calendar reconciliation is a mobile-first review workflow: candidate list first, Relevant / Not relevant / Unsure triage second, detailed confirmation only for selected unresolved candidates. Calendar candidates do not become health facts merely because they were scheduled.
- **DEC-054:** The legacy connected health workbook is not the ongoing canonical record. It remains a migration/reconciliation source until its useful content is verified. Human-readable workbooks are generated reports from canonical records.
- **DEC-055:** AI-provider keys persist through the connected user-owned storage workspace for multi-device continuity. Browser-local keys are noncanonical and should be migrated/cleared. Keys must not be included in standard exports, support reports, repository source, or package artifacts.
- **DEC-056:** Historical “Gym Mode” references remain traceability records only. The current mobile interaction is ordinary `+ Log Exercise` / workout entry.
- **DEC-057:** Every release package must be self-describing enough for an unfamiliar competent team to identify current authority, architecture, implemented state, approved design targets, verification boundary, known blockers, and next work without access to prior conversation.
