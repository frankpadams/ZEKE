# Project Zeke Constitution

**Current authority review:** 2026-08-29 · runtime v0.48.0.2 build 2026.08.30.1 · governance 2026.08.30.1

## 1. User ownership

Zeke never owns the user's personal history. The durable repository is chosen and authorized by the user.

## 2. No hidden local personal database

The browser may hold data in memory while a page is open, but Project Zeke must not silently persist personal records in localStorage, sessionStorage, IndexedDB, Cache Storage, or another device-local database unless a future user explicitly chooses and understands a different mode.

## 3. Replaceable layers

The application host, storage provider, AI provider, and integration providers must remain replaceable. The user's history is the durable asset.

## 4. Raw observations are sacred

Original observations, source documents, raw notes, and provenance are preserved. Interpretations and derived views can be rebuilt. Corrections must not silently erase prior history.

## 5. Event time and record time are distinct

Zeke records when something happened separately from when it was entered.

## 6. Missing means unknown

Missing data must not be treated as zero, normal, negative, or completed.

## 7. Evidence over opinion

Facts, measurements, trends, hypotheses, discoveries, and discussion prompts remain distinguishable. Important conclusions must be traceable to observations, dates, sources, assumptions, and confidence.

## 8. Scientific and professional humility

Zeke does not diagnose, prescribe, provide medical clearance, or claim causation from correlation. Exercise insights can consider injury and other user-specific factors but remain transparent decision support.

## 9. User-centered AI

Zeke should use the least invasive and least costly method capable of answering the question. Database lookups and deterministic calculations should not require cloud AI. Paid AI is disabled unless the user explicitly chooses it.

## 10. AI is advisory and replaceable

External AI does not become the system of record. Compact task-specific context is preferred to sending a complete history.

## 11. Review before transformation

Historical import can interpret and suggest, but ambiguous mappings remain visible and no AI suggestion silently changes the permanent dataset.

## 12. Reversible imports

Normalized records created by a historical import must be attributable to a batch and removable without damaging manually entered or independently sourced records.

## 13. Calm interface

The interface should reduce memory burden and avoid nagging, shame, or noisy developer status messages. Domain dashboards are separate by default; combined views are an optional user choice.

## 14. Unified Talk to ZEKE interaction

ZEKE uses one unified **Talk to ZEKE** input for questions, observations, corrections, commands, and file-assisted imports. The system—not the user—must infer intent, support multiple intents in one message, preserve the raw input, and ask natural clarification when needed. Separate Ask and Tell interfaces are superseded unless the user explicitly reopens that decision.

## 15. Discoveries remain open to revision

Patterns should show evidence, uncertainty, confidence, plausible alternative explanations, and—when useful—suggested ways to collect better data. Relationships do not establish causation.

## 16. Modular core

Core services remain domain-agnostic. Modules may depend on the core; the core must not depend on any one module.

## 17. Portability

Open, versioned, documented formats and explicit provenance are preferred so the repository can be migrated when technology or providers change.

## 18. Privacy notice before document storage

Before importing or attaching sensitive documents, Zeke must explain where the document will be stored and that provider privacy/security characteristics are outside Zeke's control.

## Connection simplicity principle

Ordinary connection to personal storage, calendars, AI services, and other supported providers must be designed for a nontechnical user. The alpha user's normal Google flow is one button followed by the provider's own account picker and consent screen. Application-owner registration is a separate deployment concern and must not be presented as an ordinary user task.

## Manual AI portability principle

Zeke must provide a provider-agnostic manual AI packet workflow. A user can export a focused packet, process it with an AI of choice, and import a structured response. AI responses remain advisory and cannot silently overwrite raw observations or user-confirmed facts.

## 19. Every conversation visibly concludes

Every meaningful interaction must end in a state the user can understand: saved, already saved, not saved, waiting for clarification, waiting for confirmation, dismissed, failed safely, or completed without changing data. A silent or ambiguous end state is a defect.

## 20. Questions have purpose and consequence

ZEKE asks only when the answer changes a record, decision, recommendation, workflow, or remembered context. The interface explains why the answer matters and what ZEKE will do with it.

## 21. Context-specific recovery

When interpretation is incomplete, ZEKE proceeds as far as safely possible through deterministic rules, connected AI, a natural clarification, or a focused editor. Generic failure is not the default recovery path.

## 22. Retry and duplicate safety

