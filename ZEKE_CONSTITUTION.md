# Project Zeke Constitution

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

Panels size from their own content. Expandable analysis receives adequate width. Avoid shared-height or masonry layouts that create large blank areas, and use restrained rounding, density, and hierarchy to make the daily briefing understandable.## Governance reconciliation — July 25, 2026

The following principles are binding for ZEKE work. They were approved before the v0.29.0 recovery implementation. Current implementation status varies by principle and is recorded in `FEATURE_STATUS.md`; governance approval never substitutes for evidence.

## 35. Provider-agnostic durable storage

ZEKE's data model and core services must remain independent of any one storage vendor. Google Drive is the first active adapter, not the permanent architecture. OneDrive, Dropbox, SFTP/private storage, and other user-chosen providers must be supportable through a common storage contract without changing canonical record semantics.

## 36. One active primary provider

ZEKE uses one active primary storage provider at a time. That provider is the durable source of truth for confirmed records, corrections, routines, preferences, and other lasting user data. Multi-provider migration or backup may be added deliberately; automatic multi-provider mirroring is not assumed.

## 37. Local recovery is temporary and noncanonical

Normal-browser use may employ device-local storage only as a temporary recovery cache for unfinished forms. Local recovery content is never canonical, never presented as saved, and never used for history, charts, readiness, Coach's Eye, Discovery, or health interpretation. Incognito/private browsing may be supported, but ZEKE does not promise that unsaved work survives closure of a private session.

## 38. Effective dates are visible and editable

Every screen that creates or corrects a workout, laboratory result, vital, medication event, sleep record, symptom, or comparable observation must visibly show the effective date and permit intentional editing. Event time and record time remain separate.

## 39. Sleep preserves actual segments

A sleep day may contain multiple sleep segments. ZEKE preserves each actual start and end time, sums sleep duration across segments, and does not falsely merge awake gaps into one continuous period. By default, overnight sleep is assigned to the date of the final morning awakening; the date remains editable.

## 40. Workout routines are templates, not historical workout identities

A routine such as Chest Day is a reusable starting template. It may suggest an ordered exercise list and optional targets, but the historical record consists of the exercises and values actually saved. Users may add, remove, skip, edit, or reorder template exercises without changing past history or requiring the workout to be stored as a named routine unit.

## 41. Gym Mode is a focused portable context

Gym Mode is optimized primarily for phone use during a workout and may also be available on tablets by user choice. It must not replace, reshape, or break the full desktop ZEKE experience. Desktop ZEKE retains its broader dashboard, analysis, history, routine-management, and spacious workout-entry interfaces while using the same records and rules.

## 42. Suggested values are not performed facts

Opening an exercise may prefill primary workout fields from the most recent confirmed performance. Applying a ZEKE progression recommendation may alter the current unsaved fields. Neither action saves data or implies the exercise occurred. Optional fields such as pain, RPE, rest, and notes begin blank and are never copied from a prior workout.

## 43. Save language follows the real operation

A confirmed record is not saved until the active provider acknowledges the durable write. When provider storage is the primary write target, the truthful sequence is **Saving to provider → Saved**. ZEKE must not display Saved, Synced, completed indicators, or green checks before the operation they describe succeeds.

## 44. Readiness is qualitative and evidence-bounded

Exercise-readiness guidance uses evidence-based categories and a written explanation. A numberless visual gauge may provide a rough qualitative cue, but it must not imply false precision. Missing information remains missing. Pain is optional; absence of a pain entry is not zero pain. When evidence is insufficient, ZEKE says so and does not offer a progression action.

## 45. Gym Mode navigation preserves context

History, progression, Form Guide, exercise entry, and return paths must remain within the active Gym Mode context on portable devices. Opening history must not silently route to a legacy activity tile or discard current unsaved edits.

## 46. Form Guide media must be truthful

A Form Guide image must visibly depict an adult performing the named exercise at a useful instructional moment and angle. A person resting, posing, or merely holding equipment does not qualify. Licensing and attribution are necessary but not sufficient. Tapping the primary image may reveal a verified movement sequence.

## 47. AI credentials use a separate encrypted vault

AI-provider credentials are not ordinary preferences and must never be stored as plaintext in source code, GitHub, spreadsheets, browser storage, or an ordinarily readable provider file. The intended cross-device design is an encrypted vault stored with the active provider, unlocked by Google/provider identity plus a ZEKE PIN through a narrowly scoped, rate-limited security component. Decrypted credentials remain in memory only. That component stores no health records, workouts, AI conversations, or plaintext provider keys.

## 48. AI-vault recovery is separate from product-data recovery

A recovery code may permit PIN replacement while preserving encrypted AI connections. If both PIN and recovery code are lost, ZEKE may reset the inaccessible credential vault and require provider keys to be entered again. This process is independent of Gym Mode, workout records, and the user's canonical personal repository.

## 49. Release timestamps and provenance are record-integrity requirements

Unchanged files retain their original bytes and original modification timestamps. Changed and new files use their actual modification time. Every delivered archive has one clearly named top-level folder, a file-by-file hash/provenance record, and no fabricated or future-dated modification times. Verification claims must name exactly what was tested.

## 50. Rejected branches do not silently become the baseline

ZEKE v0.27.2 was the approved recovery source for the clean Gym Mode rebuild. ZEKE v0.29.0 is the current runtime and forward-development baseline. The v0.28.x Gym Mode branch remains rejected; it may be consulted only as failure evidence or for selectively re-evaluated backend ideas. No v0.28.x visual or cumulative-CSS behavior is inherited automatically.
