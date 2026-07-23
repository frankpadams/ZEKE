# Iteration Record — v0.28.1

**Build:** 2026.07.23.0418

## Authorization

The user explicitly asked to add the previously omitted licensed photos and exercise-specific Form Guide content to the v0.28.0 package, and reiterated the standing requirement to preserve structure and honest modification dates.

## Approved scope

- Add licensed photographs to the existing exercise Form Guide bottom sheet
- Add useful exercise-specific Setup, Movement, Common Mistakes, and Tips content
- Preserve the v0.28.0 workout-program and backend data-storage behavior
- Maintain the existing file and directory structure
- Preserve original modification timestamps for unchanged files and use real modification timestamps for changed or new files
- Represent unavailable or unmatched guide content honestly rather than fabricating completeness

## Implemented

- Added 17 reviewed exercise-specific guide records in `assets/exercise-guides.js`.
- Added target muscles, equipment, level, Setup, Movement, Common Mistakes, Tips, and a clear safety boundary.
- Added licensed/public-domain photography with visible creator, source, and license links.
- Replaced the generic placeholder with a data-driven tabbed bottom sheet.
- Added an explicit photo-unavailable state and a truthful unmatched-exercise fallback.
- Kept the v0.28.0 workout-program and backend save routes unchanged.
- Preserved the existing package layout.

## Media boundary

Photos are loaded at runtime from Wikimedia Commons rather than embedded in the ZIP. This release does not claim offline photo availability. Written guide content remains local.

## Data placement unchanged from v0.28.0

- Custom programs: connected preferences repository under `workout_programs`.
- Confirmed exercise performance: workout event records.
- Finished session summary: `workout_session` event record.
- In-progress workout draft: session-only browser state.
- Blank fields: null/unknown, never silently coerced to zero.
