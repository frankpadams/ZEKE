# ZEKE v0.28.1 — Exercise-Specific Form Guides

Build: 2026.07.23.0418

## Added

- Added a reviewed, exercise-specific Form Guide library for 17 common strength and cardio activities.
- Each reviewed guide now includes targets, equipment, level, setup, movement, common mistakes, practical cues, and a safety boundary.
- Replaced the generic placeholder panel with a real tabbed bottom sheet that keeps the user inside the exercise screen.
- Added licensed or public-domain photographs with visible creator, source, and license attribution.
- Added a clear offline/image-load fallback rather than silently leaving a broken image.
- Added a truthful fallback for unmatched custom exercises; it does not present generic content as reviewed for the exact exercise.

## Media delivery

The photographs are referenced from Wikimedia Commons rather than copied into this ZIP. This keeps the release small and preserves the source/license link beside each image, but the photos require an internet connection. Written guides remain available when offline.

## Safety boundary

Form Guides are educational. They are not diagnosis, medical clearance, physical therapy, or individualized rehabilitation. Injury-aware programs remain conservative planning examples and must respect clinician restrictions.

## Data and structure

No workout-storage schema or directory was changed in this patch. Confirmed entries continue to use the v0.28.0 event-ledger and connected-preferences paths. Blank values remain null/unknown rather than zero.
