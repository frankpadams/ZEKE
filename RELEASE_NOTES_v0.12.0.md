# ZEKE v0.12.0 — Contextual AI Workout Structuring

This release replaces generic AI interpretation for workout logs with a workout-specific, schema-constrained interpretation path.

## Improvements
- Routes workout-shaped chat messages to a dedicated AI workout interpreter.
- Uses the deterministic parser as a grounded draft and fallback rather than allowing generic AI output to override reliable parsing.
- Separates multiple dates into distinct workout sessions.
- Normalizes M/D, M/D/YY, and M/D/YYYY dates.
- Preserves stairclimber duration and step count together.
- Supports weight × reps × sets and mixed-set variants.
- Stores stable session/workout IDs, activity order, modality, original exercise wording, and normalized exercise names.
- Validates AI output before it becomes a confirmation candidate; malformed or empty AI output is not saved.
- Uses deterministic storage actions after user confirmation; the AI does not write directly to the repository.
- Adds duplicate protection when confirmed workout events match existing records closely.
- Clarification questions explain why the answer is needed.

## Data safety
- No migration or rewrite of existing workout history.
- Raw user input remains preserved.
- Existing events are not deleted.
- AI output is proposed for confirmation before storage.
