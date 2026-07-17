# ZEKE v0.17.7 Test Guide

## Install
Replace the files listed in `FILES_TO_REPLACE_v0.17.7.txt`, then hard-refresh ZEKE. The build label should read `v0.17.7 · build 2026.07.17.3`.

## Activity cleanup
- Go to Settings → Data Integrity.
- Confirm duplicate groups are shown for capitalization variants.
- Select Preview & merge. ZEKE must show the aliases and number of affected workout records before proceeding.
- After merging, Fitness should show one canonical card and the workout history should remain present.

## Exact duplicate workouts
- Use Review & keep one on an exact duplicate group.
- Confirm ZEKE creates a backup and removes only the redundant copies.

## Undo
- Select Undo last cleanup.
- Confirm the immediately previous cleanup is reversed.

## Duplicate prevention
- Open Log Workout and submit once. The button must immediately become disabled and read Saving….
- Re-enter identical values for the same date. ZEKE should ask whether to save the likely duplicate.
- Confirm the activity dropdown contains only one spelling/case variant for each activity.