Repeated submission must not silently create repeated records. ZEKE distinguishes saved, already saved, intentional separate event, canceled, and not saved. Undo and corrections preserve provenance.

## 23. One transaction, multiple views

Talk to ZEKE, Waiting for You, focused editors, AI consultation, audit history, and unresolved-interaction diagnostics are views or stages of the same user transaction. They must not create disconnected competing records of intent.

## 24. Local workflow minimization

Workflow continuity may retain minimized operational metadata on the device, but personal source text, health proposals, and durable decision content belong in the user-owned repository. Diagnostic exports exclude credentials and expose privacy controls.

## Adaptive context and minimum-friction interaction (v0.25 clarification)
- Dashboard remains ZEKE's home. Conversation is an important input and correction path, not the sole focal point.
- Prefer a reliable two-tap workflow over a longer workflow. Do not remove transparency, confirmation, provenance, or correction merely to reduce taps.
- Reuse one design system and one data model across adaptive contexts. Gym capture, insight review, provider presentation, and uncertainty review are contextual arrangements of the same evidence—not separate applications.
- Show only fields relevant to the activity or decision. Strength, cardio, rehabilitation, recovery, and other activity types must not inherit irrelevant universal columns.
- Evidence-backed guidance is labeled a **consideration**, with personal observations, research basis when available, confidence, limitations, and factors that could change it. ZEKE must not imply clinical authority or certainty.
- Identity, gender, administrative information, and medically relevant physiology are distinct. Ask only for the minimum information needed for a specific purpose, explain why, permit self-description and omission, and never infer clinical anatomy from gender identity.
- Data captured with low effort should become more valuable later through timelines, trends, visit summaries, and clinician-facing views.


## 25. Dashboard answers user questions

High-level interface structure follows the questions users naturally ask rather than internal data categories: How am I? What do I need to do? What has changed? What should I do? What is coming up? What does ZEKE need clarified?

## 26. Dashboard is a daily briefing

The Dashboard prioritizes current state, commitments, meaningful changes, and supported guidance. It is not a miniature copy of every domain page.

## 27. One authoritative home

Every record, analysis, and recommendation has one authoritative home. Dashboard summaries link to detail rather than creating parallel competing versions.

## 28. State, process, and intelligence remain distinct

Health state may appear in Health at a Glance. Fitness process belongs in Fitness. Trends, observations, and recommendations are intelligence. Individual exercises do not become health-status tiles.

## 29. Coach's Eye is actionable; Trends are descriptive

Coach's Eye contains only supported next actions and may legitimately report that nothing needs attention. Trends & Analysis describes what changed and may require no intervention. Descriptive patterns must not be repackaged as advice merely to fill space.

## 30. Health is the umbrella health domain

Symptoms, life context, sleep, measurements, vitals, medications, supplements, labs, nutrition, conditions, and relevant personal/family health context belong within Health rather than competing as permanent top-level applications.

## 31. Questions remain conversational

Use **Questions for You**. Clarification should feel like a continuation of Talk to ZEKE, not a survey, review queue, or administrative assignment.

## 32. User-curated health briefing

Users choose which Health metrics appear in Health at a Glance. When no choices exist, ZEKE may show an explicit most-used fallback. Fitness exercises are not eligible health-state tiles.

## 33. Contextual handoff, not generic launcher

ZEKE may open another application only when it directly completes a ZEKE workflow and reduces friction. Dynamic or security-sensitive content stays in its source application. ZEKE does not replace the device home screen.

## 34. Visual composition serves comprehension

Panels size from their own content. Expandable analysis receives adequate width. Avoid shared-height or masonry layouts that create large blank areas, and use restrained rounding, density, and hierarchy to make the daily briefing understandable.

## Governance reconciliation — July 25, 2026

The following principles are binding for ZEKE work. They were approved before the v0.29.0 recovery implementation. Current implementation status varies by principle and is recorded in `CURRENT_RELEASE_SCOPE.md` and `TEST_REPORT.md`; governance approval never substitutes for evidence.

## 35. Provider-agnostic durable storage

ZEKE's data model and core services must remain independent of any one storage vendor. Google Drive is the first active adapter, not the permanent architecture. OneDrive, Dropbox, SFTP/private storage, and other user-chosen providers must be supportable through a common storage contract without changing canonical record semantics.

## 36. One active primary provider

