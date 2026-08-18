# ZEKE v0.43.2 — Mobile-First Interface Rebuild PATCH

Baseline: the current GitHub `main` build identified as ZEKE v0.43.1 / build 2026.08.17.1.

This is an overlay patch, not a full repository archive. Copy these files over the matching paths in the v0.43.1 site.

## What this changes

- Removes generic Fitness Insights (including A1c/glucose relationship cards) from the mobile Fitness root.
- Removes Goals from the mobile Fitness root; the Fitness landing screen is training-first.
- Adds a purpose-built mobile Fitness tab strip: Library / My exercises / Workouts.
- Re-composes Fitness cards and workout history for phone density instead of desktop-card stacking.
- Makes Dashboard metric tiles compact instead of full-width giant cards.
- Puts Timeline ahead of the large Health-at-a-Glance block on mobile.
- Collapses exercise form-guide detail by default; visual/form guidance remains one tap away.
- Fixes the mobile action-bar collision systemically: exercise Save/Done and sheet/form actions sit above the persistent ZEKE bottom navigation and iOS safe area.
- Adds extra scroll padding so the last controls cannot end underneath fixed navigation/action chrome.
- Leaves desktop behavior and shared ZEKE data/business logic unchanged.

## Files

- `index.html`
- `version.js`
- `VERSION.txt`
- `sw.js`
- `assets/mobile-first-rebuild-v0432.css` (new)
- `assets/mobile-first-rebuild-v0432.js` (new)

## Important

The existing `assets/mobile-mockup-fidelity-v044.css/js` remain in place and load first. This new mobile-first layer loads after them and deliberately supersedes piecemeal rules where necessary.

After deployment, hard refresh once on iPhone/Safari so the updated service-worker cache is activated.
