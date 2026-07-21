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