ZEKE uses one active primary storage provider at a time. That provider is the durable source of truth for confirmed records, corrections, routines, preferences, and other lasting user data. Multi-provider migration or backup may be added deliberately; automatic multi-provider mirroring is not assumed.

## 37. Local recovery is temporary and noncanonical

Normal-browser use may employ device-local storage only as a temporary recovery cache for unfinished forms. Local recovery content is never canonical, never presented as saved, and never used for history, charts, Coach's Eye, Discovery, workout guidance, or health interpretation. Incognito/private browsing may be supported, but ZEKE does not promise that unsaved work survives closure of a private session.

## 38. Effective dates are visible and editable

Every screen that creates or corrects a workout, laboratory result, vital, medication event, sleep record, symptom, or comparable observation must visibly show the effective date and permit intentional editing. Event time and record time remain separate.

## 39. Sleep preserves actual segments

A sleep day may contain multiple sleep segments. ZEKE preserves each actual start and end time, sums sleep duration across segments, and does not falsely merge awake gaps into one continuous period. By default, overnight sleep is assigned to the date of the final morning awakening; the date remains editable.

## 40. Workout routines are templates, not historical workout identities

A routine such as Chest Day is a reusable starting template. It may suggest an ordered exercise list and optional targets, but the historical record consists of the exercises and values actually saved. Users may add, remove, skip, edit, or reorder template exercises without changing past history or requiring the workout to be stored as a named routine unit.

## 41. Mobile exercise/workout entry is a focused portable context

Mobile exercise/workout entry is part of the same ZEKE application, reached through ordinary logging such as `+ Log Exercise`; it is not a separate “Gym Mode.” It is optimized for phone use during a workout and may also be available on tablets. It must not replace, reshape, or break the full desktop ZEKE experience. Desktop ZEKE retains its broader dashboard, analysis, history, routine-management, and spacious workout-entry interfaces while using the same records and rules.

## 42. Suggested values are not performed facts

Opening an exercise may prefill primary workout fields from the most recent confirmed performance. Applying a ZEKE progression recommendation may alter the current unsaved fields. Neither action saves data or implies the exercise occurred. Optional fields such as pain, RPE, rest, and notes begin blank and are never copied from a prior workout.

## 43. Save language follows the real operation

A confirmed record is not saved until the active provider acknowledges the durable write. When provider storage is the primary write target, the truthful sequence is **Saving to provider → Saved**. ZEKE must not display Saved, Synced, completed indicators, or green checks before the operation they describe succeeds.

## 44. Workout guidance is concrete and evidence-bounded

ZEKE does not use a readiness score, readiness gauge, or numberless readiness substitute. Workout and progression guidance states a concrete action such as proceed, modify, defer a movement, or request more context, together with the evidence and limiting factors that support it. Missing information remains missing. Pain is optional; absence of a pain entry is not zero pain. When evidence is insufficient, ZEKE says so and does not offer an unsupported progression action.

## 45. Mobile exercise-entry navigation preserves context

History, progression, Form Guide, exercise entry, and return paths must preserve the active mobile exercise-entry context. Opening history must not silently route to an unrelated legacy activity tile or discard current unsaved edits.

## 46. Form Guide media must be truthful

A Form Guide image must visibly depict an adult performing the named exercise at a useful instructional moment and angle. A person resting, posing, or merely holding equipment does not qualify. Licensing and attribution are necessary but not sufficient. Tapping the primary image may reveal a verified movement sequence.

## 47. AI credentials use a separate encrypted vault

AI-provider credentials are not ordinary preferences and must never be stored as plaintext in source code, GitHub, spreadsheets, browser storage, or an ordinarily readable provider file. The intended cross-device design is an encrypted vault stored with the active provider, unlocked by Google/provider identity plus a ZEKE PIN through a narrowly scoped, rate-limited security component. Decrypted credentials remain in memory only. That component stores no health records, workouts, AI conversations, or plaintext provider keys.

## 48. AI-vault recovery is separate from product-data recovery

A recovery code may permit PIN replacement while preserving encrypted AI connections. If both PIN and recovery code are lost, ZEKE may reset the inaccessible credential vault and require provider keys to be entered again. This process is independent of mobile workout entry, workout records, and the user's canonical personal repository.

## 49. Release timestamps and provenance are record-integrity requirements

