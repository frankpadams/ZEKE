# ZEKE v0.29.0 — Gym Mode Recovery and Trusted Entry

This release rebuilds Gym Mode from the v0.27.2 recovery baseline while preserving the broader desktop ZEKE experience.

Implemented:
- Mobile-focused Gym Mode with visible, editable workout date.
- Exercises are added explicitly, one at a time, from common exercises, search, custom entry, or a chosen routine template.
- Routine exercises begin as suggestions and are never treated as completed records.
- Primary exercise fields are prefilled from the most recent confirmed entry; optional RPE, pain, rest, and notes remain blank.
- Per-set weight and reps are independently editable.
- Evidence-based qualitative readiness categories with a numberless gauge and written explanation.
- Apply Recommended Progression updates only the unsaved form.
- Progression history remains inside Gym Mode.
- Activity-specific strength and cardio entry fields; cardio intensity may be blank or entered as a range.
- Truthful save language: Saving to storage → Saved. No pre-save Saved or Synced status.
- End Workout exits the current Gym Mode visit without preventing later same-day entries.
- Local temporary recovery for unfinished entries in normal browsing; confirmed records remain provider-backed.
- Form Guide displays only manually reviewed exercise images; unsupported exercises explicitly show that no verified image is available rather than substituting a generic photograph.

Known limits:
- The secure cross-device AI credential vault and additional storage-provider adapters remain separate implementation work.
- Routine templates in this recovery release are starter examples; provider-backed routine management remains future work.
