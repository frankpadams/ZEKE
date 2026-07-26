> **Current-status note (2026.07.25.2):** This document accurately records the July 25 decisions and the then-current v0.27.2 recovery baseline. ZEKE v0.29.0 is now the current runtime built from that baseline. Use `PROJECT_STATE.json`, `FEATURE_STATUS.md`, and `ITERATION_RECORD_v0.29.0.md` for present implementation status.

# Governance Reconciliation — July 25, 2026

**Status:** Authoritative  
**Runtime baseline:** ZEKE v0.27.2 · build 2026.07.22.2319  
**Governance revision:** 2026.07.25.1  
**Runtime changes:** None

## Purpose

This document records the user-approved decisions reached after the independent Gym Mode audit and subsequent clarification. It exists to prevent future iterations from losing context or reintroducing rejected assumptions.

## Baseline and branch authority

- v0.27.2 is the authoritative recovery baseline.
- The approved Gym Mode mockup is a locked specification.
- v0.28.x is rejected as a forward-development baseline.
- v0.28.x may be reviewed only as failure evidence or for individually re-evaluated backend concepts.

## Storage and persistence

- Storage is provider-agnostic. Google Drive is first, not permanent.
- One active primary provider is used at a time.
- Confirmed records, corrections, routines, and durable preferences belong with the active provider.
- Normal-browser local storage may protect unfinished forms only.
- Local recovery is not canonical and never affects history or analysis.
- Incognito may run ZEKE, but unsaved recovery is not guaranteed.
- Saved means the provider acknowledged the write. Do not simulate a separate sync stage.

## Cross-domain entry rules

- Effective date is visible and editable anywhere data is entered or corrected.
- Event time and record time remain distinct.
- Blank is not zero.
- Suggested is not confirmed.
- In progress is not saved.
- Corrections preserve provenance.

## Sleep

- Multiple sleep chunks may belong to one sleep day.
- Each segment retains actual start/end timestamps.
- Total sleep sums segments and excludes gaps.
- Overnight sleep defaults to the final-awakening date, which remains editable.

## Fitness and Gym Mode

- Workout history is adequately grouped by day and exercise; named sessions are not required.
- Routine names are template labels only and need not appear as historical workout units.
- Users can add, remove, skip, edit, and reorder routine exercises.
- Custom exercises are allowed.
- Gym Mode is primarily for phone use while at the gym.
- Desktop ZEKE keeps its full experience and receives a separate spacious Workout Entry.
- Tablets are supported responsively but are secondary to phone and desktop.
- Add Exercise shows commonly performed exercises first and adds one at a time; library search is available below.
- Exercise order may be rearranged but does not imply performance order.
- Cardio intensity may be blank, a single value, or a range.
- End Workout closes the active entry context but does not prevent later same-day exercise entries.
- Removing a saved exercise requires confirmation.

## Exercise screen

- Coach’s Eye includes a written evidence-based category.
- A numberless speedometer-style gauge may show rough qualitative readiness.
- Progression includes a sparkline and trend statement.
- Last Time uses a condensed summary when sets are uniform and a clear set-by-set layout when they differ.
- Primary set fields are prefilled from the most recent confirmed exercise entry.
- Each set’s weight is editable; initial values may propagate only to untouched blank set fields.
- Optional pain, RPE, rest, and notes live in an expandable section and begin blank.
- Apply Recommended Progression updates the unsaved form only and can be undone.
- Cancel and Save remain at the end of the form rather than fixed over the viewport.
- After provider-confirmed save, briefly show Saved and return to Today’s Workout.
- History opens full-screen inside Gym Mode on phones and returns to the same exercise.

## Form Guide

- The bottom sheet occupies roughly 75–80% of the phone screen.
- Setup, Movement, Common Mistakes, and Tips are vertically stacked.
- One verified instructional image is shown initially.
- Tapping it opens an expanded movement sequence.
- The image must actually show the named exercise being performed.

## Readiness and progression

- Use evidence-based categories, not a numeric percentage.
- The methodology is versioned and considers comparable confirmed sessions, consistency, performance, effort when available, recency, goals, and restrictions.
- Pain is optional. Missing pain is not zero pain.
- When evidence is insufficient, say so and do not show Apply Recommended Progression.

## AI connections

- AI credentials are stored in an encrypted vault with the active storage provider.
- A short PIN requires a narrowly scoped, rate-limited security service.
- That service stores no health records, workouts, AI conversations, or plaintext provider credentials.
- Decrypted credentials exist only in browser memory.
- Recovery code may reset the PIN; loss of both recovery code and PIN permits destructive vault reset and re-entry of provider keys.
- AI-vault recovery is unrelated to Gym Mode recovery.

## Release and development integrity

- Preserve existing internal application structure.
- Use one clearly named top-level extraction folder.
- Preserve unchanged bytes and timestamps exactly.
- Use actual modification times for changed/new files.
- Publish hashes and provenance.
- Do not use “verified” beyond the exact tests performed.
- Test phone and desktop as separate protected experiences.