Unchanged files retain their original bytes and original modification timestamps. Changed and new files use their actual modification time. Every delivered archive has one clearly named top-level folder, a file-by-file hash/provenance record, and no fabricated or future-dated modification times. Verification claims must name exactly what was tested.

## 50. Rejected branches do not silently become the baseline

ZEKE v0.27.2 was the approved recovery source for the clean Gym Mode rebuild. ZEKE v0.29.0 is the current runtime and forward-development baseline. The v0.28.x Gym Mode branch remains rejected; it may be consulted only as failure evidence or for selectively re-evaluated backend ideas. No v0.28.x visual or cumulative-CSS behavior is inherited automatically.

## 51. Longitudinal context is a first-class record property

ZEKE represents facts as points, repeated occurrences, or time-bounded intervals. Retrospective statements may cover many dates, but their provenance must state when the user reported the range. Bulk interpretation is previewable, correctable, and must not silently overwrite contradictory evidence.

## 52. One knowledge model, many lenses

Health, Fitness, Timeline/Calendar, Body Area, Documents, Trends, Discover, and Coach's Eye are lenses over one provenance-preserving longitudinal model. Feature-specific copies of the user's truth must not become competing systems of record.

## 53. Recognition is an auditable pipeline, not magic

Uploaded files, screenshots, images, and pasted content pass through explicit ingestion stages: capture context and metadata; extract available content; identify deterministic signals; classify with bounded confidence; use replaceable AI only where semantic interpretation adds value; validate against schemas; ask when ambiguity remains; review before commit. The original source remains linked to imported facts.

## 54. Source reference information remains source-specific

Clinical reference ranges, thresholds, flags, percentiles, and interpretive bands shown by a source are stored with that source result and are not silently generalized into universal thresholds. ZEKE-derived interpretation remains separately labeled.

## 55. Calendar disclosure is staged and granular

Before connecting an external calendar, ZEKE explains read/write scope and third-party privacy implications. Before creating or syncing a dedicated ZEKE calendar, ZEKE separately explains what ZEKE data will leave the repository. Sensitive categories may require per-event approval; medication details and highly private context are excluded by default. Calendar sync never becomes the canonical health record.

## 56. Visualizations represent evidence, not decoration masquerading as data

Charts, timelines, gauges, body maps, comparison graphics, and status indicators that appear quantitative must be generated from real records or clearly labeled illustrative content. ZEKE does not fabricate scores, trends, events, or precision to make the interface appear intelligent.

## 57. Examples validate mechanisms; they do not become product rules

User-specific examples may be used as regression scenarios, but implementation remains generalized across activities, exposures, body areas, symptoms, outcomes, and users. A single anecdote must not become hard-coded coaching logic.


## 58. Clinical training intelligence preserves evidence classes

Clinical source facts, explicit clinician/PT restrictions, AI-generated anatomical or movement inferences, and observed exercise responses are separate evidence classes. ZEKE may combine them for transparent training decision support, but it must preserve provenance and confidence and may not silently promote an AI inference into a clinician restriction, diagnosis, contraindication, prescription, or medical clearance.

## 59. Adaptive progression is response-bounded

PT/rehab, strength, cardio, and return-to-activity progression may share one adaptive training model, but progression must remain evidence-bounded. Missing symptom data is unknown; a blank pain field is not pain-free. Clinician restrictions outrank AI recommendations. Clinically relevant movements require both progression criteria and regression/stop criteria, and meaningful worsening during, later the same day, or the next day must prevent automatic progression.


## 60. Navigation is informational by default

Opening Fitness, an exercise, variation, workout plan, PT guide, history, or other content does not itself create, complete, or modify a record. Mutating actions such as Start, Log, Save, Complete, Correct, or Delete must be explicit and distinguishable. ZEKE may offer contextual actions without forcing an artificial browse/workout mode dichotomy.

## 61. Workout recommendations remain proposals until accepted

A generated regimen is inspectable and editable before use. Starting a proposed workout is explicit. During an active workout, ZEKE may adapt unsaved remaining work using actual completed order, effort, symptoms, clinical constraints, and user choices, but completed records are preserved and user actions remain reversible/traceable.

## 62. Rehab media must depict the named movement truthfully

Passing a file-count or image-count test is not sufficient. A PT/rehab guide must depict the named movement/setup closely enough to be useful, identify schematic/illustrative media honestly, include accessible text, and defer to clinician-specific instructions. Generic filler imagery cannot satisfy a movement-level visual release gate.

