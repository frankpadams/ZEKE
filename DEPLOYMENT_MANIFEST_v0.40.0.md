# ZEKE v0.40.0 Deployment Manifest

**Build:** 2026.08.03.1

## Recommended deployment

Replace the complete contents of the GitHub Pages repository with the contents of this package. Do not select files solely by modification date.

## Required runtime files

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `version.js`
- `zeke-config.js`
- `xlsx-bundle.js`
- `assets/styles.css`
- `assets/data-layer.js`
- `assets/parser.js`
- `assets/ai-router.js`
- `assets/workflow-engine.js`
- `assets/exercise-guides.js`
- `assets/knowledge-base.js`
- `assets/integrity-engine.js`
- `assets/app.js`
- `assets/branding/zeke-mark-provisional.png`

## Post-deployment checks

1. Startup displays **v0.40.0 · build 2026.08.03.1** on mobile and desktop.
2. Hard refresh once after GitHub Pages finishes deploying.
3. Verify the dashboard shows the lighter v0.40 composition.
4. Connect Google Drive and verify the repository loads.
5. Open the dashboard review card / Data Integrity route.
6. Review every proposed repair; do not batch-approve unfamiliar items.
7. Confirm an integrity backup is created before the first approved repair.
8. Verify repaired records no longer affect current charts/insights and remain visible in audit history.

## Cache behavior

The service worker uses `project-zeke-v0.40.0-20260803.1` and deletes earlier `project-zeke-*` caches on activation. A mixed runtime set is unsupported.
