# ZEKE v0.43.2 Mobile-First Rebuild — Patch Test Report

## Static checks performed
- Patch file set created successfully.
- `index.html` references both new mobile-first assets after the older mockup-fidelity layer.
- Version/build are internally consistent at v0.43.2 / 2026.08.17.2.
- Service-worker cache name is bumped and includes the new CSS and JS.
- Mobile CSS is fully scoped to max-width 760px except the 390px refinement.
- Generic `.fitness-insight-card` and `.fitness-goals-panel` are suppressed only on the mobile Fitness route.
- Mobile exercise action bar and direct-entry action bars are positioned above the persistent bottom navigation plus iOS safe area.
- Form-guide details are collapsed by the new JS on first insertion; content is not deleted.
- Desktop app code (`assets/app.js`) is not modified by this patch.

## Device acceptance still required
This environment cannot render the live GitHub Pages site as an iPhone browser. Verify on the actual phone:
1. Home hierarchy/density resembles approved mockup.
2. Fitness shows Library / My exercises / Workouts and no A1c insight.
3. Canonical exercise charts retain separate variation series.
4. Exercise form guide is collapsed initially and expands normally.
5. Save/Submit/Done remains fully visible above ZEKE bottom navigation in every mobile sheet/logger.
6. No content is hidden behind Safari or ZEKE navigation chrome.
7. Health and desktop workflows retain all functionality.
