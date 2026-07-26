# ZEKE Architecture — v0.29.0

**Runtime version:** 0.29.0  
**Runtime build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2  
**Status:** Current runtime architecture plus binding future contracts. Implementation status is separated below.

## Runtime authority and lineage

The readable static application loaded by `index.html` is the **authoritative runtime**. There is **no compilation step** required to edit or deploy this active source. `version.js`, `assets/app.js`, `assets/data-layer.js`, `assets/parser.js`, `assets/ai-router.js`, `assets/workflow-engine.js`, and `assets/styles.css` are active files. Historical and legacy hashed bundles and older versioned assets are retained only for continuity unless referenced by `index.html`.

v0.29.0 was rebuilt from the approved v0.27.2 recovery baseline. v0.28.x remains rejected and is not an inherited visual, state, or CSS baseline.

## Product boundary

ZEKE is a private, user-owned personal-management system beginning with health and fitness but not limited to them. Canonical records, raw observations, corrections, provenance, and derived interpretations remain distinguishable. Missing means unknown. AI proposes; deterministic code and explicit user actions govern durable writes.

## Storage architecture

### Binding target architecture

Core business logic must use a provider-neutral contract supporting authentication/reconnection, read/list/create/update/archive, verified writes, durable preferences, stable identifiers, correction linkage, and encrypted configuration. One active primary provider is used at a time. Google Drive is the first adapter; OneDrive, Dropbox, SFTP/private storage, and future providers must preserve the same record meaning.

### Current v0.29.0 implementation status

The current data layer remains primarily Google-oriented. It does not yet prove that another provider can be substituted without application changes. Provider-agnostic storage is therefore **governance locked but not yet implemented**.

## Canonical, working, and derived data

- **Confirmed canonical data:** acknowledged by the active provider and eligible for history/analysis.
- **Unconfirmed form state:** current values not yet saved.
- **Local recovery cache:** optional normal-browser convenience for unfinished forms; never canonical.
- **Suggested data:** prefilled or recommended values that are not performed facts.
- **Derived data:** calculation or interpretation with method/version and input references.

Private browsing may run ZEKE, but unsaved recovery is not guaranteed. Local recovery never feeds charts, readiness, Coach’s Eye, Discovery, or health interpretation.

## Record integrity

Every durable record should carry a stable identifier, effective date/time, record/create time, source, provenance, status, and correction linkage where applicable. Blank, zero, suggested, in progress, confirmed, computed, corrected, deleted, saving, and saved are distinct states. No success state precedes the acknowledgement it describes.

v0.29.0 visibly exposes the workout date in Gym Mode. The cross-domain requirement for visible editable effective dates remains incomplete elsewhere.

## Sleep architecture

The binding model supports one sleep day containing multiple actual segments, with gaps preserved and overnight sleep defaulting to the final-awakening date. The v0.29.0 runtime does not yet implement the complete multi-segment sleep model.

## Workout records and routines

Workout history is organized by date and individual saved exercises. A named session is not required as the user-facing historical unit. Routines are reusable starting templates, not historical workout identities. Loading a routine creates suggested exercises; history records only what was saved.

v0.29.0 includes starter routine behavior, custom exercise entry, reordering, and prefilled primary fields. Durable provider-backed routine management and revision history remain future work.

## Gym Mode — implemented runtime

Gym Mode is a focused portable workflow, primarily for phones during live workouts. It does not replace desktop ZEKE.

1. Today’s Workout shows the editable workout date.
2. The user chooses Start from Routine or Enter Exercises.
3. Exercises are added explicitly and may be reordered.
4. Opening an exercise shows Coach’s Eye, a qualitative gauge, progression sparkline/history, Last Time, and Today’s Entry.
5. Primary fields may be prefilled from the last confirmed entry; optional details remain blank.
6. Apply Recommended Progression changes the unsaved form only.
7. Save writes the confirmed exercise; Saved appears only after the awaited storage operation succeeds.
8. The screen returns to Today’s Workout after confirmation.
9. History remains inside Gym Mode.

The current implementation uses a simple readiness heuristic. It is not yet the reviewed research-supported methodology required by governance. Form Guide tapping does not yet display a true multi-image movement sequence.

## Desktop

Phone-specific Gym Mode must remain scoped away from desktop ZEKE. A spacious desktop Workout Entry interface using the same schemas and records is governance locked but not yet implemented as a separate experience.

## Talk to ZEKE

One unified Talk to ZEKE input handles questions, observations, corrections, commands, and uploads. Raw input, ambiguity, multiple intents, negation, dates, confirmation, duplicate safety, confidence, and provenance are first-class. Multiple sleep segments must be supported when the sleep schema is implemented.

## AI credential architecture

AI-provider credentials require a separate encrypted provider-backed vault, PIN unlock through a narrowly scoped rate-limited security component, in-memory plaintext only, recovery code, and destructive reset fallback. This is not implemented in v0.29.0; existing ordinary provider configuration must not be mistaken for the approved vault.

## Release architecture

Every archive has one labeled root folder, unchanged bytes/timestamps are preserved, changed/new files use actual local modification time, hashes/provenance are published, and verification language is limited to named evidence.
