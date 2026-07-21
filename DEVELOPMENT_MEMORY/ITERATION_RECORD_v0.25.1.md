# Iteration Record — ZEKE v0.25.1

Build: 2026.07.21.3

## Purpose
Correct visible regressions introduced in v0.25.0 and restore trust, hierarchy, and clarity.

## Approved changes
- Remove Provider View until it has a distinct, validated use case.
- Keep Dashboard as the single health overview.
- Add medications and diagnoses/conditions in privacy-collapsed Dashboard sections.
- Default Fitness to Favorites, with a transparent most-used fallback.
- Replace generic evidence navigation and internal identifiers with contextual evidence review.
- Rename activity-definition actions to “Create activity type.”
- Correct active version and cache references.

## Data impact
No destructive migration. Existing records and activity favorites remain intact.

- Restore regressed v0.24 visual and trust behavior
- Remove Provider View until a distinct use case exists
- Make evidence links contextual and specific
- Clarify Create activity type wording
- Add privacy-collapsed medications and diagnoses to Dashboard
- Correct visible versioning
