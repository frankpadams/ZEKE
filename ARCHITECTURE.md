# ZEKE Architecture — v0.27.2 Recovery Baseline

**Runtime version:** 0.27.2  
**Runtime build:** 2026.07.22.2319  
**Governance revision:** 2026.07.25.1  
**Status:** Runtime baseline plus locked future architecture. Governance documentation does not by itself implement the decisions below.

## Authoritative baseline

ZEKE v0.27.2 is the approved recovery baseline. The approved exercise-screen mockup is a locked specification for the next Gym Mode rebuild. The v0.28.x branch is rejected as a forward-development baseline and may be used only as failure evidence or as a source of individually re-evaluated backend ideas.

The active runtime remains the directly editable static application loaded by `index.html`. No application runtime files were changed in this governance reconciliation.

## Product boundary

ZEKE is a private, user-owned personal-management system beginning with health and fitness but not limited to them. Canonical records, corrections, raw observations, provenance, and derived interpretations remain distinguishable. Missing means unknown. AI proposes; deterministic code and explicit user actions govern durable writes.

## Provider-agnostic storage contract

The core application must call a common storage contract rather than Google-, Microsoft-, or Dropbox-specific write functions. The contract must support at least:

- authenticate/reconnect
- read, list, create, update, and archive records
- verify a write and return provider evidence
- store provider-backed preferences and encrypted configuration
- preserve stable record identifiers, corrections, provenance, and timestamps

Google Drive is the first adapter. OneDrive, Dropbox, SFTP/private storage, and future providers must be implementable without changing record meaning. One active primary provider is used at a time.

## Canonical versus temporary data

- **Canonical confirmed data:** durable in the active provider and eligible for history and analysis.
- **Unconfirmed working state:** current form values not yet saved.
- **Local recovery cache:** optional, device-local, normal-browser convenience for unfinished forms only.
- **Derived data:** reproducible calculation or interpretation with method/version and input references.

Local recovery must never feed history, charts, readiness, Coach's Eye, Discovery, or health interpretation. Private browsing may run ZEKE, but unsaved work is not guaranteed to survive closure.

## Record integrity

Every record carries a stable identifier, effective date/time, record/create time, source, provenance, status, and correction linkage where applicable. Every data-entry screen visibly displays the effective date and permits intentional editing.

Blank, zero, suggested, in progress, confirmed, computed, corrected, deleted, saving, and saved are distinct states. No user-facing success state may precede the provider acknowledgement it describes.

## Sleep architecture

A sleep day is an aggregate over one or more actual sleep segments. Each segment retains its own start and end timestamp. Total sleep sums the segments; awake gaps remain gaps. Overnight sleep defaults to the date of final morning awakening, and the effective sleep date remains editable.

## Workout records and routines

Workout history is organized by date and individual saved exercises. A separate named session is not required for the user experience. A hidden transaction or day-group identifier may support integrity without becoming the historical unit.

A routine is a template that may contain an ordered exercise list and optional target sets/reps. Loading a routine creates suggestions only. Users may delete, add, skip, edit, and reorder exercises. Historical data records what was actually saved, not the routine name.

Custom exercises are allowed and must use an activity-specific field profile. Relevant fields only are shown: strength, cardio, mobility/PT, and other activity types do not share a universal column set.

## Gym Mode

Gym Mode is a focused portable workflow, primarily for phones during live workouts. It does not replace desktop ZEKE.

Portable Gym Mode flow:

1. Today’s Workout
2. Start from Routine or Enter Exercises
3. Open one exercise
4. Review written Coach’s Eye guidance, qualitative gauge, sparkline/trend, and Last Time
5. Edit prefilled primary fields
6. Optionally apply ZEKE’s recommended progression without saving
7. Optionally expand pain/RPE/rest/notes, which begin blank
8. Save to the active provider
9. Show Saved only after acknowledgement, then return to Today’s Workout

History and Form Guide remain inside Gym Mode. The Form Guide occupies roughly 75–80% of the phone screen, uses vertically stacked sections, shows one verified instructional image, and expands to a movement sequence when tapped.

Desktop ZEKE retains a spacious Workout Entry experience using the same schemas, records, validation, and provider writes without copying the phone Gym Mode shell.

## Readiness methodology

Readiness is a versioned deterministic or reviewed methodology based on comparable confirmed sessions, consistency, effort when available, recency, goal, and applicable restrictions. Pain is not required, but recorded pain may modify the recommendation. Output categories are qualitative; the gauge has no number. Insufficient evidence produces no progression button.

## Talk to ZEKE

One unified Talk to ZEKE input handles questions, observations, corrections, commands, and uploads. Raw input is preserved. Multiple intents, negation, dates, ambiguity, confidence, confirmation, duplicate safety, and provenance are first-class. Sleep interpretation must support multiple segments in one sleep day.

## AI connections

AI providers remain replaceable and free-first. Provider credentials use an encrypted vault stored with the active storage provider. The intended short-PIN experience requires a narrowly scoped, rate-limited security service that handles unlock authorization only and stores no health records, workouts, AI conversations, or plaintext provider keys. Decrypted keys exist only in browser memory.

## Responsive boundary

Priority order is phone and desktop; tablet support is responsive but secondary. Gym Mode code and CSS must be scoped so it cannot alter the desktop Dashboard, general Fitness interface, Talk to ZEKE, Health, or other modules.

Required acceptance includes iPhone 8-size and newer phone viewports, representative current Android widths/aspect ratios, and common laptop/desktop sizes. No horizontal scrolling is allowed in mobile Gym Mode.

## Release integrity

The established application directory structure is preserved. Every package extracts into one clearly named top-level folder. Unchanged files preserve original bytes and timestamps; changed/new files use their actual local modification time. Hashes, provenance, and verification scope are recorded. A package is not called behaviorally verified when rendered or physical-device behavior was not exercised.