## Governance reconciliation — 2026-08-24

The following principles were approved during the v0.46.0 UX Architecture + Connected Anatomy iteration and are binding going forward.

## 63. Screen-level UX quality is a release requirement

A screen is the unit of user-experience quality, not an isolated component. Layout systems must preserve hierarchy, readable widths, reachable content, intentional whitespace, and coherent composition across supported sizes. A page may not be called acceptable merely because its individual controls render or automated overflow checks pass.

## 64. Consequential actions visibly respond

Every consequential click, tap, save, selection, merge, dismissal, correction, or destructive action produces an immediate visible state change and a truthful eventual outcome. Silent clicks, ambiguous selected state, and UI that leaves the user wondering whether an action registered are defects.

## 65. Reachability and scroll are functional requirements

Content that exists must remain reachable. Loading states, modal/sheet locks, fixed shells, sticky controls, nested scrollers, or responsive transitions may not leave the application unintentionally non-scrollable or cover the final meaningful content. First-load behavior is tested separately from refreshed behavior.

## 66. Talk to ZEKE has predictable window states

Talk to ZEKE uses explicit closed, compact, and expanded states where those states exist on the form factor. Close is always obvious and reliable. Expanding, collapsing, closing, reopening, or resizing must preserve the conversation and unsent user work where appropriate and must not trap page scroll or navigation.

## 67. Visual identity supports recognition before reading

Recurring domains and event types use stable visual identities across ZEKE. Icons, sparklines, status markers, compact diagrams, and other microvisuals should improve orientation, scanning, trend recognition, or actionability. They are not decorative substitutes for truthful data.

## 68. Progressive disclosure protects attention

ZEKE shows decision-relevant information first, then offers detail, evidence, provenance, biomechanics, and deeper reasoning on demand. Repeated or already-visible facts should not be restated merely to fill cards or panels. Empty and sparse states consume space in proportion to their information value.

## 69. Body structures form a shared relationship layer

Exercises, PT/rehab movements, injuries, and symptoms may link through relevant muscles, joints, bones/body regions, clinically useful tendons/soft tissues, laterality, and movement patterns. ZEKE distinguishes primary movers, secondary movers, stabilizers, and direct versus indirect involvement. These relationships support navigation and context in both directions; they do not by themselves create a diagnosis, contraindication, or prohibition.

## 70. Reference knowledge is versioned and governable

General anatomy, exercise, biomechanics, terminology, and injury-relationship knowledge is separate from the user's personal record. Reference knowledge carries source/provenance, version, review date/state, and update history. Refreshes are diffed and validated before activation, can be rolled back, and may be marked stale. A reference update never overwrites personal history, clinician/PT instructions, source documents, or confirmed user facts.

## 71. Exercise detail is body-aware and browseable

User-facing exercise detail prioritizes useful body-area context over internal implementation terminology. Primary and secondary body areas may be navigable links to body-area hubs containing relevant anatomy, exercises, PT/rehab, current/past injury context, and history. Search remains available but must not be the only practical way to navigate the exercise library.

## 72. Exercise variation analytics remain distinct

A canonical exercise may summarize multiple variations, but each equipment/variation history remains an independent series. Expanded charts compare relevant variations on shared axes without connecting unrelated variation points. Missing load remains unknown and is omitted/gapped; a single valid observation remains a point until a second observation exists. Set count, reps, load basis, pain/RPE, and context remain available at appropriate detail levels.

## 73. Recommended actions explain enough to decide

When ZEKE recommends a workout or other meaningful action, it provides a short concrete reason up front when that reason helps the user decide. Deeper reasoning, evidence, uncertainty, and provenance remain available on demand.


## 79. Rendered experience is release evidence

For visual/interface releases, syntax checks, DOM assertions, overflow tests, and component presence are necessary but not sufficient. A representative browser render must be inspected against the active Design Authority before a release can claim visual acceptance. An obviously broken or materially off-authority screen fails even if automated structural checks pass.

## 80. Functional continuity and presentation recovery are separable

ZEKE’s user-owned records, workflow semantics, and verified functional capabilities must not be discarded merely because a presentation layer fails. A recovery may replace the presentation layer while preserving verified data and behavior. Failed presentation experiments are not forward baselines unless explicitly rehabilitated and verified.

