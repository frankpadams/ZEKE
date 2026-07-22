# ZEKE Architecture — Current v0.26.1 Baseline

**Build:** 2026.07.22.2  
**Release:** Fitness Navigation & Evidence Hotfix

## Authoritative runtime

ZEKE remains a directly editable static web application with no compilation step. The active runtime is `index.html`, `version.js`, `assets/app.js`, `assets/data-layer.js`, `assets/parser.js`, `assets/ai-router.js`, `assets/workflow-engine.js`, `assets/styles.css`, `xlsx-bundle.js`, and `sw.js`. `index.html` is authoritative for load order.

Historical hashed bundles and root-level legacy app/style files are not loaded and must not be edited as current source.

## Core boundary

ZEKE is a private, user-owned personal-management system. Raw inputs, provenance, corrections, and canonical records remain distinguishable. Missing data stays unknown. AI proposes; deterministic code and required user confirmation commit.

Durable personal content belongs in the user-owned repository. Device-local storage is limited to operational/UI continuity unless a future mode is explicitly chosen. The current user profile and goals are stored through provider-backed preferences/factors rather than as code or a local-only personal database.

## Information architecture

- **Dashboard:** current state plus prioritized intelligence; a daily briefing rather than a copy of every module.
- **Health:** umbrella for measurements, vitals, sleep, symptoms/life context, medications/supplements, labs, nutrition, conditions, and relevant personal/family context.
- **Fitness:** process domain for workouts, activities, progression, plans, goals, equipment, and memberships.
- **Discover:** broader patterns, hypotheses, research connections, and “I’ve been thinking…” exploration.
- **Documents:** safe import entry and provenance-oriented import history.
- **Questions for You:** conversational clarification and remembered context, not an administrative queue.

## Dashboard composition

The desktop flow is:
1. Health at a Glance
2. Today’s Actions | Coach’s Eye | Upcoming
3. full-width Trends & Analysis
4. supporting private summary and Recent Health Record

Health at a Glance is selected from Health. If nothing is pinned, the most-used verified metrics are shown. Individual Fitness exercises do not become Dashboard health tiles.

Coach’s Eye contains zero to three actionable recommendations. Trends & Analysis describes changes without implying intervention and expands inline with confidence and limitations.

## Record and workflow behavior

- Talk to ZEKE and focused forms create compatible event structures and use the same duplicate, provenance, confirmation, correction, and audit boundaries.
- Sleep records use the wake-up date as both `event_date` and `wake_date`; Recent Health Record recognizes sleep atomically.
- Remove actions use reversible event undo rather than silent deletion.
- Activity fields are schema-sensitive. Strength, stair/cardio, walking/distance, rehabilitation, mobility, recovery, sport, and functional activity views suppress irrelevant columns.
- Activity identity and activity metrics remain distinct. Stair steps, ambulatory steps, and distance are not interchangeable.
- Monthly medication review records completion as a preference; it never marks individual doses complete.
- Medication action completion requires a same-local-day confirmed taken event. Missed and not-yet-taken remain explicit non-completion states.
- Medication backfill is a reviewed batch transaction: generate matching dates, preview, skip matching existing events, write with shared batch provenance, and retain an undo path.
- Goals are provider-backed factors. Deterministic structure review is always available. Connected-AI goal review is advisory, cannot commit changes, and cannot imply medical clearance.

## Profile storage

`system/preferences.json` (or the equivalent connected provider object) is the authoritative home for the current user profile. A legacy `zeke-user-profile` local key is read only for one-time migration, saved to connected preferences, and then removed when migration succeeds.

## Render and form continuity

Root re-rendering preserves editable controls inside `#root`. Direct-entry overlays are outside the replaced root and retain their live values; stale render snapshots are not restored into those overlays. This prevents delayed asynchronous refreshes from clearing in-progress modal entry.

## Mobile boundary

The v0.25.2 direct Save Workout handler, form-submit fallback, compatibility transaction ID, and visible error state remain protected. v0.26 avoids swipe-only interactions and prevents mobile form zoom by keeping form controls at 16 px. A broader session-based mobile redesign remains deferred until user-reviewed mockups exist.

## Verification boundary

Local package verification cannot establish live credentials, Google Drive/Calendar behavior, AI provider behavior, deployed service-worker replacement, protected real-workbook results, or physical-device accessibility. Those remain environment verification items.


## v0.26.1 interaction stabilization

Activity Library category selection is presentation state: every fresh application load begins at Favorites, while a user’s current in-session selection may survive ordinary rerenders. Dashboard native disclosures have explicit in-memory open-state tracking. Evidence navigation requires exact context and may show an honest insufficient-data state rather than substituting another pattern.
