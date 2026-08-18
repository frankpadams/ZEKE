# ZEKE v0.44.0 — Mobile Mockup Reconstruction

This is not another responsive-style patch.

On phone widths, ZEKE now creates a dedicated mobile application surface reconstructed from the approved `ZEKE fitness app design mockup.png`. The existing ZEKE page remains alive underneath as the state/data/business-logic source, so the reconstruction can use existing storage and handlers rather than forking the data model.

## Mobile architecture agreed with the user

Primary navigation:
- Dashboard
- Fitness
- Health

Fitness contains both the gym-optimized training workflow and the complete exercise/progress experience. Calendar, Questions, Discover, Documents, medications and Settings are secondary navigation.

## Mockup reconstruction

Dashboard:
- navy ZEKE header
- compact Today at a glance metrics
- compact Today’s Actions
- concise Coach’s Eye
- large teal Log exercise or activity action
- three-item primary bottom navigation

Logging:
- mockup-style bottom sheet
- Enter one exercise or activity
- Start from routine
- Repeat last workout

Fitness:
- gym-optimized hero/start controls
- Train / Exercises / Progress
- searchable exercise library
- compact progress cards
- exercise variations represented as pills from the underlying variation legend

Health:
- clean phone metric grid
- direct access to Health library, Questions for You and health logging

Secondary navigation:
- Talk to ZEKE
- Questions for You
- Calendar
- Discover
- Documents
- Medications & supplements
- Settings

## Version requirement

Both the original startup HTML and the dedicated mobile startup surface visibly show:
- v0.44.0
- build 2026.08.17.5

## Important implementation note

This patch assumes the existing v0.43.x runtime files (`assets/app.js`, data layer, knowledge base, etc.) remain present. It replaces the mobile presentation, not the data/runtime foundation.