## 81. Approved visual references may be binding

When the user approves a specific visual reference and Design Authority incorporates it, implementation must preserve its spatial grammar, spacing rhythm, visual hierarchy, icon language, and information-density intent unless the user later reopens that decision. Real data and truthful empty states take precedence over fictional mockup content.

## 82. UI graphics are bounded components

Icons, SVGs, sparklines, and other microvisuals must have explicit, context-appropriate bounds. Generic presentation rules must not allow a small UI graphic to expand into page-scale content or distort layout.


## Governance integrity amendment — 2026-08-25

## 74. Observation precedes interpretation

Literal evidence is read before expectations, assumptions, or prior conversational context are used to interpret it. Screenshot text that affects diagnosis—especially version/build labels, dates, medication details, values, error messages, and control labels—must be directly inspected. If it cannot be read confidently, ZEKE development reports uncertainty rather than completing the text from expectation.

## 75. Development claims require artifact evidence

A statement that a feature is implemented, fixed, tested, saved, synced, or release-ready is not evidence by itself. Current source/package bytes, named tests, browser interaction, provider acknowledgement, reload persistence, deployed-environment checks, or user verification must support the claim at the appropriate level. When narration and artifacts disagree, the contradiction is reconciled before dependent development continues.

## 76. Evidence states do not imply one another

Material work is classified as **Specified → Coded → Source-tested → Rendered-tested → Persistence-tested → Environment-tested → User-verified**. A lower state never implies a higher one. Release and handoff language names the strongest state directly demonstrated.

## 77. Consequential writes are transactional from the user's perspective

A failed durable write must not leave unsaved local state presented as though it were saved. Where practical ZEKE rolls back the local mutation, preserves the user's intended action for retry, reports one truthful status, and distinguishes authorization/reconnection failures from validation or provider failures.

## 78. Contradictory evidence is a stop signal

When screenshots, source, tests, continuity documents, runtime identity, provider state, or user reports materially disagree, development pauses long enough to identify the actual state. Additional features are not built on top of an unresolved contradiction.


## Governance reconciliation — 2026-08-29

## 83. Distinct distributed builds have distinct numeric versions

Every externally distinguishable ZEKE build or release receives a unique numerical version. A new ZIP, deployed build, or distributed candidate may not reuse the exact numeric version of a prior distinct artifact. Additional version components may be added as needed. Runtime UI, startup screen, manifests, tests, checksums, release notes, and package identity must agree.

## 84. Longitudinal intelligence prioritizes trends over isolated commentary

Individual observations remain available and editable, but ZEKE should generally interpret repeated measures through personal baselines, rolling/calendar-period summaries, variability, direction, persistence, and meaningful change. Sleep is a required acceptance case: current week versus prior week, recent 30 days versus prior 30 days, and longer-term context when enough verified observations exist. Missing data remains unknown.

## 85. No universal readiness score

ZEKE does not compress health, recovery, or training context into a universal readiness/recovery score. When action guidance is warranted, ZEKE states the concrete recommendation, limiting factors, relevant evidence, uncertainty, and confidence in plain language.

## 86. No social or community product layer by default

ZEKE is a private personal-management system. Feeds, followers, likes, leaderboards, public challenges, and community competition are outside the product roadmap unless the user explicitly reopens that decision.

## 87. Connected entities are explorable in multiple directions

Body areas, muscles, joints, bones, tendons, exercises, equipment/variations, injuries, symptoms, PT/rehab movements, measurements, and relevant timeline events should be navigable through contextual links wherever the relationship is useful. Exploration is bidirectional and may enter from multiple paths; it must not create or modify records without an explicit mutating action. Dead-end detail screens are avoided when a meaningful related path exists.

## 88. Sleep guidance distinguishes population guidance from personal trend

ZEKE may compare sleep duration with established adult guidance when relevant, but it distinguishes general guidance from the user's personal baseline and does not label a single night healthy/unhealthy. Duration, consistency, interruptions/quality when available, trend direction, and evidence sufficiency remain distinct.

## 89. Release packages are cold-handoff complete

A release package must be self-documenting enough for a competent developer with no prior conversation history to identify the current version/build, architecture, authoritative decisions, implemented capabilities, partial/specification-only work, known defects, tests/evidence states, provider/environment verification still required, and next priorities. Superseded documents may remain only when clearly historical and non-authoritative.
