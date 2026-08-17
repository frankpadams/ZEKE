# ZEKE Deployment / Replacement History

Historical file-replacement and upload instructions retained for traceability. Current deployment instructions live in README_DEPLOY.md.


---

## Current candidate status — v0.43.0 RC2.1

**Build:** 2026.08.16.3  
**Deployment status:** Not promoted/deployed by this package-generation step.

RC2.1 is a continuity-reconciled release candidate. Use the full package as the replacement unit when/if deployment is approved; do not selectively copy files by timestamp. Final promotion still requires the release gates in `DEVELOPMENT_MEMORY/RELEASE_GATE.md`.

---


## Historical source: `FILES_TO_REPLACE_v0.17.7.txt`

Replace these files in the ZEKE repository:

index.html
version.js
assets/app.js
assets/data-layer.js
assets/styles.css

Optional documentation:
RELEASE_NOTES_v0.17.7.md
TEST_GUIDE_v0.17.7.md


---

## Historical source: `DEPLOYMENT_MANIFEST_v0.40.0.md`

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


---

## Historical source: `FILES_TO_REPLACE_v0.40.0.txt`

ZEKE v0.40.0 / build 2026.08.03.1

Recommended: replace the complete repository contents.

Minimum verified runtime set:
index.html
manifest.webmanifest
sw.js
version.js
zeke-config.js
xlsx-bundle.js
assets/styles.css
assets/data-layer.js
assets/parser.js
assets/ai-router.js
assets/workflow-engine.js
assets/exercise-guides.js
assets/knowledge-base.js
assets/integrity-engine.js
assets/app.js
assets/branding/zeke-mark-provisional.png


---

## Historical source: `FILES_TO_REPLACE.txt`

ZEKE v0.40.0 / build 2026.08.03.1

Recommended: replace the complete repository contents.

Minimum verified runtime set:
index.html
manifest.webmanifest
sw.js
version.js
zeke-config.js
xlsx-bundle.js
assets/styles.css
assets/data-layer.js
assets/parser.js
assets/ai-router.js
assets/workflow-engine.js
assets/exercise-guides.js
assets/knowledge-base.js
assets/integrity-engine.js
assets/app.js
assets/branding/zeke-mark-provisional.png


---

## Historical source: `UPLOAD_THESE_FILES.txt`

ZEKE v0.40.0 · build 2026.08.03.1

Upload the complete package contents to the repository root. Do not upload only files that appear newer by timestamp. Verify version/build at startup after GitHub Pages deploys.

See DEPLOYMENT_MANIFEST_v0.40.0.md and BUILD_MANIFEST_v0.40.0.json.
