# ZEKE v0.17.7 — Data Integrity Center

## New
- Data Integrity is now an active cleanup workspace inside ZEKE rather than a read-only audit.
- Detects activity-name duplicates caused by case, punctuation, spacing, and selected aliases.
- Safely merges duplicate activity identities into one canonical display name while preserving every workout record and the original names as aliases.
- Detects exact duplicate workout records and can keep the earliest copy while removing redundant copies.
- Creates a Google Drive backup before every cleanup operation.
- Provides session undo for the most recent cleanup action.

## Prevention
- Activity dropdowns now deduplicate canonical names before display.
- Workout activity names are normalized before saving.
- Save Workout disables immediately and shows Saving… while writing.
- Each workout submission receives one transaction ID.
- Likely identical entries trigger a confirmation before another copy is saved.

## Testing focus
1. Open Settings → Data Integrity.
2. Merge `stair climber` and `Stair Climber`.
3. Confirm only `Stair Climber` remains in the Fitness library and old workout history is preserved.
4. Review any exact duplicate workout group and keep one.
5. Use Undo last cleanup and verify the records return.
