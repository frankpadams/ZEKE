# ZEKE v0.43.3 — Mobile Mockup Fidelity Rebuild PATCH

This replaces the unsuccessful v0.43.2 mobile overlay.

## Why v0.43.2 felt wrong

It was still primarily a CSS treatment of the existing mobile layout. Worse, it set the existing sidebar to `display:none`, while the app's **More** button works by adding `body.nav-open` to reveal that sidebar. That is why More became unresponsive.

## v0.43.3 design source

This pass is explicitly reverse-engineered from the approved Aug 18 mobile mockup collages:
- Dashboard/Home: dark greeting header, Timeline Snapshot first, compact Health card, persistent 5-item bottom navigation.
- Fitness: purpose-built tab bar, search-first canonical exercise library, compact canonical cards with variation-specific lines and legend.
- Exercise detail: focused full-screen surface instead of an infinitely expanding desktop card.
- Logging/PT: sheet/full-screen forms, concise form guide, persistent safe Save controls.
- More: real side drawer using the existing ZEKE navigation and functionality.

## Important functional fixes

- **More works again.** The existing sidebar is preserved and styled as the mockup drawer; the More click has a capture-phase reliability handler.
- Generic A1c/glucose relationship insight is suppressed on the mobile Fitness root.
- Save/Submit action bars sit above the ZEKE bottom navigation and iOS safe-area.
- Exercise form guides collapse initially rather than consuming the entire screen.
- Splash/loading page always visibly includes version and build.

## Install

Copy these files over the matching paths in the deployed ZEKE site. If v0.43.2 files are present, this version no longer references them, so they can be removed later.

After deployment, hard-refresh once on iPhone Safari to activate the new service-worker cache.
