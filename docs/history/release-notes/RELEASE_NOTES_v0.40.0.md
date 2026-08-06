# ZEKE v0.40.0 Release Notes

**Build:** 2026.08.03.1  
**Release label:** Trust, Mobile, Dashboard & Fitness Milestone

## Data integrity and repair

- New dashboard review status and Repair Center.
- Detects supported exact duplicates, known spreadsheet legend artifacts, implausible sleep, zero-as-missing heart rate, malformed paddling fields, answered medication questions, duplicate discoveries, and stale sparse-data discoveries.
- Shows the real-world issue, evidence, recommendation, and confidence before action.
- Creates a provider-backed integrity backup before approved mutations.
- Preserves provenance and correction history; does not invent missing values.
- Adds in-session undo and duplicate-write prevention.

## Dashboard and mobile

- New lighter dashboard composition based on the approved mockup.
- Story cards, Health at a Glance, weekly expectations, Coach’s Eye, truthful recent activity, and review status.
- Visuals use recorded points only; routes and trends are omitted when unsupported.
- Mobile-wide responsive navigation and quick logging; no separate gym-only application.
- Touch-friendly modals, sticky actions, clear completion/exit paths, and direct form-guide access.

## Fitness knowledge and planning

- 102 equipment-aware exercise/activity knowledge objects.
- 12 built-in routine templates.
- Weekly planner asks expected remaining gym and home sessions without inferring commitment from an open calendar.
- Activity-specific fields distinguish strength, cardio, sport, rehab, mobility, recovery, and functional activities.
- Machine, Bowflex, dumbbell, barbell, Smith, cable, and bodyweight variations remain distinct.
- “Glute Lift” is retained as a separate machine identity rather than being merged into Leg Press; exact machine style can be confirmed later.
- Rich guides include setup, movement, mistakes, breathing, mind-muscle cues, modifications, evidence metadata, and source/license media where available.

## Deployment

Replace the complete verified runtime set rather than selecting files by modification date. The service-worker cache is `project-zeke-v0.40.0-20260803.1`. See `DEPLOYMENT_MANIFEST_v0.40.0.md`.

## Known limitations

- Live Google Drive repair and physical-device acceptance require deployment testing.
- Remote exercise images require network access and may become unavailable; written fallbacks remain.
- Deep manual curation is strongest for the high-use core set; lower-priority objects need ongoing evidence review.
- Advanced periodization, watch interfaces, and additional storage providers remain future work.
